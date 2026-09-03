import json
import sys
from django.core.management.base import BaseCommand, CommandError
from club.fff_import import FFFMatchImporter

FFF_CLUB_ID = 11641


class Command(BaseCommand):
    help = (
        "Importe des matchs FFF depuis un JSON récupéré manuellement dans un "
        "navigateur, à utiliser quand l'API bloque les requêtes automatisées "
        "(403 Akamai). Accepte soit une réponse brute de l'API "
        "(objet avec 'hydra:member'), soit une simple liste de matchs. "
        "Un ou plusieurs fichiers en argument, ou rien pour lire le JSON "
        "depuis l'entrée standard (pratique en collant directement dans la "
        "console Railway)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            'files', nargs='*',
            help="Chemin(s) vers des fichiers JSON. Si omis, lit depuis stdin."
        )

    def handle(self, *args, **options):
        importer = FFFMatchImporter(FFF_CLUB_ID, log=self.stdout.write)

        created = 0
        updated = 0
        skipped = 0

        sources = options['files'] or ['-']

        for source in sources:
            if source == '-':
                self.stdout.write("Lecture du JSON depuis l'entrée standard...")
                raw = sys.stdin.read()
            else:
                self.stdout.write(f'Lecture de {source}...')
                try:
                    with open(source, encoding='utf-8') as f:
                        raw = f.read()
                except OSError as e:
                    raise CommandError(f"Impossible de lire {source} : {e}")

            try:
                data = json.loads(raw)
            except json.JSONDecodeError as e:
                raise CommandError(f"JSON invalide dans {source} : {e}")

            if isinstance(data, dict):
                matchs = data.get('hydra:member', [])
            elif isinstance(data, list):
                matchs = data
            else:
                raise CommandError(f"Format inattendu dans {source} : ni objet hydra ni liste.")

            for match_data in matchs:
                try:
                    result = importer.process_match(match_data)
                except Exception as e:
                    self.stderr.write(f"Erreur sur un match (ma_no={match_data.get('ma_no', '?')}) : {e}")
                    skipped += 1
                    continue
                if result == 'created':
                    created += 1
                elif result == 'updated':
                    updated += 1
                else:
                    skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f'Terminé : {created} créés, {updated} mis à jour, {skipped} ignorés.'
        ))
