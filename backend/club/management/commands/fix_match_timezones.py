import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from club.fff_import import FFFMatchImporter
from club.models import Match

UTC = ZoneInfo('UTC')
IMPORTS_DIR = Path(__file__).resolve().parents[2] / 'fff_manual_imports'


class Command(BaseCommand):
    help = (
        "Corrige l'heure des matchs touchés par l'ancien bug de fuseau horaire "
        "de l'import FFF (heure de Paris enregistrée comme heure UTC). "
        "Compare chaque match aux fichiers JSON de fff_manual_imports/ et ne le "
        "corrige que si son heure en base est exactement la valeur produite par "
        "le bug : les matchs déjà justes ou modifiés à la main ne sont pas touchés. "
        "Sans --apply, affiche seulement ce qui serait modifié."
    )

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true', help='Enregistre les corrections.')

    def load_fff_times(self):
        """ma_no -> (date FFF, heure FFF), le fichier le plus récent l'emporte."""
        fff = {}
        for path in sorted(IMPORTS_DIR.glob('*.json')):
            data = json.loads(path.read_text(encoding='utf-8'))
            if isinstance(data, dict):
                data = data.get('hydra:member', [])
            for m in data:
                date_str = m.get('date') or m.get('initial_date')
                if m.get('ma_no') and date_str:
                    fff[m['ma_no']] = (date_str, m.get('time'))
        return fff

    @staticmethod
    def buggy_value(date_str, time_str):
        """Reproduit l'ancien calcul : l'heure FFF collée sur la date UTC."""
        try:
            dt = datetime.fromisoformat(date_str)
            if time_str:
                parts = time_str.replace('H', ':').split(':')
                dt = dt.replace(hour=int(parts[0]), minute=int(parts[1]) if len(parts) > 1 else 0)
            return dt
        except (ValueError, TypeError):
            return None

    def handle(self, *args, **options):
        apply = options['apply']
        fff = self.load_fff_times()
        importer = FFFMatchImporter(club_id=None)

        fixed = ok = other = absent = 0
        with transaction.atomic():
            for match in Match.objects.filter(ma_no__isnull=False).order_by('date'):
                if match.ma_no not in fff:
                    absent += 1
                    continue
                date_str, time_str = fff[match.ma_no]
                correct = importer.parse_date(date_str, time_str)
                buggy = self.buggy_value(date_str, time_str)

                if match.date == correct:
                    ok += 1
                elif buggy is not None and match.date == buggy:
                    fixed += 1
                    old = timezone.localtime(match.date).strftime('%d/%m/%Y %H:%M')
                    new = timezone.localtime(correct).strftime('%d/%m/%Y %H:%M')
                    self.stdout.write(f'{match.home_team} - {match.away_team} : {old} -> {new}')
                    if apply:
                        Match.objects.filter(pk=match.pk).update(date=correct)
                else:
                    # Date modifiée à la main ou match reprogrammé : on n'y touche pas
                    other += 1

        verb = 'corrigés' if apply else 'à corriger (relancer avec --apply)'
        self.stdout.write(self.style.SUCCESS(f'{fixed} matchs {verb}.'))
        self.stdout.write(
            f'{ok} déjà à la bonne heure, {other} modifiés à la main ou reprogrammés (non touchés), '
            f'{absent} absents des fichiers FFF (non touchés).'
        )
