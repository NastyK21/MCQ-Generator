-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- AlterTable
ALTER TABLE "public"."MCQ" ADD COLUMN     "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'medium';
