from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('club', '0013_ckeditor_uploader'),
    ]

    operations = [
        migrations.AddField(
            model_name='sponsor',
            name='description',
            field=models.TextField(blank=True, help_text='Texte affiché sous le nom du sponsor', verbose_name='Description (optionnel)'),
        ),
    ]
