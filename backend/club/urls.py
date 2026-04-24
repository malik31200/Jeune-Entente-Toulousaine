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
router.register(r'gallery', views.GalleryPhotoViewSet)
router.register(r'team-presentations', views.TeamPresentationViewSet, basename='team-presentations')
router.register(r'detections', views.DetectionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', views.contact_view, name='contact'),
    path('category-page/<str:slug>/', views.category_page_view, name='category-page'),
    path('classement/', views.classement_view, name='classement'),
    path('club-page/', views.club_page_view, name='club-page'),
]
