-- CreateEnum
CREATE TYPE "PaymentMilestoneTiming" AS ENUM ('ON_BOOKING', 'DURING_CONSTRUCTION', 'ON_HANDOVER', 'AFTER_HANDOVER', 'FIXED_DATE');

-- CreateTable
CREATE TABLE "PaymentMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "timing" "PaymentMilestoneTiming" NOT NULL DEFAULT 'ON_HANDOVER',
    "offsetMonths" INTEGER,
    "fixedDate" TIMESTAMP(3),
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentMilestone_projectId_idx" ON "PaymentMilestone"("projectId");

-- AddForeignKey
ALTER TABLE "PaymentMilestone" ADD CONSTRAINT "PaymentMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
