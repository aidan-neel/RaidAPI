/*
  Warnings:

  - The primary key for the `Item` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
INSERT INTO "new_Item" ("avg24hPrice", "bannedFromFlea", "category", "id", "image", "name", "price", "pricePerSlot", "profitFleaVsTrader", "sellToTrader", "slots", "subcategory", "wiki") SELECT "avg24hPrice", "bannedFromFlea", "category", "id", "image", "name", "price", "pricePerSlot", "profitFleaVsTrader", "sellToTrader", "slots", "subcategory", "wiki" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
