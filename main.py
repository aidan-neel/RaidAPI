import os
from selenium import webdriver
import json
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

for file in os.listdir('data'):
    if file.endswith('.txt'):
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

prices = driver.find_elements(By.CSS_SELECTOR, "span.price-main")
names = driver.find_elements(By.CSS_SELECTOR, "span.name")

previous = 0

while len(prices) == previous:
    prices = driver.find_elements(By.CSS_SELECTOR, "span.price-main")

def updated(previous):
    if previous != len(prices):
        return True
    elif previous == len(prices):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        return False

def write(price_list, name_list):
    prices = [price.text.replace("₽", "") for price in price_list]
    names = [name.text for name in name_list]
    data = [{"Name": name, "Price": price} for name, price in zip(names, prices)]
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
    prices = driver.find_elements(By.CSS_SELECTOR, "span.price-main")
    names = driver.find_elements(By.CSS_SELECTOR, "span.name")
    if updated(previous=previous): 
        current = len(prices)
        if current > previous:
            previous = current
            print(f"Current progress: {current} items loaded. Previous was: {previous - 20}")
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            count_no_change = 0
    else:
        count_no_change += 1
        if count_no_change == 50: 
            print("No more new prices.") # this is to prevent the script from running forever
            break

print("Writing to json...")
write(prices, names)
print("Done!")

driver.quit()
data.close()