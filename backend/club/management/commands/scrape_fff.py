import time
import requests
from django.core.management.base import BaseCommand
from club.fff_import import FFFMatchImporter


FFF_CLUB_ID = 11641
FFF_SEASON = 2026
MAX_RETRIES = 3


class Command(BaseCommand):
    help = 'Scrape les matchs de la Jeune Entente Toulousaine depuis l\'API FFF'

    def handle(self, *args, **kwargs):
        self.stdout.write('Démarrage du scraping FFF...')
        importer = FFFMatchImporter(FFF_CLUB_ID, log=self.stdout.write)

        created = 0
        updated = 0
        page = 1
        base_url = 'https://api-dofa.fff.fr'
        next_url = f'/api/clubs/{FFF_CLUB_ID}/matchs?sa_no={FFF_SEASON}'

        while next_url:
            self.stdout.write(f'Page {page}...')

            data = None
            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    response = requests.get(base_url + next_url, timeout=10)
                    response.raise_for_status()
                    data = response.json()
                    break
                except (requests.RequestException, ValueError) as e:
                    self.stderr.write(f'Erreur API FFF (page {page}, tentative {attempt}/{MAX_RETRIES}) : {e}')
                    if attempt < MAX_RETRIES:
                        time.sleep(2 * attempt)

            if data is None:
                self.stderr.write(f'Abandon du scraping à la page {page} après {MAX_RETRIES} tentatives.')
                break

            matchs = data.get('hydra:member', [])

            for match_data in matchs:
                result = importer.process_match(match_data)
                if result == 'created':
                    created += 1
                elif result == 'updated':
                    updated += 1

            next_url = data.get('hydra:view', {}).get('hydra:next')
            page += 1

        self.stdout.write(self.style.SUCCESS(
            f'Terminé : {created} créés, {updated} mis à jour.'
        ))
