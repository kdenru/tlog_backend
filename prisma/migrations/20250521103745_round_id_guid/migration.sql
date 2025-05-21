/*
  Warnings:

  - The primary key for the `Round` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Round" DROP CONSTRAINT "Round_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Round_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Round_id_seq";
