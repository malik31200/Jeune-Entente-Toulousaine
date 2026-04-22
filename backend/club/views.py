from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import Article, Team, TrainingSchedule, Match, TeamStats, Sponsor, SiteSettings
from .serializers import (ArticleSerializer, TeamSerializer, TrainingScheduleSerializer,
                          MatchSerializer, TeamStatsSerializer, SponsorSerializer,
                          SiteSettingsSerializer)


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleSerializer
    lookup_field = 'slug'


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer


class TrainingScheduleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TrainingSchedule.objects.filter(is_active=True)
    serializer_class = TrainingScheduleSerializer

class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

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

    def get_queryset(self):
        queryset = TeamStats.objects.all()
        team_id = self.request.query_params.get('team')   

        if team_id:
            queryset = queryset.filter(team_id=team_id)
        return queryset
    

class SponsorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sponsor.objects.filter(is_active=True)
    serializer_class = SponsorSerializer


class SiteSettingsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer


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

