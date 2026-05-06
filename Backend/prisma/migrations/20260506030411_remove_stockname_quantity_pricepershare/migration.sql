/*
  Warnings:

  - You are about to drop the column `pricePerShare` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `stockName` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "pricePerShare",
DROP COLUMN "quantity",
DROP COLUMN "stockName";
