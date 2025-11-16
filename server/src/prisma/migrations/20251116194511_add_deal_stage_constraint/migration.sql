/*
  Warnings:

  - The `stage` column on the `Deal` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('NEW', 'PROSPECTING', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "stage",
ADD COLUMN     "stage" "Stage" NOT NULL DEFAULT 'NEW';
