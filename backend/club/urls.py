from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'articles', views.ArticleViewSet)
router.register(r'teams', views.TeamViewSet)
router.register(r'training-schedules', views.TrainingScheduleViewSet)
router.register(r'matches', views.MatchViewSet)
router.register(r'team-stats', views.TeamStatsViewSet)
router.register(r'sponsors', views.SponsorViewSet)
router.register(r'site-settings', views.SiteSettingsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', views.contact_view, name='contact'),
    path('teams/<int:team_id>/ranking/', views.ranking_proxy, name='ranking_proxy'),
]
