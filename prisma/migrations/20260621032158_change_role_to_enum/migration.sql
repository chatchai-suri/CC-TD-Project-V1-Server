/*
  Warnings:

  - You are about to alter the column `global_role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `global_role` ENUM('ADMIN', 'TD', 'SCORER', 'GOLFER') NOT NULL DEFAULT 'GOLFER';
