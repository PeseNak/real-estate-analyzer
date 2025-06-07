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
# options.add_argument('--headless')
options.add_argument('--window-size=1920,1080')
driver = webdriver.Chrome(options=options)
city = "langarud"
driver.get(f"https://www.sheypoor.com/s/{city}/real-estate")
sleep(1)
for i in range(8):

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
            ads_link.add(element.get_attribute("href"))
    driver.execute_script(
        "window.scrollTo(arguments[0] * 900, (arguments[0] + 1) * 900);", i)
    sleep(1)
print("tedad link ha: ", len(ads_link))


for link in ads_link:
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
        sal_sakht = int(values[keys.index("سن بنا")].replace(" سال", ""))
        sal_sakht = 1404 - sal_sakht
        otagh = keys.index("تعداد اتاق")
        ad_data = {
            "metrazh": values[metrazh],
            "sal_sakht": str(sal_sakht),
            "otagh": values[otagh]
        }
        gheymat_kol = driver.find_elements(
            By.CSS_SELECTOR, "span.flex.items-center.text-heading-4-bolder.\\!text-heading-3-bolder.\\[\\&_span\\]\\:\\!size-6")
        if gheymat_kol:
            gheymat_metri = keys.index("قیمت هر متر")
            ad_data["gheymat_kol"] = digits.convert_to_en(
                gheymat_kol[0].text.replace(",", ""))
            ad_data["gheymat_metri"] = values[gheymat_metri].replace(",", "")
        else:
            rahn = keys.index("رهن")
            ejare = keys.index("اجاره")
            ad_data["rahn"] = values[rahn].replace(
                ",", "").replace(" تومان", "")
            ad_data["ejare"] = values[ejare].replace(
                ",", "").replace(" تومان", "")
        ads.append(ad_data)
    except:
        print(f"in link kar nakard {link}")
print("scrap moafagh", len(ads))
with open("ads2.json", "w", encoding="utf-8") as file:
    json.dump(ads, file, ensure_ascii=False, indent=2)

driver.quit()
