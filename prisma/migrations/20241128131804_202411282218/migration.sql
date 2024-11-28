-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('MANAGER', 'ADMIN', 'MASTER', 'SUPERMASTER');

-- CreateEnum
CREATE TYPE "coupon_group_type" AS ENUM ('COMMON', 'PUBLIC');

-- CreateEnum
CREATE TYPE "coupon_group_status" AS ENUM ('INACTIVE', 'ACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('CANCELLED', 'PENDING', 'REJECTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "action_type" AS ENUM ('ADD', 'REMOVE');

-- CreateEnum
CREATE TYPE "ip_block_type" AS ENUM ('BLACKLIST', 'WHITELIST');

-- CreateEnum
CREATE TYPE "account_block_type" AS ENUM ('CHAT_BLOCK', 'ACCOUNT_BLOCK', 'CHAT_UNBLOCK', 'ACCOUNT_UNBLOCK');

-- CreateEnum
CREATE TYPE "penalty_type" AS ENUM ('경고', '게임정지', '구두경고', '정지해제');

-- CreateEnum
CREATE TYPE "credit_type" AS ENUM ('MONEY', 'BANKMONEY', 'CREDIT', 'CREDIT2', 'CURRENT_COIN');

-- CreateEnum
CREATE TYPE "reward_revoke_credit_type" AS ENUM ('MONEY', 'BANKMONEY', 'CREDIT', 'CREDIT2', 'ITEM');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "email" TEXT,
    "user_id" INTEGER NOT NULL,
    "email_verified" TIMESTAMP(3),
    "nickname" TEXT NOT NULL,
    "image" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'MANAGER',
    "is_permissive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_token" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "group_mail" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reward" JSONB NOT NULL DEFAULT '{}',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_mail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_mail" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reward" JSONB NOT NULL DEFAULT '{}',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "registrant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_mail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_block" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "registrant_id" TEXT,
    "type" "ip_block_type" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_block" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "account_block_type" NOT NULL,
    "block_duration" INTEGER,
    "is_permanent" BOOLEAN NOT NULL DEFAULT false,
    "registrant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_group" (
    "id" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "group_type" "coupon_group_type" NOT NULL DEFAULT 'COMMON',
    "rewards" JSONB NOT NULL DEFAULT '[]',
    "coupon_code" VARCHAR(10),
    "is_issued" BOOLEAN NOT NULL DEFAULT false,
    "usage_limit" INTEGER DEFAULT 1,
    "group_reason" TEXT NOT NULL,
    "group_status" "coupon_group_status" NOT NULL DEFAULT 'INACTIVE',
    "quantity" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon" (
    "id" TEXT NOT NULL,
    "rewards" JSONB NOT NULL DEFAULT '[]',
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "coupon_code" VARCHAR(10),
    "coupon_group_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_log" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "coupon_id" TEXT,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_quantity" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "action_type" NOT NULL DEFAULT 'ADD',
    "status" "status" NOT NULL DEFAULT 'PENDING',
    "registrant_id" TEXT,
    "approver_id" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_quantity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_revoke" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "status" NOT NULL DEFAULT 'PENDING',
    "type" "action_type" NOT NULL,
    "creditType" "reward_revoke_credit_type" NOT NULL,
    "registrant_id" TEXT,
    "approver_id" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_revoke_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "group_boolean" BOOLEAN NOT NULL,
    "min_role" "user_role" NOT NULL DEFAULT 'MANAGER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_management" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "action_type" NOT NULL,
    "credit_type" "credit_type" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "status" NOT NULL DEFAULT 'PENDING',
    "registrant_id" TEXT,
    "approver_id" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_ticket" (
    "id" TEXT NOT NULL,
    "report_id" INTEGER NOT NULL,
    "status" "status" NOT NULL DEFAULT 'PENDING',
    "registrant_id" TEXT,
    "approver_id" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "block_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "registrant_id" TEXT,
    "is_notice" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "registrant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_using_querylog" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "registrant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_using_querylog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_provider_account_id_key" ON "account"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_session_token_key" ON "session"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_identifier_token_key" ON "verification_token"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_group_group_name_key" ON "coupon_group"("group_name");

-- CreateIndex
CREATE UNIQUE INDEX "items_item_id_key" ON "items"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_group_id_key" ON "groups"("group_id");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_mail" ADD CONSTRAINT "group_mail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_mail" ADD CONSTRAINT "personal_mail_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_block" ADD CONSTRAINT "ip_block_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_block" ADD CONSTRAINT "account_block_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_coupon_group_id_fkey" FOREIGN KEY ("coupon_group_id") REFERENCES "coupon_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_log" ADD CONSTRAINT "coupon_log_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_quantity" ADD CONSTRAINT "item_quantity_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_quantity" ADD CONSTRAINT "item_quantity_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_revoke" ADD CONSTRAINT "reward_revoke_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_revoke" ADD CONSTRAINT "reward_revoke_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_management" ADD CONSTRAINT "credit_management_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_management" ADD CONSTRAINT "credit_management_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_ticket" ADD CONSTRAINT "block_ticket_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_ticket" ADD CONSTRAINT "block_ticket_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board" ADD CONSTRAINT "board_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_comment" ADD CONSTRAINT "board_comment_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_comment" ADD CONSTRAINT "board_comment_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_using_querylog" ADD CONSTRAINT "account_using_querylog_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
