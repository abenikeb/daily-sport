-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'UNSUBSCRIBE', 'PENDING', 'INACTIVE', 'RENEW');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activateAt" TIMESTAMP(3),
ADD COLUMN     "contractNo" TEXT,
ADD COLUMN     "lastBilledAt" TEXT,
ADD COLUMN     "refNo" TEXT,
ADD COLUMN     "subscribedAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionEnd" TIMESTAMP(3),
ADD COLUMN     "subscriptionStart" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';
