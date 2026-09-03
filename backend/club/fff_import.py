"""Logique commune de transformation d'un match FFF (JSON hydra) en objet Match.

Partagée entre :
- la commande de scraping automatique (scrape_fff), qui appelle l'API FFF
  directement depuis le serveur ;
- l'import manuel (import_fff_manual), utilisé quand l'API bloque les
  requêtes automatisées (403 Akamai) et qu'on doit coller un JSON récupéré
  depuis un vrai navigateur.
"""
from datetime import datetime
from django.utils import timezone
from club.models import Team, Match

CATEGORY_TO_TEAM = {
    'SEM': 'Seniors',
    'U19': 'U19',
    'U18': 'U18',
    'U18F': 'U18 Féminines',
    'U17': 'U17',
    'U16': 'U16',
    'U15': 'U15',
    'U15F': 'U15 Féminines',
    'U14': 'U14',
    'SEF': 'Féminines',
    'SESM': 'Futsal',
}


class FFFMatchImporter:
    def __init__(self, club_id, log=None):
        self.club_id = club_id
        self.log = log or (lambda msg: None)

    def process_match(self, data):
        home = data.get('home', {})
        away = data.get('away', {})
        competition = data.get('competition', {})

        if not home or not away:
            return None

        home_name = home.get('short_name', '')
        away_name = away.get('short_name', '') if away else 'À définir'
        home_club = home.get('club', {}) or {}
        away_club = away.get('club', {}) or {}

        is_home = home_club.get('cl_no') == self.club_id
        is_away = away_club.get('cl_no') == self.club_id
        if not is_home and not is_away:
            # Ce match ne concerne pas notre club (ex: liste complète d'une
            # poule récupérée manuellement, qui contient aussi les matchs
            # entre d'autres équipes).
            return None
        our_team_data = home if is_home else away
        category_code = our_team_data.get('category_code', '')
        team_code = our_team_data.get('code', 1)
        competition_name = competition.get('name', '') if competition else ''
        phase = data.get('phase', {})
        poule = data.get('poule', {})
        team = self.get_or_create_team(category_code, competition_name, team_code)
        if not team:
            return None
        self.update_team_classement(team, competition, phase, poule)

        date_str = data.get('date')
        time_str = data.get('time', '00H00')
        match_date = self.parse_date(date_str, time_str)

        home_score = data.get('home_score')
        away_score = data.get('away_score')
        # Selon l'endpoint FFF utilisé, le lieu s'appelle "venue" ou "terrain"
        venue = data.get('venue') or data.get('terrain') or {}
        location = venue.get('name', '')

        match_status = self.determine_status(match_date, home_score, away_score)

        ma_no = data.get('ma_no')
        match, was_created = Match.objects.update_or_create(
            ma_no=ma_no,
            defaults={
                'team': team,
                'home_team': home_name,
                'away_team': away_name,
                'date': match_date,
                'home_score': home_score,
                'away_score': away_score,
                'competition': competition_name,
                'location': location,
                'is_home': is_home,
                'status': match_status,
            }
        )

        return 'created' if was_created else 'updated'

    def get_or_create_team(self, category_code, competition_name, team_code):
        comp = competition_name.upper()

        if 'U16' in comp:
            team_name = 'U16'
        elif 'U14' in comp:
            team_name = 'U14'
        elif category_code == 'SEM' and team_code == 2:
            team_name = 'Seniors 2'
        else:
            team_name = CATEGORY_TO_TEAM.get(category_code)

        if not team_name:
            self.log(f'Catégorie inconnue : {category_code} ({competition_name})')
            return None

        team, _ = Team.objects.get_or_create(
            name=team_name,
            defaults={'category': category_code, 'order': 0}
        )
        return team

    def update_team_classement(self, team, competition, phase, poule):
        cp_no = str(competition.get('cp_no', '')) if competition else ''
        phase_no = phase.get('number', 1) if phase else 1
        poule_no = poule.get('stage_number', 1) if poule else 1
        if cp_no and team.cp_no != cp_no:
            Team.objects.filter(pk=team.pk).update(cp_no=cp_no, phase_no=phase_no, poule_no=poule_no)
            team.cp_no = cp_no

    def parse_date(self, date_str, time_str='00H00'):
        if not date_str:
            return timezone.now()
        try:
            dt = datetime.fromisoformat(date_str)
            if time_str:
                parts = time_str.replace('H', ':').split(':')
                hour = int(parts[0])
                minute = int(parts[1]) if len(parts) > 1 else 0
                dt = dt.replace(hour=hour, minute=minute)
            return dt
        except (ValueError, TypeError):
            return timezone.now()

    def determine_status(self, match_date, home_score, away_score):
        if home_score is not None and away_score is not None:
            return 'TERMINE'
        if match_date and match_date < timezone.now():
            return 'TERMINE'
        return 'A_VENIR'
