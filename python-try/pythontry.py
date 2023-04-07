from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import undetected_chromedriver as uc
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Set up Chrome options for headless browsing and custom user-agent
chrome_options = uc.ChromeOptions()

# Use WebDriver Manager to install and manage Chrome version 112
service = Service(executable_path=ChromeDriverManager("111.0.5563.64").install())
driver = uc.Chrome(service=service, options=chrome_options)

# Replace the URL below with the URL of the website you want to access
driver.get('https://tarkov-market.com/')

# Set up a WebDriverWait object with a longer timeout value (in seconds)
wait = WebDriverWait(driver, 25)

button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#__nuxt > div > div > div.page-content > div.w-100 > button")))

# Scroll and click the button
for i in range(5):
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    button.click()
    time.sleep(3)  # Wait for items to load; increase the sleep time if necessary

# Wait for the presence of all price elements
prices = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "span.price-main")))

# Extract the text from each price element
price_texts = [price.text for price in prices]

# Print the number of prices and the list of price texts
print(len(price_texts), price_texts)
