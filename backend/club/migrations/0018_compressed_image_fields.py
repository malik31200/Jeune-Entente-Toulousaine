from django.db import migrations
import club.fields


class Migration(migrations.Migration):

    dependencies = [
        ('club', '0017_sitesettings_hero_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='image',
            field=club.fields.CompressedImageField(blank=True, max_dimension=2000, null=True, quality=85, upload_to='articles/'),
        ),
        migrations.AlterField(
            model_name='team',
            name='image',
            field=club.fields.CompressedImageField(blank=True, max_dimension=2000, null=True, quality=85, upload_to='teams/'),
        ),
        migrations.AlterField(
            model_name='player',
            name='photo',
            field=club.fields.CompressedImageField(blank=True, max_dimension=2000, null=True, quality=85, upload_to='players/'),
        ),
        migrations.AlterField(
            model_name='sponsor',
            name='logo',
            field=club.fields.CompressedImageField(max_dimension=2000, quality=85, upload_to='sponsors/'),
        ),
        migrations.AlterField(
            model_name='clubpage',
            name='image',
            field=club.fields.CompressedImageField(blank=True, max_dimension=2000, null=True, quality=85, upload_to='club/'),
        ),
        migrations.AlterField(
            model_name='categorypage',
            name='image',
            field=club.fields.CompressedImageField(blank=True, max_dimension=2000, null=True, quality=85, upload_to='categories/'),
        ),
        migrations.AlterField(
            model_name='teampresentation',
            name='image',
            field=club.fields.CompressedImageField(blank=True, max_dimension=2000, null=True, quality=85, upload_to='team-presentations/', verbose_name='Photo'),
        ),
        migrations.AlterField(
            model_name='galleryphoto',
            name='image',
            field=club.fields.CompressedImageField(max_dimension=2000, quality=85, upload_to='gallery/'),
        ),
        migrations.AlterField(
            model_name='sitesettings',
            name='hero_image',
            field=club.fields.CompressedImageField(blank=True, max_dimension=2000, null=True, quality=85, upload_to='hero/', verbose_name="Photo du hero (page d'accueil)"),
        ),
    ]
