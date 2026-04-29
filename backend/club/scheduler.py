from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

def scrape_fff_job():
    logger.info("Lancement scraping FFF...")
    try:
        call_command('scrape_fff')
        logger.info("Scraping FFF terminé.")
    except Exception as e:
        logger.error(f"Erreur scraping FFF : {e}")


def start():
    from django.db import connection
    tables = connection.introspection.table_names()
    if 'django_apscheduler_djangojob' not in tables:
        logger.warning("Tables APScheduler absentes — migrate en attente.")
        return

    scheduler = BackgroundScheduler()
    scheduler.add_jobstore(DjangoJobStore(), "default")

    # Lundi -> Vendredi : 6h00 (1 fois par jour)
    scheduler.add_job(
        scrape_fff_job,
        trigger=CronTrigger(day_of_week="mon-fri", hour=23, minute=00),
        id="scrape_fff_semaine",
        replace_existing=True,
    )

    # Samedi et Dimanche (6 fois par jour)
    for hour, minute in [(13, 30), (15, 30), (17, 30), (18, 30), (21, 00), (23, 00)]:
        scheduler.add_job(
            scrape_fff_job,
            trigger=CronTrigger(day_of_week="sat,sun", hour=hour, minute=minute),
            id=f"scrape_fff_weekend_{hour}h{minute:02d}",
            replace_existing=True,
        )

    scheduler.start()
    print("✅ Scheduler FFF démarré.")  # ← print au lieu de logger.info