from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from club.models import Match

PARIS_TZ = ZoneInfo('Europe/Paris')
UTC = ZoneInfo('UTC')


class Command(BaseCommand):
    help = (
        "Corrige l'heure des matchs importés depuis la FFF avant le correctif "
        "de fuseau horaire : l'heure FFF (heure de Paris) avait été enregistrée "
        "comme une heure UTC, d'où un décalage d'1h (2h en été). "
        "Ne touche qu'aux matchs avec un identifiant FFF (ma_no). "
        "Sans --apply, affiche seulement ce qui serait modifié."
    )

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true', help='Enregistre les corrections.')

    def handle(self, *args, **options):
        apply = options['apply']
        matchs = Match.objects.filter(ma_no__isnull=False).order_by('date')
        changed = 0

        with transaction.atomic():
            for match in matchs:
                # L'heure UTC enregistrée correspond en fait à l'heure de Paris voulue
                wall_clock = match.date.astimezone(UTC).replace(tzinfo=None)
                fixed = timezone.make_aware(wall_clock, PARIS_TZ)
                if fixed == match.date:
                    continue
                changed += 1
                old_local = timezone.localtime(match.date).strftime('%d/%m/%Y %H:%M')
                new_local = timezone.localtime(fixed).strftime('%d/%m/%Y %H:%M')
                self.stdout.write(f'{match.home_team} - {match.away_team} : {old_local} -> {new_local}')
                if apply:
                    Match.objects.filter(pk=match.pk).update(date=fixed)

        verb = 'corrigés' if apply else 'à corriger (relancer avec --apply)'
        self.stdout.write(self.style.SUCCESS(f'{changed} matchs {verb}.'))
