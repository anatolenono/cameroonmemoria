-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('COLOR', 'GRADIENT', 'PHOTO');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "bannerCustomUrl" TEXT,
ADD COLUMN     "bannerPresetId" TEXT;

-- CreateTable
CREATE TABLE "BannerPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BannerType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BannerPreset_isActive_type_displayOrder_idx" ON "BannerPreset"("isActive", "type", "displayOrder");

-- CreateIndex
CREATE INDEX "BannerPreset_isActive_category_displayOrder_idx" ON "BannerPreset"("isActive", "category", "displayOrder");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_bannerPresetId_fkey" FOREIGN KEY ("bannerPresetId") REFERENCES "BannerPreset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
