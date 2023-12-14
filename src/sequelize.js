import { Sequelize } from "sequelize";
export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'src/db/dev3.db',
}); 

try {
    await sequelize.authenticate();
    sequelize.query("PRAGMA journal_mode=WAL;")
    console.log('Connection has been established successfully.');
} catch (Error) {
    console.log(`Error connecting to database: ${Error.message}`);
    process.exit(1);
}

export const Item = sequelize.define('Item', {
    id: {
        type: Sequelize.STRING,
        allowNull: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    slots: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    pricePerSlot: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    avg24hPrice: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    image: {
        type: Sequelize.STRING,
        allowNull: true
    },
    category: {
        type: Sequelize.STRING,
        allowNull: true
    },
    subcategory: {
        type: Sequelize.STRING,
        allowNull: true
    },
    wiki: {
        type: Sequelize.STRING,
        allowNull: true
    },
    sellToTrader: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    profitFleaVsTrader: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    bannedFromFlea: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    }
});

await Item.sync();