/*
  Warnings:

  - Added the required column `tenant_id` to the `Produto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "tenant_id" INTEGER NOT NULL;
