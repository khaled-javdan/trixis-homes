-- AlterTable
ALTER TABLE "Developer" ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "isHot" BOOLEAN NOT NULL DEFAULT false;
