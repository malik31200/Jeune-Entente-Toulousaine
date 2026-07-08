from django.contrib import admin
from django.core.management import call_command
from django.contrib import messages
from .models import Article, Team, Player, TrainingSchedule, Match, TeamStats, ClassementEntry, Sponsor, SiteSettings, ClubPage, GalleryPhoto, CategoryPage, TeamPresentation, Detection




@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_published', 'published_date']
    list_filter = ['is_published']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'order', 'ranking_api_url']
    list_filter = ['category']
    search_fields = ['name']
    fieldsets = [
        (None, {'fields': ['name', 'category', 'description', 'image', 'order', 'coaches']}),
        ('Classement FFF (API)', {'fields': ['cp_no', 'phase_no', 'poule_no', 'phase_no_2', 'poule_no_2', 'ranking_api_url'], 'classes': ['collapse']}),
    ]


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['last_name', 'first_name', 'team', 'position', 'jersey_number', 'license_paid']
    list_filter = ['team', 'license_paid', 'position']
    search_fields = ['first_name', 'last_name']


@admin.register(TrainingSchedule)
class TrainingScheduleAdmin(admin.ModelAdmin):
    list_display = ['team', 'day_of_week', 'start_time', 'end_time', 'location', 'is_active']
    list_filter = ['team', 'day_of_week', 'is_active']


def scraper_fff_action(modeladmin, request, queryset):
    try:
        call_command('scrape_fff')
        messages.success(request, 'Scraping FFF terminé avec succès !')
    except Exception as e:
        messages.error(request, f'Erreur scraping : {e}')
scraper_fff_action.short_description = '🔄 Lancer le scraping FFF maintenant'

def supprimer_doublons_action(modeladmin, request, queryset):
    from club.models import Match
    deleted, _ = Match.objects.filter(ma_no__isnull=True).delete()
    messages.success(request, f'{deleted} anciens matchs sans ID FFF supprimés.')
supprimer_doublons_action.short_description = '🗑️ Supprimer les anciens matchs en double (sans ID FFF)'

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['home_team', 'away_team', 'date', 'team', 'status', 'home_score', 'away_score']
    list_filter = ['team', 'status']
    search_fields = ['home_team', 'away_team', 'competition']
    actions = [scraper_fff_action, supprimer_doublons_action]


@admin.register(TeamStats)
class TeamStatsAdmin(admin.ModelAdmin):
    list_display = ['team', 'season', 'matches_played', 'wins', 'draws', 'losses', 'points', 'ranking']
    list_filter = ['team', 'season']
    readonly_fields = ['updated_at']


@admin.register(ClassementEntry)
class ClassementEntryAdmin(admin.ModelAdmin):
    list_display = ['name', 'cp_no', 'phase_no', 'poule_no', 'rank', 'pts', 'j', 'updated_at']
    list_filter = ['cp_no']
    search_fields = ['name', 'cp_no']
    ordering = ['cp_no', 'phase_no', 'poule_no', 'rank']

    def has_add_permission(self, request):
        return False


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'is_active']
    list_filter = ['is_active']


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ['contact_email', 'shop_url']


@admin.register(ClubPage)
class ClubPageAdmin(admin.ModelAdmin):
    list_display = ['title', 'updated_at']

    def has_add_permission(self, request):
        return not ClubPage.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False



@admin.register(Detection)
class DetectionAdmin(admin.ModelAdmin):
    list_display = ['team', 'is_active', 'order']
    list_editable = ['is_active', 'order']
    fields = ['team', 'form_url', 'description', 'is_active', 'order']


@admin.register(TeamPresentation)
class TeamPresentationAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'category', 'order']
    list_filter = ['category']
    list_editable = ['order']
    fields = ['category', 'team', 'name', 'image', 'coaches', 'order']


@admin.register(GalleryPhoto)
class GalleryPhotoAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'order', 'created_at']
    list_editable = ['order']
    fields = ['image', 'order']