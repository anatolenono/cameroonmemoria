/*
  Warnings:

  - The values [DONATION_RECEIVED,SYSTEM_ADJUSTMENT] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `coverImageUrl` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfDeath` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfFuneral` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Announcement` table. All the data in the column will be lost.
  - The `status` column on the `Announcement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `currency` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `donationId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `fee` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `Transaction` table. All the data in the column will be lost.
  - The `status` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Gallery` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deceasedDeathDate` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deceasedName` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('FUNERAL', 'ANNIVERSARY', 'THANKS', 'OTHER');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELED');

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('DONATION', 'WITHDRAWAL', 'REFUND');
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Condolence" DROP CONSTRAINT "Condolence_announcementId_fkey";

-- DropForeignKey
ALTER TABLE "Gallery" DROP CONSTRAINT "Gallery_announcementId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_donationId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropIndex
DROP INDEX "Transaction_donationId_key";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "coverImageUrl",
DROP COLUMN "dateOfDeath",
DROP COLUMN "dateOfFuneral",
DROP COLUMN "location",
ADD COLUMN     "ceremonyDate" TIMESTAMP(3),
ADD COLUMN     "ceremonyLocation" TEXT,
ADD COLUMN     "deceasedBirthDate" TIMESTAMP(3),
ADD COLUMN     "deceasedDeathDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deceasedName" TEXT NOT NULL,
ADD COLUMN     "type" "AnnouncementType" NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AnnouncementStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "currency",
DROP COLUMN "paymentId",
DROP COLUMN "paymentMethod",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "transactionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "donationId",
DROP COLUMN "fee",
DROP COLUMN "reference",
DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "Gallery";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "address" TEXT,
    "country" TEXT,
    "city" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "announcementId" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_transactionId_key" ON "Donation"("transactionId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condolence" ADD CONSTRAINT "Condolence_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
