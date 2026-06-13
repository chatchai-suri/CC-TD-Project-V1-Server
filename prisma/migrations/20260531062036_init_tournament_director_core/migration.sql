/*
  Warnings:

  - The primary key for the `Score` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `golferName` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `holeNo` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `recordedAt` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `tournamentId` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the `Golfer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `flight_id` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hole_no` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score_id` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Score` DROP PRIMARY KEY,
    DROP COLUMN `golferName`,
    DROP COLUMN `holeNo`,
    DROP COLUMN `id`,
    DROP COLUMN `recordedAt`,
    DROP COLUMN `tournamentId`,
    ADD COLUMN `flight_id` INTEGER NOT NULL,
    ADD COLUMN `hole_no` INTEGER NOT NULL,
    ADD COLUMN `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `score_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`score_id`);

-- DropTable
DROP TABLE `Golfer`;

-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `global_role` VARCHAR(191) NOT NULL DEFAULT 'golfer',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `course_id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Section` (
    `section_id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `section_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`section_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hole` (
    `hole_id` INTEGER NOT NULL AUTO_INCREMENT,
    `section_id` INTEGER NOT NULL,
    `hole_no` INTEGER NOT NULL,
    `par` INTEGER NOT NULL,
    `index` INTEGER NULL,

    PRIMARY KEY (`hole_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tournament` (
    `tournament_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_name` VARCHAR(191) NOT NULL,
    `tournament_mode` VARCHAR(191) NOT NULL DEFAULT 'Stroke Play',
    `use_age_option` BOOLEAN NOT NULL DEFAULT false,
    `course_id` INTEGER NOT NULL,
    `event_date` DATE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'setup',

    PRIMARY KEY (`tournament_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flight` (
    `flight_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_id` INTEGER NOT NULL,
    `flight_name` VARCHAR(191) NOT NULL,
    `t_off_time` VARCHAR(191) NULL,

    PRIMARY KEY (`flight_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlightMember` (
    `flight_member_id` INTEGER NOT NULL AUTO_INCREMENT,
    `flight_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `handicap_claim` INTEGER NULL,

    UNIQUE INDEX `FlightMember_flight_id_user_id_key`(`flight_id`, `user_id`),
    PRIMARY KEY (`flight_member_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Hole` ADD CONSTRAINT `Hole_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `Section`(`section_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tournament` ADD CONSTRAINT `Tournament_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`tournament_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightMember` ADD CONSTRAINT `FlightMember_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `Flight`(`flight_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightMember` ADD CONSTRAINT `FlightMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Score` ADD CONSTRAINT `Score_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `Flight`(`flight_id`) ON DELETE CASCADE ON UPDATE CASCADE;
