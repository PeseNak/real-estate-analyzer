from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from persian_tools import digits
import json
from time import sleep

ads_link = set()
ads = []
options = Options()
prefs = {"profile.managed_default_content_settings.images": 2}
options.add_experimental_option("prefs", prefs)
options.add_argument('--headless')
options.add_argument('--window-size=1920,1080')
driver = webdriver.Chrome(options=options)
city = "tehran"
try:
    driver.get(f"https://divar.ir/s/{city}/real-estate")
    close_map_button = driver.find_element(
        By.CSS_SELECTOR, 'div.absolute-c06f1[role="button"]')
    close_map_button.click()
    sleep(1)
except:
    print("bastan map be moshkel khod!!!")

for _ in range(2):
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "a.unsafe-kt-post-card__action")))
    temp = driver.find_elements(
        By.CSS_SELECTOR, "a.unsafe-kt-post-card__action")
    for element in temp:
        ads_link.add(element.get_attribute("href"))
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    sleep(1)

print("tedad link ha: ", len(ads_link))

for link in ads_link:
    driver.get(link)
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "td.kt-group-row-item.kt-group-row-item__value.kt-group-row-item--info-row")))
    except:
        continue
    try:
        value1 = driver.find_elements(
            By.CSS_SELECTOR, "p.kt-unexpandable-row__value")
        value2 = driver.find_elements(
            By.CSS_SELECTOR, "td.kt-group-row-item.kt-group-row-item__value.kt-group-row-item--info-row")

        value1 = [digits.convert_to_en(val.text.replace(
            " تومان", "").replace("٬", "")) for val in value1]
        value2 = [digits.convert_to_en(val.text) for val in value2]
        keys = driver.find_elements(
            By.CSS_SELECTOR, "p.kt-base-row__title.kt-unexpandable-row__title")
        keys = list(map(lambda x: x.text, keys))
        i = 0
        if "تصویر‌ها برای همین ملک است؟" in keys:
            i = 1
        ad_data = {
            "metrazh": value2[0],
            "sal_sakht": value2[1],
            "otagh": value2[2]
        }

        if 'قیمت کل' in keys:
            ad_data["gheymat_kol"] = value1[0 + i]
            ad_data["gheymat_metri"] = value1[1 + i]
        elif 'ودیعه' in keys:
            ad_data["ejare_avalie"] = value1[0 + i]
            ad_data["ejare_mahane"] = value1[1 + i]
        else:
            continue

        ads.append(ad_data)
    except:
        continue
print("scrap moafagh", len(ads))
with open("ads.json", "w", encoding="utf-8") as file:
    json.dump(ads, file, ensure_ascii=False, indent=2)
driver.quit()
