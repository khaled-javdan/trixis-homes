-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "downPaymentPercent" DECIMAL(5,2),
ADD COLUMN     "promoDownPaymentPercent" DECIMAL(5,2),
ADD COLUMN     "promoPaymentPlan" TEXT,
ADD COLUMN     "promotionNotes" TEXT,
ADD COLUMN     "serviceCharge" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "UnitType" ADD COLUMN     "serviceCharge" DECIMAL(10,2);
