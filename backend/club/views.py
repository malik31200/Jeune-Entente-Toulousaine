from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
import requests as http_requests

FFF_BASE = "https://api-dofa.fff.fr"
CACHE_TIMEOUT = 15 * 60
from .models import Article, Team, TrainingSchedule, Match, TeamStats, Sponsor, SiteSettings, ClubPage
from .serializers import (ArticleSerializer, TeamSerializer, TrainingScheduleSerializer,
                          MatchSerializer, TeamStatsSerializer, SponsorSerializer,
                          SiteSettingsSerializer, ClubPageSerializer)


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleSerializer
    lookup_field = 'slug'


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    pagination_class = None


class TrainingScheduleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TrainingSchedule.objects.filter(is_active=True)
    serializer_class = TrainingScheduleSerializer
    pagination_class = None

class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Match.objects.all()
        team_id = self.request.query_params.get('team')
        status = self.request.query_params.get('status')
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        if status:
            queryset = queryset.filter(status=status)
        return queryset


class TeamStatsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamStats.objects.all()
    serializer_class = TeamStatsSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = TeamStats.objects.all()
        team_id = self.request.query_params.get('team')
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        return queryset


class SponsorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sponsor.objects.filter(is_active=True)
    serializer_class = SponsorSerializer
    pagination_class = None


class SiteSettingsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SiteSettings.objects.all()
    pagination_class = None
    serializer_class = SiteSettingsSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def club_page_view(request):
    page = ClubPage.objects.first()
    if not page:
        return Response({'title': 'Notre Club', 'subtitle': '', 'content': '', 'image': None})
    serializer = ClubPageSerializer(page, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def ranking_proxy(request, team_id):
    try:
        team = Team.objects.get(pk=team_id)
    except Team.DoesNotExist:
        return Response({'error': 'Équipe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if not team.ranking_api_url:
        return Response({'error': 'Pas d\'URL de classement configurée pour cette équipe.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        headers = {'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'}
        resp = http_requests.get(team.ranking_api_url, headers=headers, timeout=8)
        resp.raise_for_status()
        return Response(resp.json())
    except Exception as e:
        return Response({'error': f'Erreur lors de la récupération du classement : {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([AllowAny])
def classement_view(request):
    cp_no = request.query_params.get('cp_no')
    phase = request.query_params.get('phase', '1')
    poule = request.query_params.get('poule', '1')
    if not cp_no:
        return Response({'error': 'cp_no requis'}, status=400)
    cache_key = f"classement_{cp_no}_{phase}_{poule}"
    data = cache.get(cache_key)
    if data is None:
        try:
            base_url = f"{FFF_BASE}/api/compets/{cp_no}/phases/{phase}/poules/{poule}/matchs"
            headers = {'User-Agent': 'Mozilla/5.0'}
            all_matchs = []

            resp = http_requests.get(base_url, params={'page': 1}, headers=headers, timeout=15)
            resp.raise_for_status()
            body = resp.json()

            if isinstance(body, list):
                all_matchs = body
            else:
                all_matchs.extend(body.get('hydra:member', []))
                view = body.get('hydra:view', {})
                last_url = view.get('hydra:last', '')
                import re
                m = re.search(r'page=(\d+)', last_url)
                last_page = int(m.group(1)) if m else 1
                for page in range(2, last_page + 1):
                    r = http_requests.get(base_url, params={'page': page}, headers=headers, timeout=15)
                    r.raise_for_status()
                    page_body = r.json()
                    if isinstance(page_body, list):
                        all_matchs.extend(page_body)
                    else:
                        all_matchs.extend(page_body.get('hydra:member', []))

            data = _compute_classement(all_matchs)
            cache.set(cache_key, data, CACHE_TIMEOUT)
        except Exception as e:
            return Response({'error': str(e)}, status=502)
    return Response(data)


def _compute_classement(matchs):
    teams = {}
    for m in matchs:
        home = m.get('home', {})
        away = m.get('away', {})
        home_cl = home.get('club', {}).get('cl_no')
        away_cl = away.get('club', {}).get('cl_no')
        home_name = home.get('short_name', '')
        away_name = away.get('short_name', '')

        for cl, name in [(home_cl, home_name), (away_cl, away_name)]:
            if cl and cl not in teams:
                teams[cl] = {'cl_no': cl, 'name': name, 'pts': 0, 'j': 0,
                             'g': 0, 'n': 0, 'p': 0, 'bp': 0, 'bc': 0}

        home_score = m.get('home_score')
        away_score = m.get('away_score')
        if home_score is None or away_score is None:
            continue

        teams[home_cl]['j'] += 1
        teams[away_cl]['j'] += 1
        teams[home_cl]['bp'] += home_score
        teams[home_cl]['bc'] += away_score
        teams[away_cl]['bp'] += away_score
        teams[away_cl]['bc'] += home_score

        if home_score > away_score:
            teams[home_cl]['g'] += 1
            teams[home_cl]['pts'] += 3
            teams[away_cl]['p'] += 1
        elif home_score < away_score:
            teams[away_cl]['g'] += 1
            teams[away_cl]['pts'] += 3
            teams[home_cl]['p'] += 1
        else:
            teams[home_cl]['n'] += 1
            teams[away_cl]['n'] += 1
            teams[home_cl]['pts'] += 1
            teams[away_cl]['pts'] += 1

    ranking = sorted(teams.values(),
                     key=lambda t: (-t['pts'], -(t['bp'] - t['bc']), -t['bp']))
    for i, t in enumerate(ranking, 1):
        t['rank'] = i
        t['diff'] = t['bp'] - t['bc']
    return ranking


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_view(request):
    name = request.data.get('name')
    email = request.data.get('email')
    message = request.data.get('message')
    phone = request.data.get('phone', '')
    subject = request.data.get('subject', '')

    if not all([name, email, message]):
        return Response({'error': 'Tous les champs sont requis.'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        settings_obj = SiteSettings.objects.first()
        recipient = settings_obj.contact_email if settings_obj else 'contact@jet.fr'

        body = f'De : {name} <{email}>'
        if phone:
            body += f'\nTéléphone : {phone}'
        if subject:
            body += f'\nSujet : {subject}'
        body += f'\n\n{message}'

        send_mail(
            subject=f'[JET] {subject or "Message"} de {name}',
            message=body,
            from_email=settings.EMAIL_HOST_USER or 'noreply@jet.fr',
            recipient_list=[recipient],
        )
        return Response({'success': 'Message envoyé avec succès.'})
    except Exception as e:
        return Response({'error': 'Erreur lors de l\'envoi.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

