from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from persian_tools import digits
from tqdm import tqdm
from time import sleep


class SheypoorScraper:
    def __init__(self):
        self.driver = None

    def __enter__(self):
        self._init_driver()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._close_driver()

    def _init_driver(self, is_headless: bool = True):
        options = Options()
        prefs = {"profile.managed_default_content_settings.images": 2}
        options.add_experimental_option("prefs", prefs)
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')

        options.add_argument('--disable-logging')
        options.add_argument("--log-level=3")
        options.add_argument('--disable-background-networking')
        options.add_argument('--disable-client-side-phishing-detection')
        options.add_argument('--disable-default-apps')
        options.add_argument('--disable-sync')
        options.add_argument('--metrics-recording-only')
        options.add_argument('--no-first-run')
        options.add_argument('--disable-component-update')
        options.add_argument('--disable-domain-reliability')
        options.add_argument('--disable-breakpad')

        options.add_argument(
            'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36')
        if is_headless:
            options.add_argument('--headless=new')

        self.driver = webdriver.Chrome(options=options)

    def _scrape_ad_links(self, city: str, scroll_count: int = 8):
        self.ads_link = set()

        self.driver.get(f"https://www.sheypoor.com/s/{city}/real-estate")
        sleep(1)
        for i in range(scroll_count):

            sections = self.driver.find_elements(
                By.CSS_SELECTOR, 'section[item="[object Object]"]')
            for section in sections:
                section_title = section.find_elements(
                    By.CSS_SELECTOR, 'h2.text-heading-4-bolder.text-dark-0')
                if section_title:
                    if section_title[0].text == "ویترین سراسری":
                        continue
                section_ads_link = section.find_elements(
                    By.CSS_SELECTOR, 'a[data-test-id^="ad-item-"]')
                for element in section_ads_link:
                    if element.find_elements(By.CSS_SELECTOR, 'p.inline-block.pl-1.text-body-2-normal.text-blue-1'):
                        continue
                    if negotiableـprice := element.find_elements(By.CSS_SELECTOR, "span.text-heading-5-normal"):
                        negotiableـprice = list(
                            map(lambda x: x.text, negotiableـprice))
                        if "توافقی" in negotiableـprice:
                            print(
                                f"TAVAFOGHI {element.get_attribute('href')}")
                            continue
                    should_skip = False
                    for word in ["روزانه", "صنعتی", "تجاری", "اداری", "پانسیون", "مغازه", "هم خونه", "همخونه", "هم خانه", "همخانه"]:
                        if word in element.find_element(By.TAG_NAME, "h2").text:
                            should_skip = True
                            break
                    if should_skip:
                        print(f"&&&&&&&&{element.get_attribute("href")}")
                        continue
                    self.ads_link.add(element.get_attribute("href"))
            self.driver.execute_script(
                "window.scrollTo(arguments[0] * 900, (arguments[0] + 1) * 900);", i)
            sleep(0.3)
        return list(self.ads_link)

    def _scrape_ad_details(self, link: str):
        self.driver.get(link)
        try:
            add_details = self.driver.find_element(
                By.CSS_SELECTOR, "div.grid.grid-cols-1.gap-x-8.py-0.desktop\\:grid-cols-2.desktop\\:gap-y-6.desktop\\:py-6.pb-4")
            keys = add_details.find_elements(
                By.CSS_SELECTOR, "h3.text-heading-4-lighter")
            keys = list(map(lambda x: x.text, keys))
            values = add_details.find_elements(
                By.CSS_SELECTOR, "span.text-heading-4-bolder")
            values = list(map(lambda x: digits.convert_to_en(x.text), values))

            try:
                image_element = WebDriverWait(self.driver, 2).until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, "img.h-full.w-full.select-none.desktop\:w-full.object-cover"))
                )
                image_url = image_element.get_attribute("src")
            except:
                image_url = "https://iliadata.ir/images/estate_images/default.jpg"

            if values[keys.index("سن بنا")] == "بیشتر از ۳۰ سال":
                building_age = "more than 30"
            else:
                building_age = int(
                    values[keys.index("سن بنا")].replace(" سال", ""))
            area_index = keys.index("متراژ")
            room_index = keys.index("تعداد اتاق")
            if values[room_index] == "بدون اتاق":
                values[room_index] = 0

            ad_data = {
                "link": link,
                "image": image_url,
                "area_m2": int(values[area_index]),
                "building_age": building_age,
                "room_count": int(values[room_index])
            }

            total_price = self.driver.find_elements(
                By.CSS_SELECTOR, "span.flex.items-center.text-heading-4-bolder.\\!text-heading-3-bolder.\\[\\&_span\\]\\:\\!size-6")
            if total_price:
                price_per_m2 = keys.index("قیمت هر متر")
                ad_data["total_price_toman"] = int(digits.convert_to_en(
                    total_price[0].text.replace(",", "")))
                ad_data["price_per_m2_toman"] = int(values[price_per_m2].replace(
                    ",", ""))
                return ad_data, "sale"
            else:
                mortgage = keys.index("رهن")
                rent = keys.index("اجاره")
                if values[mortgage].replace(
                        ",", "").replace(" تومان", "") == "توافقی":
                    return None, None
                if values[rent].replace(
                        ",", "").replace(" تومان", "") == "توافقی":
                    return None, None
                ad_data["mortgage_toman"] = int(values[mortgage].replace(
                    ",", "").replace(" تومان", ""))
                ad_data["monthly_rent_toman"] = int(values[rent].replace(
                    ",", "").replace(" تومان", ""))
                return ad_data, "rent"
        except:
            return None, None

    def scrape(self, city: str, scroll_count: int = 8):
        ad_links = self._scrape_ad_links(city, scroll_count)
        print(f"[Sheypoor Scraper] Found {len(ad_links)} unique ad links.")

        for_sale = []
        for_rent = []

        for link in tqdm(ad_links, desc="Scraping Sheypoor Details"):
            ad_data, ad_type = self._scrape_ad_details(link)
            if ad_type == 'sale':
                for_sale.append(ad_data)
            elif ad_type == 'rent':
                for_rent.append(ad_data)
            else:
                continue
        print(
            f"[Sheypoor Scraper] Finished. Found {len(for_sale)} sale and {len(for_rent)} rent properties.")
        return for_sale, for_rent

    def _close_driver(self):
        if self.driver:
            self.driver.quit()


if __name__ == "__main__":
    print("this is a module!")
