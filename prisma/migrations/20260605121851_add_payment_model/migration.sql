-- CreateEnum
CREATE TYPE "PaymentSource" AS ENUM ('STRIPE', 'ORANGE_MONEY', 'MOMO');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PLAN_UPGRADE', 'PRESTATION', 'FUNDRAISER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "paymentSource" "PaymentSource" NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "announcementId" TEXT,
    "providerId" TEXT,
    "stripePaymentId" TEXT,
    "orangeMoneyId" TEXT,
    "momoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orangeMoneyId_key" ON "Payment"("orangeMoneyId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_momoId_key" ON "Payment"("momoId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
