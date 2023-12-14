import { parentPort } from 'worker_threads';
// Assuming this is in an async function
async function loadModule() {
    try {
        const scraperModule = await import('./updater/scraper.js');
        scraperModule.scrape_items().then(() => {
            parentPort.postMessage('Scraping completed');
        }).catch(error => {
            parentPort.postMessage(`Scraping failed: ${error.message}`);
        });
        
    } catch (error) {
        console.error("Error loading module:", error);
    }
}

loadModule();