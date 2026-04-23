from rest_framework import serializers
from .models import Article, Team, TrainingSchedule, Match, TeamStats, Sponsor, SiteSettings


class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'content', 'image', 'video_url',
                  'author_name', 'published_date', 'is_published']

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return None
    

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'category', 'description', 'image', 'order', 'cp_no', 'phase_no', 'poule_no']


class TrainingScheduleSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model = TrainingSchedule
        fields = ['id', 'team', 'team_name', 'day_of_week', 'start_time',
                  'end_time', 'location', 'is_active']


class MatchSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'date', 'home_team', 'away_team', 'home_score',
                  'away_score', 'competition', 'location', 'is_home',
                  'team', 'team_name', 'status']


class TeamStatsSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model = TeamStats
        fields = ['id', 'team', 'team_name', 'season', 'competition', 'matches_played',
                  'wins', 'draws', 'losses', 'goals_for', 'goals_against',
                  'points', 'ranking', 'form', 'updated_at']
        

class SponsorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = ['id', 'name', 'logo', 'website_url', 'order']


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ['shop_url', 'facebook_url', 'instagram_url', 'twitter_url',
                    'youtube_url', 'contact_email']