// Desc: Web scraping handler for updating items in database
// Path: src/updater/scraper.js
//

// Imports

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import { Item } from '../sequelize.js';
import { sendDiscordWebhook } from '../webhook.js';

puppeteer.use(StealthPlugin);
  
// Type Definitions

/**
 * @typedef {Object} trader
 * @property {string} name
 * @property {string} currency
 * @property {string} price
 */

/**
 * @typedef {Object} item
 * @property {string} name
 * @property {number} price
 * @property {number} slots
 * @property {number} pricePerSlot
 * @property {number} avg24hPrice
 * @property {string} image
 * @property {string} category
 * @property {string} subcategory
 * @property {string} wiki
 * @property {number} profitFleaVsTrader
 * @property {boolean} bannedFromFlea
 */

/**
 * @typedef {Object} items
 * @property {item[]} items
 */

// Function Definitions

/**
 * Sleep for a specified amount of time
 * @param {number} ms
 * @returns {Promise<void>} void
 * @async
 */
async function sleep(ms) {
    try {
        return new Promise((resolve) => setTimeout(resolve, ms));
    } catch (error) {
        throw new Error(`Error during sleep: ${error.message}`);
    }
}

/**
 * Update items in database
 * @param {items} items
 * @returns {Promise<void>} void
 * @throws {Error} Error
 * @async
 */
export async function update_items(items) {
    console.log(`Updating items in database...`);
    try {
        const promises = items.map(async(item) => {
            for (const [key, value] of Object.entries(item)) {
                if (value === undefined || value === null || value === '') {
                    item[key] = null;
                }
            }
            if (item.name !== undefined) {
                await sleep(2000);
                return Item.upsert({
                    id: item.name,
                    name: item.name,
                    price: item.price,
                    slots: item.slots,
                    pricePerSlot: item.pricePerSlot,
                    avg24hPrice: item.avg24hPrice,
                    image: item.image,
                    category: item.category,
                    subcategory: item.subcategory === undefined ? null : item.subcategory,
                    wiki: item.wiki,
                    sellToTrader: item.price,
                    profitFleaVsTrader: item.profitFleaVsTrader,
                    bannedFromFlea: item.bannedFromFlea,
                });
            }
        });

        const results = await Promise.all(promises);
        console.log(`Done updating items. Total: ${results.length}`);
    } catch (error) {
        console.log(`Error updating items in the database: ${error.message}, ${error}`);
        throw new Error(`Error updating items in the database: ${error.message}`);
    }
}

/**
 * Get the count of items loaded on the page
 * @param {Page} page
 * @returns {Promise<number>} count
 * @throws {Error} Error
 * @async
 */
async function getItemCount(page) {
    try {
        return await page.evaluate(() => {
            return document.querySelectorAll('span.price-main').length;
        });
    } catch (error) {
        throw new Error(`Error getting item count: ${error.message}`);
    }
}

/**
 * Scroll to the bottom of the page and wait for items to load
 * @param {Page} page
 * @returns {Promise<void>} void
 * @throws {Error} Error
 * @async
 */
async function scrollAndLoad(page) {
    try {
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
    } catch (error) {
        throw new Error(`Error scrolling and loading: ${error.message}`);
    }
}

/**
 * Evaluate page and return items
 * @param {Page} page
 * @returns {Promise<items>} items
 * @throws {Error} Error
 * @async
 */
