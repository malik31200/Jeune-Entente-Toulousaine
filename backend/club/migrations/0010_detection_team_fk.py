from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('club', '0009_detection'),
    ]

    operations = [
        # Drop old category column
        migrations.RemoveField(
            model_name='detection',
            name='category',
        ),
        # Add new team FK (nullable temporarily to handle existing rows)
        migrations.AddField(
            model_name='detection',
            name='team',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='detections',
                to='club.team',
                verbose_name='Équipe',
            ),
        ),
        # Delete any existing rows that have no team (orphaned)
        migrations.RunSQL(
            "DELETE FROM club_detection WHERE team_id IS NULL;",
            reverse_sql=migrations.RunSQL.noop,
        ),
        # Make team non-nullable
        migrations.AlterField(
            model_name='detection',
            name='team',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='detections',
                to='club.team',
                verbose_name='Équipe',
            ),
        ),
    ]
