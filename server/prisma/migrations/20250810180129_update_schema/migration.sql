/*
  Warnings:

  - Added the required column `updatedAt` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MCQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctAnswer` to the `MCQHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isCorrect` to the `MCQHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `MCQHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MCQHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAnswer` to the `MCQHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MCQHistory" DROP CONSTRAINT "MCQHistory_mcqId_fkey";

-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."MCQ" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."MCQHistory" ADD COLUMN     "correctAnswer" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL,
ADD COLUMN     "question" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAnswer" TEXT NOT NULL,
ALTER COLUMN "mcqId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."MCQHistory" ADD CONSTRAINT "MCQHistory_mcqId_fkey" FOREIGN KEY ("mcqId") REFERENCES "public"."MCQ"("id") ON DELETE SET NULL ON UPDATE CASCADE;
