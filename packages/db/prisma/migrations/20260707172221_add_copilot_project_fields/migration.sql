-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "availableUnitsCount" INTEGER,
ADD COLUMN     "brandName" TEXT,
ADD COLUMN     "brandedResidence" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "familyRating" INTEGER,
ADD COLUMN     "golf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "investmentRating" INTEGER,
ADD COLUMN     "luxuryRating" INTEGER,
ADD COLUMN     "sellingPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "waterfront" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Project_city_idx" ON "Project"("city");

-- CreateIndex
CREATE INDEX "Project_waterfront_idx" ON "Project"("waterfront");

-- CreateIndex
CREATE INDEX "Project_golf_idx" ON "Project"("golf");

-- CreateIndex
CREATE INDEX "Project_brandedResidence_idx" ON "Project"("brandedResidence");
