/*
  Warnings:

  - You are about to drop the column `fixedDate` on the `PaymentMilestone` table. All the data in the column will be lost.
  - You are about to drop the column `offsetMonths` on the `PaymentMilestone` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `PaymentMilestone` table. All the data in the column will be lost.
  - You are about to drop the column `timing` on the `PaymentMilestone` table. All the data in the column will be lost.
  - Added the required column `date` to the `PaymentMilestone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentMilestone" DROP COLUMN "fixedDate",
DROP COLUMN "offsetMonths",
DROP COLUMN "sortOrder",
DROP COLUMN "timing",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "PaymentMilestoneTiming";