async function evaluatePageIntoItems(page) {
    try {
        const names = await page.evaluate(() => {
            const nameElements = Array.from(document.querySelectorAll('span.name'));
            return nameElements.map((el) => el.textContent?.trim());
        });


        const items = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('div.table-list > div.row:not(:first-child)'));

            return rows.map((row) => {
                const priceSelector = `div:nth-child(7) > div > div.alt`; // Text content of the div is `Price`
                const pricePerSlotSelector = `div:nth-child(4) > div > span.price-sec`; // Text content of the span is `Price per slot`
                const avg24hPriceSelector = `div:nth-child(4) > div > span.price-main`; // Text content of the span is `24h avg`
                const imageSelector = `div:nth-child(1) > a > figure > img.img`; // src attribute of the img tag
                const categorySelector = `div:nth-child(2) > div > div > a:nth-child(1)`; // Text content of the a is `Category`
                const subCategorySelector = `div:nth-child(2) > div > div > a:nth-child(2)`; // Text content of the a is `Subcategory`
                const wikiSelector = `div:nth-child(3) > a.ext-link`; // href attribute of the a tag
                const profitFleaVsTraderSelector = `div:nth-child(8)`; // Text content of the div is `Flea vs Trader`
                const bannedFromFleaSelector = `div:nth-child(2) > div.minus`; // Text content of the span is `Banned from flea`

                let price = row.querySelector(priceSelector)?.textContent?.trim();
                let pricePerSlot = row.querySelector(pricePerSlotSelector)?.textContent?.trim();
                let avg24hPrice = row.querySelector(avg24hPriceSelector)?.textContent?.trim();
                let slots = pricePerSlot ? Math.round(avg24hPrice / pricePerSlot) : 1;
                slots = slots ? slots : 1;
                const image = row.querySelector(imageSelector)?.getAttribute('src');
                const category = row.querySelector(categorySelector)?.textContent?.trim();
                const subcategory = row.querySelector(subCategorySelector)?.textContent?.trim();
                const wiki = row.querySelector(wikiSelector)?.getAttribute('href');
                let profitFleaVsTrader = row.querySelector(profitFleaVsTraderSelector)?.textContent?.trim();
                const bannedFromFlea = row.querySelector(bannedFromFleaSelector)?.textContent?.trim() === 'Banned from flea' ? true : false;

                let currency;

                if(price.includes('₽')) {
                    currency = '₽';
                } else if(price.includes('$')) {
                    currency = '$';
                } else if(price.includes('€')) {
                    currency = '€';
                }

                price = price ? parseInt(price.replace(/,/g, '')) : 0;
                avg24hPrice = avg24hPrice ? parseInt(avg24hPrice.replace(/,/g, '')) : 0;
                pricePerSlot = pricePerSlot ? parseInt(pricePerSlot.replace(/,/g, '')) : 0;
                profitFleaVsTrader = profitFleaVsTrader ? parseInt(profitFleaVsTrader.replace(/,/g, '')) : 0;
                currency = currency ? currency : '₽';

                return {
                    price,
                    slots,
                    pricePerSlot,
                    avg24hPrice,
                    image,
                    category,
                    subcategory,
                    wiki,
                    profitFleaVsTrader,
                    bannedFromFlea,
                    currency
                }
            })
        })

        const result = names.reduce((acc, name, index) => {
            return {
                ...acc,
                [name]: {
                    name: name,
                    price: items[index].price,
                    slots: items[index].slots,
                    pricePerSlot: items[index].pricePerSlot,
                    avg24hPrice: items[index].avg24hPrice,
                    image: items[index].image,
                    category: items[index].category,
                    subcategory: items[index].subcategory,
                    wiki: items[index].wiki,
                    sellToTrader: items[index].price,
                    profitFleaVsTrader: items[index].profitFleaVsTrader,
                    bannedFromFlea: items[index].bannedFromFlea,
                }
            }
        })
        
        console.log(`Done!`);
        return result;
    } catch (error) {
        throw new Error(`Error evaluating page into items: ${error.message}`);
    }
}

/**
 * Scrape items from website
 * @returns {Promise<items>} items
 * @throws {Error} Error
 * @async
 */
export async function scrape_items() {
    console.log("Sending webhook...")
    await sendDiscordWebhook('Starting scrape_items() function... (ln. 247)')
    try {
        console.log(`Starting scrape items..`);
        // Create user agent
        console.log(`Creating user agent...`)
        const userAgent = new UserAgent();
        console.log(`Done!`)

        // Launch browser and open page in headless mode
        console.log(`Launching browser...`)
        const browser = await puppeteer.launch({
            headless: 'false', // Change to false to see browser
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log(`Done!`)

        console.log(`Opening page and setting user agent...`)
        const page = await browser.newPage();
        // Set user agent
        await page.setUserAgent(userAgent.toString());
        console.log(`Done!`)

        // Navigate to the Tarkov Market website
        console.log(`Navigating to Tarkov Market...`)
        await page.goto(`https://tarkov-market.com/`)
        console.log(`Done!`)

        // Set viewport to 1920x1080
        await page.setViewport({
            width: 1920,
            height: 1080
        });

        // Increase timeout
        await page.setDefaultNavigationTimeout(60000);

        // Wait for button to load before clicking and then wait for items to load
        console.log(`Loading first page of items...`)
        let button = await page.waitForSelector('#__nuxt > div > div > div.page-content > div.w-100 > button')
        await sleep(3000);
        button?.click()
        await page.waitForSelector('span.price-main');
        console.log(`Done!`)

        // Scroll and load dynamically loaded content
        console.log(`Loading remaining items...`)

        let previousItemCount = 0;
        let noNewItemsCount = 0;
        let limit = 20; // Set to 200 for production

        for(noNewItemsCount; noNewItemsCount < limit;) {
            const currentItemCount = await getItemCount(page);

            if(currentItemCount === previousItemCount) {
                noNewItemsCount++;
            } else {
                noNewItemsCount = 0;
            }

            await sleep(50);

            await scrollAndLoad(page);
            previousItemCount = currentItemCount;

            // Log the items only once every item
            if(currentItemCount % 100 === 0) {
                console.log(`Items loaded: ${currentItemCount}`);
            }

            if(noNewItemsCount === limit) {
                break;
            }

            
            // Breaks after {limit} items have been loaded
            if(currentItemCount === limit) {
                break;
            }
            
        }

        const items = await evaluatePageIntoItems(page);
        if(items) {
            const ArrayItems = Object.values(items);
            const data = await update_items(ArrayItems);
            console.log("Done! Sending webhook...")
            await sendDiscordWebhook('Finished scrape_items() function! (ln. 333)')
            page.close();
            return items;
        }
    } catch (error) {
        throw new Error(`Error scraping items: ${error.message}`);
    }
}
