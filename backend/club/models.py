from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from ckeditor.fields import RichTextField


class Article(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    content = RichTextField()
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
    ranking_api_url = models.URLField(blank=True, null=True, verbose_name="URL API classement FFF")
    cp_no = models.CharField(max_length=20, blank=True, null=True, verbose_name="FFF cp_no",
                             help_text="Identifiant compétition (ex: 434763)")
    phase_no = models.IntegerField(default=1, verbose_name="FFF phase")
    poule_no = models.IntegerField(default=1, verbose_name="FFF poule")
    coaches = models.TextField(blank=True, verbose_name="Staff / Coachs",
                               help_text="Un nom par ligne")

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


class ClubPage(models.Model):
    title = models.CharField(max_length=200, default="Notre Club")
    subtitle = models.CharField(max_length=300, blank=True)
    content = RichTextField(blank=True)
    image = models.ImageField(upload_to='club/', blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Page Club"

    class Meta:
        verbose_name = "Page Club"
        verbose_name_plural = "Page Club"


class Detection(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, verbose_name="Équipe",
                             related_name='detections')
    form_url = models.URLField(verbose_name="Lien Google Form")
    description = models.TextField(blank=True, verbose_name="Description (optionnel)")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    order = models.IntegerField(default=0, verbose_name="Ordre")

    def __str__(self):
        return f"Détection {self.team.name}"

    class Meta:
        ordering = ['order']
        verbose_name = "Détection"
        verbose_name_plural = "Détections"


class CategoryPage(models.Model):
    SLUG_CHOICES = [
        ('foot-a-8', 'Foot à 8'),
        ('foot-a-5', 'Foot à 5'),
    ]
    slug = models.CharField(max_length=20, choices=SLUG_CHOICES, unique=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    description = RichTextField(blank=True)
    coaches = models.TextField(blank=True, help_text="Noms des coachs, un par ligne")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return dict(self.SLUG_CHOICES).get(self.slug, self.slug)

    class Meta:
        verbose_name = "Page catégorie (Foot à 8 / Foot à 5)"
        verbose_name_plural = "Pages catégories (Foot à 8 / Foot à 5)"


class TeamPresentation(models.Model):
    CATEGORY_CHOICES = [
        ('foot-a-8', 'Foot à 8'),
        ('foot-a-5', 'Foot à 5'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name="Catégorie")
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True,
                             related_name='presentations', verbose_name="Équipe (optionnel)")
    name = models.CharField(max_length=100, blank=True, verbose_name="Nom personnalisé",
                            help_text="Si aucune équipe sélectionnée ci-dessus, entrez un nom ici")
    image = models.ImageField(upload_to='team-presentations/', blank=True, null=True, verbose_name="Photo")
    coaches = models.TextField(blank=True, verbose_name="Staff / Coachs",
                               help_text="Un nom par ligne (ex: Jean Dupont)")
    order = models.IntegerField(default=0, verbose_name="Ordre d'affichage")

    def __str__(self):
        n = self.team.name if self.team else self.name
        return f"{n} ({self.get_category_display()})"

    class Meta:
        ordering = ['order']
        verbose_name = "Présentation équipe"
        verbose_name_plural = "Présentations équipes (Foot à 5 / Foot à 8)"


class GalleryPhoto(models.Model):
    title = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='gallery/')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or f"Photo {self.id}"

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = "Photo"
        verbose_name_plural = "Galerie photos"


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