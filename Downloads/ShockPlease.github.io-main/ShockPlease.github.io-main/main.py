import os
from selenium import webdriver
import json
import requests
import base64
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import random
import string

length = 6

items = []

# generate a random string of uppercase letters and digits
letters_and_digits = string.ascii_uppercase + string.digits
random_string = ''.join(random.choices(letters_and_digits, k=length))

for file in os.listdir('.'):
    if file.endswith('.html'):
        os.remove(file)
        print(f'Removed {file}!')

for file in os.listdir('data'):
    if file.endswith('.json'):
        os.remove(f'data\{file}')
        print("Removed file!")
        
options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('window-size=1920x1080')
driver = webdriver.Chrome(options=options)  
driver.get("https://tarkov-market.com/")

WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, """//*[@id="__nuxt"]/div/div/div[2]/div[2]/button""")))   

load_more = driver.find_element(By.XPATH, """//*[@id="__nuxt"]/div/div/div[2]/div[2]/button""")
load_more.click()

avgPrices = driver.find_elements(By.CSS_SELECTOR, "span.price-main")
basePrices = driver.find_elements(By.CSS_SELECTOR, "div.alt")
names = driver.find_elements(By.CSS_SELECTOR, "span.name")

previous = 0

while len(names) == previous:
    names = driver.find_elements(By.CSS_SELECTOR, "span.name")

def updated(previous):
    if previous != len(names):
        return True
    elif previous == len(names):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        return False

def write(base, alt, name_list):
    strings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    alt_prices = [alt_price.text.replace("₽", "") for alt_price in alt]
    base_prices = [base_price.text.replace("₽", "") for base_price in base]
    base_prices = [item.text.replace('\u20bd', '').replace('\n', '').replace(':', '') for item in basePrices if item.text.strip() and not any(char in item.text for char in strings) and ':' not in item.text and '\n' not in item.text]
    names = [name.text for name in name_list]
    data = [{"Name": name, "Base Price": base, "Flea Price": alt} for name, base, alt in zip(names, base_prices, alt_prices)]
    with open("data\data.json", "a") as outfile: 
        if outfile.tell() == 0:  # if file is empty, write opening bracket
            outfile.write('[')
        else:  # if file is not empty, move cursor to end of last object and write comma separator
            outfile.seek(-1, 2)
            outfile.write(',')
        json.dump(data, outfile)
        outfile.write(']')

count_no_change = 0  # counter for the number of times the price count has not changed
while True:
    avgPrices = driver.find_elements(By.CSS_SELECTOR, "span.price-main")
    basePrices = driver.find_elements(By.CSS_SELECTOR, "div.alt")
    names = driver.find_elements(By.CSS_SELECTOR, "span.name")
    if updated(previous=previous): 
        current = len(names)
        if current > previous:
            previous = current
            print(f"Current progress: {current} items loaded. Previous was: {previous - 20}")
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            count_no_change = 0
            break
    else:
        count_no_change += 1
        if count_no_change == 25: 
            print("No more new prices.") # this is to prevent the script from running forever
            break


print("Writing to json...")
write(basePrices, avgPrices, names)
print("Done!")

# Set the owner, repository name, and file path
owner = 'ShockPlease'
repo = 'ShockPlease.github.io'
path = 'html/api/api.html'

# Get the personal access token from an environment variable
token = "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"
# Retrieve the current contents of index.html
headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3.raw'
}
response = requests.get(f'https://api.github.com/repos/{owner}/{repo}/contents/{path}', headers=headers)
response.raise_for_status()
content = response.content

with open('data/data.json', 'r') as data_file:
    new_content = content.decode().replace('old text', data_file.read())

# Encode the new content as base64
encoded_content = base64.b64encode(new_content.encode()).decode()

# Update the file in the repository
data = {
    'message': 'Update index.html',
    'content': encoded_content,
}
response = requests.put(f'https://api.github.com/repos/{owner}/{repo}/contents/{path}', headers=headers, json=data)
print('File updated successfully!')

driver.quit()
data_file.close()

driver.quit()
data_file.close()
