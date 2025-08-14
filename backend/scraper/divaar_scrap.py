from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from persian_tools import digits
from tqdm import tqdm
from time import sleep


def run_scraper(city: str, scroll_count: int = 3, is_headless: bool = True):
    driver = get_driver(is_headless)
    ads_link = set()
    for_sale = []
    for_rent = []
    err = []
    try:
        driver.get(f"https://divar.ir/s/{city}/real-estate")
        close_map_button = driver.find_element(
            By.CSS_SELECTOR, 'div.absolute-c06f1[role="button"]')
        close_map_button.click()
        sleep(1)
    except:
        print("bastan map be moshkel khod!!!")

    for _ in range(scroll_count):
        WebDriverWait(driver, 3).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "a.kt-post-card__action")))
        temp = driver.find_elements(
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
            ads_link.add(element.get_attribute("href"))
        driver.execute_script(
            "window.scrollTo(0, document.body.scrollHeight);")
        sleep(0.8)

    print("*******************tedad link ha: ", len(ads_link))

    for link in tqdm(ads_link, desc="diavr scraping"):
        driver.get(link)
        try:
            WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "td.kt-group-row-item.kt-group-row-item__value.kt-group-row-item--info-row")))
        except:
            continue
        try:
            value2 = driver.find_elements(
                By.CSS_SELECTOR, "td.kt-group-row-item.kt-group-row-item__value.kt-group-row-item--info-row")
            value1 = driver.find_elements(
                By.CSS_SELECTOR, "p.kt-unexpandable-row__value")
            try:
                image_element = WebDriverWait(driver, 2).until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, "img.kt-image-block__image.kt-image-block__image--fading"))
                )
                image_url = image_element.get_attribute("src")
            except:
                image_url = "https://iliadata.ir/images/estate_images/default.jpg"

            value1 = [digits.convert_to_en(val.text) for val in value1]
            value2 = [digits.convert_to_en(val.text) for val in value2]
            keys = driver.find_elements(
                By.CSS_SELECTOR, "p.kt-base-row__title.kt-unexpandable-row__title")
            keys = list(map(lambda x: x.text, keys))

            if value2[2] == "بدون اتاق":
                value2[2] = 0
            if value2[1] == "قبل از ۱۳۷۰":
                building_age = "more than 30"
            else:
                building_age = 1404 - int(value2[1])

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
                    continue
                if value1[price_per_m2].replace("،", "").replace(" تومان", "") == "توافقی":
                    continue
                ad_data["total_price_toman"] = int(value1[total_price].replace(
                    "،", "").replace(" تومان", ""))
                ad_data["price_per_m2_toman"] = int(value1[price_per_m2].replace(
                    "،", "").replace(" تومان", ""))
                for_sale.append(ad_data)
            elif 'ودیعه' in keys:
                deposit = keys.index("ودیعه")
                rent = keys.index("اجارهٔ ماهانه")
                ad_data["deposit_toman"] = int(value1[deposit].replace(
                    "،", "").replace(" تومان", ""))
                ad_data["monthly_rent_toman"] = int(value1[rent].replace(
                    "،", "").replace(" تومان", ""))
                for_rent.append(ad_data)
            else:
                err.append({"link2": link})
                continue

        except Exception as error:
            print(error)
            err.append({"link": link})
    driver.quit()
    print("***************Foroosh moafagh", len(for_sale))
    print("*****************Ejare moafagh", len(for_rent))
    print("*****************err moafagh", len(err))

    return for_sale, for_rent


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

    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36')
    if headless:
        options.add_argument('--headless=new')

    driver = webdriver.Chrome(options=options)
    return driver


if __name__ == "__main__":
    print("this is a module!")
