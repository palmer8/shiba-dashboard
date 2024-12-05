/*
  Warnings:

  - You are about to drop the `account_block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ip_block` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "account_block" DROP CONSTRAINT "account_block_registrant_id_fkey";

-- DropForeignKey
ALTER TABLE "coupon" DROP CONSTRAINT "coupon_coupon_group_id_fkey";

-- DropForeignKey
ALTER TABLE "ip_block" DROP CONSTRAINT "ip_block_registrant_id_fkey";

-- AlterTable
ALTER TABLE "credit_management" ALTER COLUMN "amount" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "item_quantity" ALTER COLUMN "quantity" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "reward_revoke" ALTER COLUMN "amount" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "account_block";

-- DropTable
DROP TABLE "ip_block";

-- DropEnum
DROP TYPE "account_block_type";

-- DropEnum
DROP TYPE "ip_block_type";

-- AddForeignKey
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_coupon_group_id_fkey" FOREIGN KEY ("coupon_group_id") REFERENCES "coupon_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
