import json
from django.core.management.base import BaseCommand
from core.scrapers.divaar_scrap import run_scraper as run_divar_scraper
from core.scrapers.sheypoor_scrap import run_scraper as run_sheypoor_scraper


class Command(BaseCommand):
    help = 'Scrapes important cities and saves the data to JSON files.'

    def handle(self, *args, **kwargs):
        hot_cities = [
            'tehran',
            'karaj',
            'mashhad',
            'isfahan',
            'shiraz',
            'tabriz',
            'rasht',
            'qom'

        ]

        self.stdout.write(self.style.SUCCESS(
            'Starting the scheduled scraping process...'))

        for city in hot_cities:
            self.stdout.write(f'Scraping data for: {city}')
            try:
                divar_sale, divar_rent = run_divar_scraper(
                    city, scroll_count=2)
                sheypoor_sale, sheypoor_rent = run_sheypoor_scraper(
                    city, scroll_count=10)
                all_sales = divar_sale + sheypoor_sale
                all_rentals = divar_rent + sheypoor_rent

                sale_filename = f"database/scrap/{city}_sales.json"
                rent_filename = f"database/scrap/{city}_rentals.json"

                with open(sale_filename, 'w', encoding='utf-8') as f:
                    json.dump(all_sales, f, ensure_ascii=False, indent=2)

                with open(rent_filename, 'w', encoding='utf-8') as f:
                    json.dump(all_rentals, f, ensure_ascii=False, indent=2)

                self.stdout.write(self.style.SUCCESS(
                    f'Successfully scraped and saved data for {city}. Found {len(all_sales)} sale and {len(all_rentals)} rent listings.'))

            except Exception as e:
                self.stderr.write(self.style.ERROR(
                    f'An error occurred while scraping {city}: {e}'))

        self.stdout.write(self.style.SUCCESS(
            'Scheduled scraping process finished successfully!'))
