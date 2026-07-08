from django.core.management.base import BaseCommand
from club.models import Team
from club.views import fetch_and_store_classement


class Command(BaseCommand):
    help = "Rafraîchit et sauvegarde en base le classement de chaque équipe ayant un cp_no configuré."

    def handle(self, *args, **kwargs):
        teams = Team.objects.exclude(cp_no__isnull=True).exclude(cp_no='')
        ok, failed = 0, 0

        for team in teams:
            configs = [(team.cp_no, team.phase_no, team.poule_no)]
            if team.phase_no_2:
                configs.append((team.cp_no, team.phase_no_2, team.poule_no_2 or 1))

            for cp_no, phase, poule in configs:
                try:
                    fetch_and_store_classement(cp_no, phase, poule)
                    ok += 1
                except Exception as e:
                    failed += 1
                    self.stderr.write(f'Erreur classement {team.name} ({cp_no}/{phase}/{poule}) : {e}')

        self.stdout.write(self.style.SUCCESS(f'Terminé : {ok} classements mis à jour, {failed} échecs.'))
