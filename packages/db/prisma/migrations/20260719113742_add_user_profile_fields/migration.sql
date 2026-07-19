-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'INVITED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "title" TEXT;

