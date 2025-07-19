from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from datetime import datetime, timezone, timedelta
from persian_tools import digits
import pymongo
from tqdm import tqdm
from time import sleep


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

    service = Service(r"backend\chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)
    return driver


def scrap(city: str, scroll_count: int = 3, is_headless: bool = True):
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["divar_db"]
    update_collection = db[f"{city}_time"]
    data = update_collection.find_one()

    now = datetime.now(timezone.utc)
    if data and "last_update" in data:
        diff = now - data["last_update"].replace(tzinfo=timezone.utc)
        if diff >= timedelta(hours=12):
            update_collection.delete_many({})
            update_collection.insert_one({"last_update": now})
        else:
            print(f"*******************GHabli hanooz daghe  |  {diff}")
            return
    else:
        print("++++++++++++++++++++++++++++++++++++")
        update_collection.insert_one({"last_update": now})

    driver = get_driver(is_headless)
    ads_link = set()
    for_sale = []
    for_rent = []
    err = []

    rent_collection = db[f"{city}_rent"]
    sale_collection = db[f"{city}_sale"]
    err_collection = db[f"{city}_err"]
    rent_collection.delete_many({})
    sale_collection.delete_many({})
    err_collection.delete_many({})

    try:
        driver.get(f"https://divar.ir/s/{city}/real-estate")
        close_map_button = driver.find_element(
            By.CSS_SELECTOR, 'div.absolute-c06f1[role="button"]')
        close_map_button.click()
        sleep(1)
    except:
        print("bastan map be moshkel khod!!!")

    for _ in range(scroll_count):
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "a.kt-post-card__action")))
        temp = driver.find_elements(
            By.CSS_SELECTOR, "a.kt-post-card__action")
        for element in temp:
            ads_link.add(element.get_attribute("href"))
        driver.execute_script(
            "window.scrollTo(0, document.body.scrollHeight);")
        sleep(1)

    print("*******************tedad link ha: ", len(ads_link))

    for link in tqdm(ads_link, desc="scraping"):
        driver.get(link)
        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "td.kt-group-row-item.kt-group-row-item__value.kt-group-row-item--info-row")))
        except:
            continue
        try:
            value2 = driver.find_elements(
                By.CSS_SELECTOR, "td.kt-group-row-item.kt-group-row-item__value.kt-group-row-item--info-row")
            value1 = driver.find_elements(
                By.CSS_SELECTOR, "p.kt-unexpandable-row__value")

            value1 = [digits.convert_to_en(val.text) for val in value1]
            value2 = [digits.convert_to_en(val.text) for val in value2]
            keys = driver.find_elements(
                By.CSS_SELECTOR, "p.kt-base-row__title.kt-unexpandable-row__title")
            keys = list(map(lambda x: x.text, keys))

            if value2[2] == "بدون اتاق":
                value2[2] = 0
            if value2[1] == "قبل از ۱۳۷۰":
                value2[1] == "1369"

            ad_data = {
                "link": link,
                "area_m2": int(value2[0]),
                "building_age": 1403 - int(value2[1]),
                "room_count": int(value2[2])
            }

            if 'قیمت کل' in keys:
                gheymat_kol = keys.index("قیمت کل")
                gheymat_metri = keys.index("قیمت هر متر")
                if value1[gheymat_kol].replace("٬", "").replace(" تومان", "") == "توافقی":
                    continue
                if value1[gheymat_metri].replace("٬", "").replace(" تومان", "") == "توافقی":
                    continue
                ad_data["total_price_toman"] = int(value1[gheymat_kol].replace(
                    "٬", "").replace(" تومان", ""))
                ad_data["price_per_m2_toman"] = int(value1[gheymat_metri].replace(
                    "٬", "").replace(" تومان", ""))
                for_sale.append(ad_data)
            elif 'ودیعه' in keys:
                ejare_avalie = keys.index("ودیعه")
                ejare_mahane = keys.index("اجارهٔ ماهانه")
                ad_data["deposit_toman"] = int(value1[ejare_avalie].replace(
                    "٬", "").replace(" تومان", ""))
                ad_data["monthly_rent_toman"] = int(value1[ejare_mahane].replace(
                    "٬", "").replace(" تومان", ""))
                for_rent.append(ad_data)
            else:
                continue

        except:
            err.append({"link": link})
    driver.quit()

    print("***************Foroosh moafagh", len(for_sale))
    print("*****************Ejare moafagh", len(for_rent))
    if for_sale and for_rent:
        rent_collection.insert_many(for_rent)
        sale_collection.insert_many(for_sale)
        # err_collection.insert_many(err)


scrap("tehran", 1, False)
