/*
  Warnings:

  - You are about to drop the column `end_date` on the `personal_mail` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `personal_mail` table. All the data in the column will be lost.
  - Added the required column `reason` to the `item_quantity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "board" ADD COLUMN     "category_id" TEXT;

-- AlterTable
ALTER TABLE "item_quantity" ADD COLUMN     "reason" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "personal_mail" DROP COLUMN "end_date",
DROP COLUMN "start_date",
ADD COLUMN     "quantity" JSONB[];

-- CreateTable
CREATE TABLE "board_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_category_name_key" ON "board_category"("name");

-- AddForeignKey
ALTER TABLE "board" ADD CONSTRAINT "board_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "board_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
