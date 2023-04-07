import puppeteer from 'puppeteer';
async function main() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Replace the URL below with the URL of the website you want to access
    await page.goto('https://tarkov-market.com/');
    // Increase the timeout value if necessary
    await page.setDefaultNavigationTimeout(60000);
    // Wait for the presence of the element you want to scrape
    await page.waitForSelector('span.price-main');
    // Scroll and load dynamically loaded content
    for (let i = 0; i < 5; i++) {
        await scrollAndLoad(page);
    }
    // Scrape the data after loading the dynamic content
    const prices = await page.evaluate(() => {
        const priceElements = Array.from(document.querySelectorAll('span.price-main'));
        return priceElements.map((el) => el.textContent);
    });
    console.log(prices);
    await browser.close();
}
async function scrollAndLoad(page) {
    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
    });
    // Adjust the sleep time to allow the dynamic content to load
    await sleep(3000);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
main();
