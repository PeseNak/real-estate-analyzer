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
        divar_sale, divar_rent = run_divar_scraper(city_name)
        sheypoor_sale, sheypoor_rent = run_sheypoor_scraper(city_name)
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

    top_5_sales = [p for p in all_sales if p.get('link') in top_sales_links]
    top_5_rentals = [p for p in all_rentals if p.get(
        'link') in top_rentals_links]

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

    endpoint = "https://models.github.ai/inference"
    model = "openai/gpt-4.1"
    load_dotenv()
    token = os.getenv("AZURE_AI_TOKEN")

    client = ChatCompletionsClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(token)
    )

    type_in_persian = "فروش" if property_type == "sale" else "اجاره"

    system_prompt = "شما یک دستیار متخصص در ارزیابی آگهی‌های ملکی در ایران هستید. وظیفه شما انتخاب بهترین گزینه‌ها و برگرداندن لیستی از لینک‌های آن‌هاست."
    user_prompt = f"""
    در ادامه {len(property_list)} آگهی مسکن برای {type_in_persian} آمده است.
    هر آگهی یک دیکشنری شامل اطلاعاتی مثل قیمت، متراژ و لینک است.
    لطفاً فقط ۵ مورد برتر را بر اساس بهترین ارزش (مقرون‌به‌صرفه‌ترین، بهترین نسبت قیمت به متراژ) انتخاب کن و فقط لینک‌هایشان را در خطوط جداگانه برگردان. از هرگونه متن اضافی خودداری کن.
    
    لیست آگهی‌ها:
    {json.dumps(property_list, ensure_ascii=False, indent=2)}
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

        links = [line.strip() for line in ai_response_content.splitlines()
                 if line.strip().startswith('http')]
        print(f"[AI] Extracted {len(links)} top links from AI response.")
        return links

    except Exception as e:
        print(f"[ERROR] AI request failed: {e}")
        return []
