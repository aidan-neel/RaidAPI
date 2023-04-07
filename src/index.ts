import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import { Page } from 'puppeteer';

puppeteer.use(StealthPlugin());

async function main() {
  const userAgent = new UserAgent();
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString());

  // Set the viewport size to the desired width and height
  await page.setViewport({ width: 1920, height: 1080 });

  // Wait for 3 seconds before starting the process
  await sleep(3000);

  // Replace the URL below with the URL of the website you want to access
  await page.goto('https://tarkov-market.com/');
  await sleep(3000);

  // Increase the timeout value if necessary
  await page.setDefaultNavigationTimeout(60000);

  // Wait for the presence of the element you want to scrape
  let button = await page.waitForSelector('#__nuxt > div > div > div.page-content > div.w-100 > button')
  await sleep(3000);
  button?.click()
  await sleep(3000);

  await page.waitForSelector('span.price-main');

  // Scroll and load dynamically loaded content
  let previousItemCount = 0;
  let noNewItemsCount = 0;

  while(true) {
    const currentItemcount = await getItemCount(page);

    for(let i = 0; i < 200; i++) {
      await sleep(500);
      if (currentItemcount === previousItemCount) {
        noNewItemsCount++;
      } else {
        noNewItemsCount = 0;
      }
    }

    await sleep(300);
    console.log(`Loaded items: ${currentItemcount}`);

    await scrollAndLoad(page);
    previousItemCount = currentItemcount;

    if( noNewItemsCount === 200) {
      break;
    }
  }

  // Scrape the data after loading the dynamic content
  const names = await page.evaluate(() => {
    const nameElements = Array.from(document.querySelectorAll('span.name'));
    return nameElements.map((el: Element) => el.textContent?.trim());
  });
  
  const prices = await page.evaluate(() => {
    const priceElements = Array.from(document.querySelectorAll('span.price-main'));
    return priceElements.map((el: Element) => el.textContent?.trim());
  });
  
  const traderPriceXPath = '//*[@id="__nuxt"]/div/div/div[2]/div[2]/div[4]/div[2]/div[7]/div/div[2]/div[2]';
  const traderPriceElements = await page.$x(traderPriceXPath);
  const traderPrices = await Promise.all(
    traderPriceElements.map((el) => el.getProperty('textContent').then((prop) => prop?.jsonValue()))
  );
  
  const traderXPath = '//*[@id="__nuxt"]/div/div/div[2]/div[2]/div[4]/div[2]/div[7]/div/div[2]/div[3]';
  const traderElements = await page.$x(traderXPath);
  const traders = await Promise.all(
    traderElements.map((el) => el.getProperty('textContent').then((prop) => prop?.jsonValue()))
  );
  

const items = names.map((name, index) => {
  return {
    name: name,
    price: prices[index],
    traderPrice: traderPrices[index],
    trader: traders[index],
  };
});

console.log(items);

await browser.close();

}

async function getItemCount(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return document.querySelectorAll('span.price-main').length;
  });
}

async function scrollAndLoad(page: Page) {
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
