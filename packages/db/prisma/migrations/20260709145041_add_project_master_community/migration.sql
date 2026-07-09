-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "masterCommunity" TEXT;

-- CreateIndex
CREATE INDEX "Project_masterCommunity_idx" ON "Project"("masterCommunity");
