from selenium.webdriver.chrome.options import Options
from selenium import webdriver


class BaseScraper:
    def __init__(self, is_headless: bool = True):
        self.is_headless = is_headless
        self.driver = None

    def __enter__(self):
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
        if self.is_headless:
            options.add_argument('--headless=new')

        self.driver = webdriver.Chrome(options=options)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.driver:
            self.driver.quit()


if __name__ == "__main__":
    print("this is a module!")
