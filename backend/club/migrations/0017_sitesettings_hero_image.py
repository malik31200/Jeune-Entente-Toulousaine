from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('club', '0016_classementfetchlock'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='hero_image',
            field=models.ImageField(blank=True, null=True, upload_to='hero/', verbose_name="Photo du hero (page d'accueil)"),
        ),
    ]
