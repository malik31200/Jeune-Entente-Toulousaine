from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Article(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    content = models.TextField()
    image = models.ImageField(upload_to='articles/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    published_date = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering =['-published_date']


class Team(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='teams/', blank=True, null=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['order']


class Player(models.Model):
    POSITION_CHOICES = [
        ('GK', 'Gardien'),
        ('DEF', 'Défenseur'),
        ('MID', 'milieu'),
        ('FWD', 'Attaquant'),
    ]
    PAYMENT_CHOICES = [
        ('especes', 'Espèces'),
        ('cheque', 'Chèque'),
        ('virement', 'Virement'),
        ('cb', 'Carte Bancaire'),
        ('autre', 'Autre'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='players/', blank=True, null=True)
    position = models.CharField(max_length=3, choices=POSITION_CHOICES)
    jersey_number = models.IntegerField()
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players')
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    license_paid = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, blank=True)
    payment_date = models.DateField(null=True, blank=True)
    license_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    class Meta:
        ordering = ['last_name']
        verbose_name = "Joueur"
        verbose_name_plural = "Joueurs"


class TrainingSchedule(models.Model):
    DAY_CHOICES = [
        ('Lundi', 'Lundi'), ('Mardi', 'Mardi'), ('Mercredi', 'Mercredi'),
        ('Jeudi', 'Jeudi'), ('Vendredi', 'Vendredi'), ('Samedi', 'Samedi'),
        ('Dimanche', 'Dimanche'), 
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.team} - {self.day_of_week} {self.start_time}"
    
    class Meta:
        verbose_name = "Horaire d'entraînement"
        verbose_name_plural = "Horaires d'entraînement"

    

class Match(models.Model):
    STATUS_CHOICES = [
        ('TERMINE', 'Terminé'),
        ('A_VENIR', 'À venir'),
        ('EN_COURS', 'En cours'),
    ]

    date = models.DateTimeField()
    home_team = models.CharField(max_length=200)
    away_team = models.CharField(max_length=200)
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    competition = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    is_home = models.BooleanField(default=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='A_VENIR')
    scraped_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.home_team} vs {self.away_team} ({self.date.strftime('%d/%m/%Y')})"
    
    class Meta:
        ordering = ['-date']


class TeamStats(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='stats')
    season = models.CharField(max_length=20)
    competition = models.CharField(max_length=200)
    matches_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    goals_for = models.IntegerField(default=0)
    goals_against = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    ranking = models.IntegerField(default=0)
    form = models.CharField(max_length=5, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.team} - {self.season}"
    
    class Meta:
        verbose_name = "Statistiques équipe"
        verbose_name_plural = "Statistiques équipes"


    

class Sponsor(models.Model):
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='sponsors/')
    website_url = models.URLField(blank=True, null=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['order']


class SiteSettings(models.Model):
    shop_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    contact_email = models.EmailField()

    def __str__(self):
        return "Configuration du site"
    
    class Meta :
        verbose_name = "Configuration du site"
        verbose_name_plural = "Configuration du site"