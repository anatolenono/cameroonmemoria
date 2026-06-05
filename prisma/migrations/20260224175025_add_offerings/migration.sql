-- CreateEnum
CREATE TYPE "OfferingType" AS ENUM ('FLOWER', 'CANDLE');

-- CreateTable
CREATE TABLE "Offering" (
    "id" TEXT NOT NULL,
    "type" "OfferingType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,

    CONSTRAINT "Offering_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Offering" ADD CONSTRAINT "Offering_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offering" ADD CONSTRAINT "Offering_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
