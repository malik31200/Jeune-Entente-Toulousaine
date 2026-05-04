from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('club', '0010_detection_team_fk'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='ma_no',
            field=models.BigIntegerField(blank=True, null=True, unique=True, verbose_name='ID FFF match'),
        ),
    ]
