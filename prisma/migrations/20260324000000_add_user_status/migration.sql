-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
