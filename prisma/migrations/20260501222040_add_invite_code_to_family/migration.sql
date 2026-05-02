/*
  Warnings:

  - A unique constraint covering the columns `[invite_code]` on the table `families` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "families" ADD COLUMN     "invite_code" TEXT,
ADD COLUMN     "invite_code_expires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "families_invite_code_key" ON "families"("invite_code");
