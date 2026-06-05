-- CreateEnum
CREATE TYPE "AnnouncementPlan" AS ENUM ('FREE', 'ESSENTIAL', 'COMPLETE', 'PREMIUM');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "plan" "AnnouncementPlan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planPaidAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AnnouncementAdmin" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementAdmin_announcementId_userId_key" ON "AnnouncementAdmin"("announcementId", "userId");

-- AddForeignKey
ALTER TABLE "AnnouncementAdmin" ADD CONSTRAINT "AnnouncementAdmin_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementAdmin" ADD CONSTRAINT "AnnouncementAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
