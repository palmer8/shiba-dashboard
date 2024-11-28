/*
  Warnings:

  - You are about to drop the column `user_id` on the `account_using_querylog` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `board` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `board_comment` table. All the data in the column will be lost.
  - You are about to drop the column `group_name` on the `groups` table. All the data in the column will be lost.
  - Changed the type of `user_id` on the `account_block` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `registrant_id` to the `board_comment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `user_id` on the `credit_management` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `group_boolean` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `user_id` on the `item_quantity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `personal_mail` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `reward_revoke` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "account_using_querylog" DROP CONSTRAINT "account_using_querylog_user_id_fkey";

-- DropForeignKey
ALTER TABLE "board" DROP CONSTRAINT "board_user_id_fkey";

-- DropForeignKey
ALTER TABLE "board_comment" DROP CONSTRAINT "board_comment_user_id_fkey";

-- AlterTable
ALTER TABLE "account_block" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "account_using_querylog" DROP COLUMN "user_id",
ADD COLUMN     "registrant_id" TEXT;

-- AlterTable
ALTER TABLE "board" DROP COLUMN "user_id",
ADD COLUMN     "registrant_id" TEXT;

-- AlterTable
ALTER TABLE "board_comment" DROP COLUMN "user_id",
ADD COLUMN     "registrant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "credit_management" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "group_name",
ADD COLUMN     "group_boolean" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "item_quantity" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "personal_mail" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "reward_revoke" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "board" ADD CONSTRAINT "board_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_comment" ADD CONSTRAINT "board_comment_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_using_querylog" ADD CONSTRAINT "account_using_querylog_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
