from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from persian_tools import digits
from tqdm import tqdm
from time import sleep
from datetime import datetime

from .base_scraper import BaseScraper


class DivarScraper(BaseScraper):
    def _scrape_ad_links(self, city: str, scroll_count: int = 2):
        self.ads_link = set()

        self.driver.get(f"https://divar.ir/s/{city}/real-estate")
        try:
            close_map_button = self.driver.find_element(
                By.CSS_SELECTOR, 'div.absolute-c06f1[role="button"]')
            close_map_button.click()
        except NoSuchElementException:
            print("[Divar Scraper] Map not found, continuing...")
        sleep(1)

        for _ in range(scroll_count):
            WebDriverWait(self.driver, 3).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "a.kt-post-card__action")))
            temp = self.driver.find_elements(
                By.CSS_SELECTOR, "a.kt-post-card__action")
            for element in temp:
                should_skip = False
                for word in ["روزانه", "صنعتی", "تجاری", "اداری", "پانسیون", "مغازه", "هم خونه", "همخونه", "هم خانه", "همخانه"]:
                    if word in element.find_element(By.TAG_NAME, "h2").text:
                        should_skip = True
                        break
                if should_skip:
                    print(f"&&&&&&&&{element.get_attribute('href')}")
                    continue
                self.ads_link.add(element.get_attribute("href"))
            self.driver.execute_script(
                "window.scrollTo(0, document.body.scrollHeight);")
            sleep(0.8)

        return list(self.ads_link)

    def _scrape_ad_details(self, link: str):
        self.driver.get(link)
        try:
            WebDriverWait(self.driver, 3).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "td.kt-group-row-item.kt-group-row-item__value.kt-group-row-item--info-row")))
        except TimeoutException:
            return None, None
        try:
            value2 = self.driver.find_elements(
                By.CSS_SELECTOR, "td.kt-group-row-item.kt-group-row-item__value.kt-group-row-item--info-row")
            value1 = self.driver.find_elements(
                By.CSS_SELECTOR, "p.kt-unexpandable-row__value")
            try:
                image_element = WebDriverWait(self.driver, 2).until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, "img.kt-image-block__image.kt-image-block__image--fading"))
                )
                image_url = image_element.get_attribute("src")
            except:
                image_url = "https://iliadata.ir/images/estate_images/default.jpg"

            value1 = [digits.convert_to_en(val.text) for val in value1]
            value2 = [digits.convert_to_en(val.text) for val in value2]
            keys = self.driver.find_elements(
                By.CSS_SELECTOR, "p.kt-base-row__title.kt-unexpandable-row__title")
            keys = list(map(lambda x: x.text, keys))

            if value2[2] == "بدون اتاق":
                value2[2] = 0
            if value2[1] == "قبل از ۱۳۷۰":
                building_age = "more than 30"
            else:
                current_year = datetime.now().year - 621
                building_age = current_year - int(value2[1])

            ad_data = {
                "link": link,
                "image": image_url,
                "area_m2": int(value2[0]),
                "building_age": building_age,
                "room_count": int(value2[2])
            }

            if 'قیمت کل' in keys:
                total_price = keys.index("قیمت کل")
                price_per_m2 = keys.index("قیمت هر متر")
                if value1[total_price].replace("،", "").replace(" تومان", "") == "توافقی":
                    return None, None
                if value1[price_per_m2].replace("،", "").replace(" تومان", "") == "توافقی":
                    return None, None
                ad_data["total_price_toman"] = int(value1[total_price].replace(
                    "،", "").replace(" تومان", ""))
                ad_data["price_per_m2_toman"] = int(value1[price_per_m2].replace(
                    "،", "").replace(" تومان", ""))
                return ad_data, "sale"
            elif 'ودیعه' in keys:
                deposit = keys.index("ودیعه")
                rent = keys.index("اجارهٔ ماهانه")
                ad_data["deposit_toman"] = int(value1[deposit].replace(
                    "،", "").replace(" تومان", ""))
                ad_data["monthly_rent_toman"] = int(value1[rent].replace(
                    "،", "").replace(" تومان", ""))
                return ad_data, "rent"
            else:
                return None, None

        except Exception as e:
            print(f"[Divar Scraper] Error parsing {link}: {e}")
            return None, None

    def scrape(self, city: str, scroll_count: int = 2):
        ad_links = self._scrape_ad_links(city, scroll_count)
        print(f"[Divar Scraper] Found {len(ad_links)} unique ad links.")

        for_sale = []
        for_rent = []

        for link in tqdm(ad_links, desc="Scraping Divar Details"):
            ad_data, ad_type = self._scrape_ad_details(link)
            if ad_type == 'sale':
                for_sale.append(ad_data)
            elif ad_type == 'rent':
                for_rent.append(ad_data)
            else:
                continue
        print(
            f"[Divar Scraper] Finished. Found {len(for_sale)} sale and {len(for_rent)} rent properties.")
        return for_sale, for_rent

if __name__ == "__main__":
    print("this is a module!")
