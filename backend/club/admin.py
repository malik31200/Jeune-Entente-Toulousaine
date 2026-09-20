from django.contrib import admin
from django.core.management import call_command
from django.contrib import messages
from django.shortcuts import redirect
from django.urls import reverse
from django.utils import timezone
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
    list_display_links = ['name']
    list_editable = ['order']
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

class NeedsScoreFilter(admin.SimpleListFilter):
    title = 'match à mettre à jour'
    parameter_name = 'a_traiter'

    def lookups(self, request, model_admin):
        return [('oui', 'Oui — date passée, score manquant')]

    def queryset(self, request, queryset):
        if self.value() == 'oui':
            return queryset.filter(home_score__isnull=True, date__lt=timezone.now())
        return queryset


class SeasonFilter(admin.SimpleListFilter):
    """Une saison de foot va d'août à juillet de l'année suivante."""
    title = 'saison'
    parameter_name = 'saison'

    def lookups(self, request, model_admin):
        now = timezone.now()
        current_start_year = now.year if now.month >= 8 else now.year - 1
        return [
            (str(current_start_year - offset), f'{current_start_year - offset}/{current_start_year - offset + 1}')
            for offset in range(0, 3)
        ]

    def queryset(self, request, queryset):
        if self.value():
            start_year = int(self.value())
            tz = timezone.get_current_timezone()
            start = timezone.datetime(start_year, 8, 1, tzinfo=tz)
            end = timezone.datetime(start_year + 1, 8, 1, tzinfo=tz)
            return queryset.filter(date__gte=start, date__lt=end)
        return queryset


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['home_team', 'away_team', 'home_score', 'away_score', 'status', 'date', 'team', 'competition']
    list_display_links = ['home_team', 'away_team']
    list_editable = ['status', 'home_score', 'away_score']
    list_filter = [NeedsScoreFilter, SeasonFilter, 'team', 'status']
    search_fields = ['home_team', 'away_team', 'competition']
    ordering = ['-date']
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

    def has_add_permission(self, request):
        # Un seul objet de configuration doit exister.
        return not SiteSettings.objects.exists()

    def changelist_view(self, request, extra_context=None):
        # Un seul objet : on saute la liste et on ouvre directement le formulaire.
        obj = SiteSettings.objects.first()
        if obj:
            return redirect(reverse('admin:club_sitesettings_change', args=[obj.pk]))
        return super().changelist_view(request, extra_context)


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