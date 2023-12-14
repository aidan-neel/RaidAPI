// Desc: Entry point for the application
// Path: src/index.js
//

// Import

import express from 'express';
import { Worker } from 'worker_threads';
import { Item } from './sequelize.js';

const app = express();

// Type definitions
/**
 * @typedef {Object} itemResponse
 * @property {Object} item
 * @property {Boolean} exists
 */

// Function definitions

console.log("Starting...")

/**
 * Checks if an item exists
 * @param {itemName} string
 * @returns {itemResponse} Returns an object with an {item - object} and a {exists - boolean}
 */
const getSingleItem = async(itemName) => {
    // Convert name to string
    itemName = itemName.toString();
    
    try {
        const itemInstance = await Item.findOne({
            where: {
                name: itemName
            }
        })

        const itemData = itemInstance.dataValues !== null ? itemInstance.dataValues : null;
        // If the itemData is null or undefined, exist returns false. Else, returns true.
        let exists = itemData !== null || undefined ? true : false;
        return {
            item: itemData,
            exists: exists
        }
    } catch(error) {
        console.error(error);
    }
}

/**
 * Gets all items from database
 * @returns {Array<Object>}
 */
const getAllItems = async() => {
    try {
        const items = await Item.findAll();
        if(items) {
            console.log('Done!');
            return items;
        }
    } catch(err) {
        console.error(err);
    }
}

/**
 * Starts the scraping worker
 * @returns {void}
 * @async
 */
function startScrapingWorker() {
    const worker = new Worker('./src/scraperWorker.js');
    worker.on('message', (message) => {
        console.log(`Worker: ${message}`);
        // Handle completion or error here
    });
    worker.on('error', (error) => {
        console.error(`Worker Error: ${error.message}`);
    });
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
}

const hour = 3600000; // 1 hour in milliseconds
startScrapingWorker();
setInterval(startScrapingWorker, hour); // Runs the scraping function every hour

console.log("Grabbing items...")
getAllItems().then(async(allItems) => {
    // Start Express server
    app.listen(6000, '0.0.0.0', () => {
        console.log('Server is running on port 6000');
    });

    // Endpoint to get all items
    app.get('/items', async (req, res) => {
        try {
            const allItems = await getAllItems();
            const plainDataArray = allItems.map(item => item.get({ plain: true }));
            res.json(plainDataArray);
        } catch (error) {
            res.status(500).send('Error retrieving items');
        }
    });

    // Endpoint to search for an item
    app.get('/items/:itemName', async (req, res) => {
        try {
            const itemName = decodeURIComponent(req.params.itemName);
            // Fuse.js and search logic remains the same
            let returnData = [];
            // initialize keys with 'name' being 'name' and a weight of 1
            const options = {
                keys: [
                    { name: 'name', weight: 1 },
                    { name: 'category', weight: 0 },
                    { name: 'subcategory', weight: 0 },
                    { name: 'wiki', weight: 0 },
                    { name: 'price', weight: 0 },
                    { name: 'slots', weight: 0 },
                    { name: 'pricePerSlot', weight: 0 },
                    { name: 'avg24hPrice', weight: 0 },
                    { name: 'image', weight: 0 },
                    { name: 'sellToTrader', weight: 0 },
                    { name: 'profitFleaVsTrader', weight: 0 }
                ]
            };
            
            const fuse = new Fuse(allItems, options);
            const results = fuse.search(itemName);
        
            // Use for...of loop for async operations
            for (const result of results) {
                const name = result.item.dataValues.name;
                if (name) {
                    const item = await getSingleItem(name);
                    if (item.exists) {
                        returnData.push(item.item);
                    }
                }
            }
            
            if (returnData.length > 0) {
                res.json(returnData);
            } else {
                res.status(404).send('No items found');
            }
        } catch (error) {
            res.status(500).send('Error processing request');
        }
    });

    // Handle server starting message
    app.get('*', (req, res) => {
        res.send('Server starting...');
    });
})