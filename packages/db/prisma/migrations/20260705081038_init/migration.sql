-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('OFF_PLAN', 'UNDER_CONSTRUCTION', 'READY');

-- CreateEnum
CREATE TYPE "UnitCategory" AS ENUM ('STUDIO', 'ONE_BR', 'TWO_BR', 'THREE_BR', 'FOUR_BR', 'FIVE_BR_PLUS', 'PENTHOUSE', 'TOWNHOUSE', 'VILLA', 'DUPLEX', 'OFFICE', 'RETAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "AttachmentCategory" AS ENUM ('BROCHURE', 'FLOOR_PLAN', 'IMAGE', 'PRICE_LIST', 'OTHER');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "community" TEXT,
    "location" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'OFF_PLAN',
    "handoverDate" TIMESTAMP(3),
    "description" TEXT,
    "paymentPlan" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitType" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "UnitCategory" NOT NULL,
    "label" TEXT,
    "startingPrice" DECIMAL(14,2) NOT NULL,
    "size" DECIMAL(10,2),
    "plotSize" DECIMAL(10,2),
    "bua" DECIMAL(10,2),
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "parking" INTEGER,
    "paymentPlan" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" "AttachmentCategory" NOT NULL DEFAULT 'OTHER',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_isFavorite_idx" ON "Project"("isFavorite");

-- CreateIndex
CREATE INDEX "Project_developer_idx" ON "Project"("developer");

-- CreateIndex
CREATE INDEX "Project_location_idx" ON "Project"("location");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "UnitType_projectId_idx" ON "UnitType"("projectId");

-- CreateIndex
CREATE INDEX "Note_projectId_idx" ON "Note"("projectId");

-- CreateIndex
CREATE INDEX "Attachment_projectId_idx" ON "Attachment"("projectId");

-- AddForeignKey
ALTER TABLE "UnitType" ADD CONSTRAINT "UnitType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
