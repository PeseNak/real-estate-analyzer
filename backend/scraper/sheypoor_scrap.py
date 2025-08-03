from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from persian_tools import digits
from tqdm import tqdm
from time import sleep
import os


def get_driver(headless):
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
    if headless:
        options.add_argument('--headless=new')

    script_dir = os.path.dirname(os.path.abspath(__file__))

    driver_path = os.path.join(script_dir, '..', 'chromedriver.exe') 
    service = Service(driver_path)
    driver = webdriver.Chrome(service=service, options=options)
    return driver


def run_scraper(city: str, scroll_count: int = 12, is_headless: bool = True):

    driver = get_driver(is_headless)
    ads_link = set()
    for_sale = []
    for_rent = []
    err = []

    driver.get(f"https://www.sheypoor.com/s/{city}/real-estate")
    sleep(1)
    for i in range(scroll_count):

        sections = driver.find_elements(
            By.CSS_SELECTOR, 'section[item = "[object Object]"]')
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
                if tavafogh := element.find_elements(By.CSS_SELECTOR, "span.text-heading-5-normal"):
                    if tavafogh[0].text == "توافقی":
                        print(
                            f"TAVAFOGHI {element.get_attribute("href")}")
                        continue
                isbad = False
                for word in ["روزانه", "صنعتی", "تجاری", "اداری", "پانسیون", "مغازه", "هم خونه", "همخونه",]:
                    if word in element.find_element(By.TAG_NAME, "h2").text:
                        isbad = True
                        break
                if isbad:
                    print(f"&&&&&&&&{element.get_attribute("href")}")
                    continue
                ads_link.add(element.get_attribute("href"))
        driver.execute_script(
            "window.scrollTo(arguments[0] * 900, (arguments[0] + 1) * 900);", i)
        sleep(1)
    print("********************tedad link ha: ", len(ads_link))

    for link in tqdm(ads_link, desc="sheypoor scraping"):
        driver.get(link)
        try:
            brooo = driver.find_element(
                By.CSS_SELECTOR, "div.grid.grid-cols-1.gap-x-8.py-0.desktop\\:grid-cols-2.desktop\\:gap-y-6.desktop\\:py-6.pb-4")
            keys = brooo.find_elements(
                By.CSS_SELECTOR, "h3.text-heading-4-lighter")
            keys = list(map(lambda x: x.text, keys))
            values = brooo.find_elements(
                By.CSS_SELECTOR, "span.text-heading-4-bolder")
            values = list(map(lambda x: digits.convert_to_en(x.text), values))

            metrazh = keys.index("متراژ")
            sen_banna = int(values[keys.index("سن بنا")].replace(" سال", ""))
            # sal_sakht = 1404 - sal_sakht
            otagh = keys.index("تعداد اتاق")

            if values[otagh] == "بدون اتاق":
                values[otagh] = 0

            ad_data = {
                "link": link,
                "area_m2": int(values[metrazh]),
                "building_age": sen_banna,
                "room_count": int(values[otagh])
            }

            gheymat_kol = driver.find_elements(
                By.CSS_SELECTOR, "span.flex.items-center.text-heading-4-bolder.\\!text-heading-3-bolder.\\[\\&_span\\]\\:\\!size-6")
            if gheymat_kol:
                gheymat_metri = keys.index("قیمت هر متر")
                ad_data["total_price_toman"] = int(digits.convert_to_en(
                    gheymat_kol[0].text.replace(",", "")))
                ad_data["price_per_m2_toman"] = int(values[gheymat_metri].replace(
                    ",", ""))
                for_sale.append(ad_data)
            else:
                rahn = keys.index("رهن")
                ejare = keys.index("اجاره")
                if values[rahn].replace(
                        ",", "").replace(" تومان", "") == "توافقی":
                    err.append({"link": link})
                    continue
                if values[ejare].replace(
                        ",", "").replace(" تومان", "") == "توافقی":
                    err.append({"link": link})
                    continue
                ad_data["mortgage_toman"] = int(values[rahn].replace(
                    ",", "").replace(" تومان", ""))
                ad_data["monthly_rent_toman"] = int(values[ejare].replace(
                    ",", "").replace(" تومان", ""))
                for_rent.append(ad_data)

        except:
            err.append({"link": link})
    driver.quit()

    print("***************Foroosh moafagh", len(for_sale))
    print("*****************Ejare moafagh", len(for_rent))
    print("*****************err moafagh", len(err))

    return for_sale, for_rent


if __name__ == "__main__":
    print("this is a module!")
