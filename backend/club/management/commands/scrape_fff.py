import requests
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from club.models import Team, Match


FFF_CLUB_ID = 11641
FFF_SEASON = 2025

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


class Command(BaseCommand):
    help = 'Scrape les matchs de la Jeune Entente Toulousaine depuis l\'API FFF'

    def handle(self, *args, **kwargs):
        self.stdout.write('Démarrage du scraping FFF...')

        created = 0
        updated = 0
        page = 1
        base_url = 'https://api-dofa.fff.fr'
        next_url = f'/api/clubs/{FFF_CLUB_ID}/matchs?sa_no={FFF_SEASON}'

        while next_url:
            self.stdout.write(f'Page {page}...')

            try:
                response = requests.get(base_url + next_url, timeout=10)
                response.raise_for_status()
                data = response.json()
            except requests.RequestException as e:
                self.stderr.write(f'Erreur API FFF : {e}')
                return
        
            matchs = data.get('hydra:member', [])
            
            for match_data in matchs:
                result = self.process_match(match_data)
                if result == 'created':
                    created += 1
                elif result == 'updated':
                    updated += 1

            next_url = data.get('hydra:view', {}).get('hydra:next')
            page += 1

        self.stdout.write(self.style.SUCCESS(
            f'Terminé : {created} créés, {updated} mis à jour.'
        ))

    def process_match(self, data):
        home = data.get('home', {})
        away = data.get('away', {})
        competition = data.get('competition', {})

        if not home or not away:
            return None
        
        home_name = home.get('short_name', '')
        away_name = away.get('short_name', '') if away else 'À définir'
        home_club = home.get('club', {})
        away_club = away.get('club', {}) if away else {}
        
        is_home = home_club.get('cl_no') == FFF_CLUB_ID
        our_team_data  = home if is_home else away
        category_code = our_team_data.get('category_code', '')
        team_code = our_team_data.get('code', 1)
        competition_name = competition.get('name', '') if competition else ''
        team = self.get_or_create_team(category_code, competition_name, team_code)
        if not team:
            return None
        
        date_str = data.get('date')
        time_str = data.get('time', '00H00')
        match_date = self.parse_date(date_str, time_str)

        home_score = data.get('home_score')
        away_score = data.get('away_score')
        venue = data.get('venue') or {}
        location = venue.get('name', '')

        match_status = self.determine_status(match_date, home_score, away_score)

        match, was_created = Match.objects.update_or_create(
            home_team=home_name,
            away_team=away_name,
            date=match_date,
            defaults={
                'team': team,
                'home_score': home_score,
                'away_score': away_score,
                'competition': competition_name,
                'location': location,
                'is_home': is_home,
                'status': match_status,
                'scraped_at': timezone.now(),
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
            self.stdout.write(f'Catégorie inconnue : {category_code} ({competition_name})')
            return None

        team, _ = Team.objects.get_or_create(
            name=team_name,
            defaults={'category': category_code, 'order': 0}
        )
        return team
    
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
