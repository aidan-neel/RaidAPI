// Desc: Entry point for the application
// Path: src/index.js
//

import { scrape_items } from "./updater/scraper";

async function main() {
    await scrape_items();
}

main();