-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "slots" INTEGER NOT NULL,
    "pricePerSlot" INTEGER NOT NULL,
    "avg24hPrice" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "wiki" TEXT NOT NULL,
    "sellToTrader" INTEGER NOT NULL,
    "profitFleaVsTrader" INTEGER NOT NULL,
    "bannedFromFlea" BOOLEAN NOT NULL DEFAULT false
);
