-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'nikita', 'survivor');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'survivor';
