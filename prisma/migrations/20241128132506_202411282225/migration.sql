/*
  Warnings:

  - The values [MANAGER,ADMIN] on the enum `user_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "user_role_new" AS ENUM ('STAFF', 'INGAME_ADMIN', 'MASTER', 'SUPERMASTER');
ALTER TABLE "groups" ALTER COLUMN "min_role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "user_role_new" USING ("role"::text::"user_role_new");
ALTER TABLE "groups" ALTER COLUMN "min_role" TYPE "user_role_new" USING ("min_role"::text::"user_role_new");
ALTER TYPE "user_role" RENAME TO "user_role_old";
ALTER TYPE "user_role_new" RENAME TO "user_role";
DROP TYPE "user_role_old";
ALTER TABLE "groups" ALTER COLUMN "min_role" SET DEFAULT 'STAFF';
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'STAFF';
COMMIT;

-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "min_role" SET DEFAULT 'STAFF';

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'STAFF';
