from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('club', '0011_match_ma_no'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='phase_no_2',
            field=models.IntegerField(blank=True, null=True, verbose_name='FFF phase 2 (optionnel)', help_text="Si l'équipe a une phase 2 (ex: playoffs)"),
        ),
        migrations.AddField(
            model_name='team',
            name='poule_no_2',
            field=models.IntegerField(blank=True, null=True, verbose_name='FFF poule phase 2'),
        ),
    ]
