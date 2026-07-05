-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'TOWNHOUSE', 'VILLA', 'PENTHOUSE', 'DUPLEX', 'OFFICE', 'RETAIL', 'OTHER');

-- AlterTable: add the new column nullable first so we can backfill it from
-- the old "category" column (which conflated property type + bedroom count)
ALTER TABLE "UnitType" ADD COLUMN "propertyType" "PropertyType";

-- Backfill propertyType from the old category, and backfill bedrooms for the
-- bedroom-count categories where it wasn't already set explicitly.
UPDATE "UnitType" SET
  "propertyType" = CASE "category"
    WHEN 'STUDIO' THEN 'APARTMENT'
    WHEN 'ONE_BR' THEN 'APARTMENT'
    WHEN 'TWO_BR' THEN 'APARTMENT'
    WHEN 'THREE_BR' THEN 'APARTMENT'
    WHEN 'FOUR_BR' THEN 'APARTMENT'
    WHEN 'FIVE_BR_PLUS' THEN 'APARTMENT'
    WHEN 'PENTHOUSE' THEN 'PENTHOUSE'
    WHEN 'TOWNHOUSE' THEN 'TOWNHOUSE'
    WHEN 'VILLA' THEN 'VILLA'
    WHEN 'DUPLEX' THEN 'DUPLEX'
    WHEN 'OFFICE' THEN 'OFFICE'
    WHEN 'RETAIL' THEN 'RETAIL'
    ELSE 'OTHER'
  END::"PropertyType",
  "bedrooms" = COALESCE("bedrooms", CASE "category"
    WHEN 'STUDIO' THEN 0
    WHEN 'ONE_BR' THEN 1
    WHEN 'TWO_BR' THEN 2
    WHEN 'THREE_BR' THEN 3
    WHEN 'FOUR_BR' THEN 4
    WHEN 'FIVE_BR_PLUS' THEN 5
    ELSE NULL
  END);

-- AlterTable: lock in NOT NULL + default now that every row is backfilled
ALTER TABLE "UnitType" ALTER COLUMN "propertyType" SET NOT NULL;
ALTER TABLE "UnitType" ALTER COLUMN "propertyType" SET DEFAULT 'APARTMENT';

-- AlterTable: drop the old conflated category column
ALTER TABLE "UnitType" DROP COLUMN "category";

-- DropEnum
DROP TYPE "UnitCategory";
