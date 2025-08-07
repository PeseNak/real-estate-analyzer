from django.http import JsonResponse
from django.shortcuts import render
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json
import os

from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

from scraper.divaar_scrap import run_scraper as run_divar_scraper
from scraper.sheypoor_scrap import run_scraper as run_sheypoor_scraper


def get_city_data_view(request, city_name):

    sale_filename = f"database/{city_name}_sales.json"
    should_scrape = False

    if os.path.exists(sale_filename):
        file_mod_time = os.path.getmtime(sale_filename)
        if datetime.now() - datetime.fromtimestamp(file_mod_time) > timedelta(hours=12):
            print(
                f"[INFO] Data for {city_name} is outdated. Scraping required.")
            should_scrape = True
    else:
        print(
            f"[INFO] No existing data found for {city_name}. Scraping required.")
        should_scrape = True

    if should_scrape:
        print("[SCRAPER] Starting scraping process...")
        divar_sale, divar_rent = run_divar_scraper(city_name, 2)
        sheypoor_sale, sheypoor_rent = run_sheypoor_scraper(city_name, 10)
        all_sales = divar_sale + sheypoor_sale
        all_rentals = divar_rent + sheypoor_rent

        with open(sale_filename, 'w', encoding='utf-8') as f:
            json.dump(all_sales, f, ensure_ascii=False, indent=2)
        with open(f"database/{city_name}_rentals.json", 'w', encoding='utf-8') as f:
            json.dump(all_rentals, f, ensure_ascii=False, indent=2)

        print("[SCRAPER] Scraping and saving completed successfully.")
    else:
        with open(sale_filename, 'r', encoding='utf-8') as f:
            all_sales = json.load(f)
        with open(f"database/{city_name}_rentals.json", 'r', encoding='utf-8') as f:
            all_rentals = json.load(f)

    print("[AI] Sending data to Azure AI for analysis...")
    top_sales_links = analyze_properties_with_azure_ai(all_sales, "sale")
    top_rentals_links = analyze_properties_with_azure_ai(all_rentals, "rent")

    # top_5_sales = [p for p in all_sales if p.get('link') in top_sales_links]
    # top_5_rentals = [p for p in all_rentals if p.get(
    #     'link') in top_rentals_links]

    sales_explanation_map = {item.get('link'): item.get('explanation') for item in top_sales_links}
    rentals_explanation_map = {item.get('link'): item.get('explanation') for item in top_rentals_links}

    top_5_sales = [p for p in all_sales if p.get('link') in sales_explanation_map]
    top_5_rentals = [p for p in all_rentals if p.get('link') in rentals_explanation_map]

    for prop in top_5_sales:
        prop['explanation'] = sales_explanation_map.get(prop['link'])
    
    for prop in top_5_rentals:
        prop['explanation'] = rentals_explanation_map.get(prop['link'])

    print(
        f"[SUCCESS] AI analysis completed for {city_name}. Returning top results.")
    response_data = {
        "city": city_name,
        "sales_properties": top_5_sales,
        "rentals_properties": top_5_rentals,
    }
    return JsonResponse(response_data)


def analyze_properties_with_azure_ai(property_list, property_type):

    if not property_list:
        print("[WARN] Property list is empty. Skipping AI analysis.")
        return []
    
    properties_for_ai = []
    for prop in property_list:
        clean_prop = {
            "link": prop.get("link"),
            "area_m2": prop.get("area_m2"),
            "building_age": prop.get("building_age"),
            "room_count": prop.get("room_count"),
        }
        if prop.get("total_price_toman"):
            clean_prop["total_price_toman"] = prop.get("total_price_toman")
            clean_prop["price_per_m2_toman"] = prop.get("price_per_m2_toman")
        if prop.get("deposit_toman"):
            clean_prop["deposit_toman"] = prop.get("deposit_toman")
            clean_prop["monthly_rent_toman"] = prop.get("monthly_rent_toman")
        
        properties_for_ai.append(clean_prop)

    endpoint = "https://models.github.ai/inference"
    model = "openai/gpt-4.1"
    load_dotenv()
    token = os.getenv("AI_API_TOKEN")
    client = ChatCompletionsClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(token)
    )

    type_in_persian = "فروش" if property_type == "sale" else "اجاره"
    system_prompt = "شما یک دستیار هوش مصنوعی و متخصص در تحلیل و ارزیابی املاک در ایران هستید. وظیفه شما انتخاب بهترین گزینه‌ها و ارائه دلیل برای هر انتخاب است."
        
    user_prompt = f"""
    در ادامه لیستی از آگهی‌های مسکن برای {type_in_persian} آمده است.
    لطفاً حداقل ۳ و حداکثر ۵ مورد برتر را بر اساس بهترین ارزش (نسبت قیمت به متراژ، سن بنا و ویژگی‌های دیگر) انتخاب کن.

    برای هر ملک که انتخاب می‌کنی، یک توضیح کوتاه ۲ تا ۳ جمله‌ای به زبان فارسی بنویس که چرا آن را به عنوان یک گزینه خوب انتخاب کردی.

    پاسخ خود را **فقط و فقط** در قالب یک آرایه JSON معتبر برگردان.
    هر آبجکت در این آرایه باید دقیقاً دو کلید داشته باشد:
    ۱. "link" (که مقدار آن لینک آگهی است)
    ۲. "explanation" (که مقدار آن توضیح شماست)

    مثال فرمت خروجی:
    [
    {{"link": "https://divar.ir/v/...", "explanation": "این ملک به دلیل قیمت بسیار مناسب به ازای هر متر و سن کم بنا، یک گزینه عالی برای سرمایه‌گذاری است."}},
    {{"link": "https://divar.ir/v/...", "explanation": "با توجه به متراژ بالا و تعداد اتاق خواب، این آپارتمان برای خانواده‌های پرجمعیت بسیار ارزشمند است."}}
    ]

    لیست آگهی‌ها:
    {json.dumps(properties_for_ai, ensure_ascii=False, indent=2)}
    """

    try:
        response = client.complete(
            messages=[
                SystemMessage(system_prompt),
                UserMessage(user_prompt),
            ],
            model=model
        )
        ai_response_content = response.choices[0].message.content
        print("[AI] Raw response received from AI.")

        ai_results = json.loads(ai_response_content)

        if isinstance(ai_results, list):
            return ai_results
        for key in ai_results.keys():
            if isinstance(ai_results[key], list):
                return ai_results[key]
        return []

    except Exception as e:
        print(f"[ERROR] AI request failed: {e}")
        return []
