from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('club', '0018_compressed_image_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyVisitorCount',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(unique=True)),
                ('count', models.PositiveIntegerField(default=0)),
            ],
            options={
                'verbose_name': 'Visiteurs par jour',
                'verbose_name_plural': 'Visiteurs par jour',
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='VisitorPing',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('visitor_hash', models.CharField(max_length=64)),
            ],
            options={
                'verbose_name': 'Visite (technique)',
                'verbose_name_plural': 'Visites (technique)',
            },
        ),
        migrations.AlterUniqueTogether(
            name='visitorping',
            unique_together={('date', 'visitor_hash')},
        ),
    ]
