/*
  Warnings:

  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Flight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FlightMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Hole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Score` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tournament` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Flight` DROP FOREIGN KEY `Flight_tournament_id_fkey`;

-- DropForeignKey
ALTER TABLE `FlightMember` DROP FOREIGN KEY `FlightMember_flight_id_fkey`;

-- DropForeignKey
ALTER TABLE `FlightMember` DROP FOREIGN KEY `FlightMember_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Hole` DROP FOREIGN KEY `Hole_section_id_fkey`;

-- DropForeignKey
ALTER TABLE `Score` DROP FOREIGN KEY `Score_flight_id_fkey`;

-- DropForeignKey
ALTER TABLE `Section` DROP FOREIGN KEY `Section_course_id_fkey`;

-- DropForeignKey
ALTER TABLE `Tournament` DROP FOREIGN KEY `Tournament_course_id_fkey`;

-- DropTable
DROP TABLE `Course`;

-- DropTable
DROP TABLE `Flight`;

-- DropTable
DROP TABLE `FlightMember`;

-- DropTable
DROP TABLE `Hole`;

-- DropTable
DROP TABLE `Score`;

-- DropTable
DROP TABLE `Section`;

-- DropTable
DROP TABLE `Tournament`;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `global_role` VARCHAR(191) NOT NULL DEFAULT 'golfer',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `course_id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sections` (
    `section_id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `section_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`section_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `holes` (
    `hole_id` INTEGER NOT NULL AUTO_INCREMENT,
    `section_id` INTEGER NOT NULL,
    `hole_no` INTEGER NOT NULL,
    `par` INTEGER NOT NULL,
    `index` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`hole_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournaments` (
    `tournament_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_name` VARCHAR(191) NOT NULL,
    `tournament_mode` VARCHAR(191) NOT NULL DEFAULT 'Stroke Play',
    `use_age_option` BOOLEAN NOT NULL DEFAULT false,
    `course_id` INTEGER NOT NULL,
    `event_date` DATE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'setup',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`tournament_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flights` (
    `flight_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_id` INTEGER NOT NULL,
    `flight_name` VARCHAR(191) NOT NULL,
    `t_off_time` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`flight_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flight_members` (
    `flight_member_id` INTEGER NOT NULL AUTO_INCREMENT,
    `flight_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `handicap_claim` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `flight_members_flight_id_user_id_key`(`flight_id`, `user_id`),
    PRIMARY KEY (`flight_member_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scores` (
    `score_id` INTEGER NOT NULL AUTO_INCREMENT,
    `flight_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `hole_id` INTEGER NOT NULL,
    `strokes` INTEGER NOT NULL,
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`score_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `holes` ADD CONSTRAINT `holes_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`section_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournaments` ADD CONSTRAINT `tournaments_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flights` ADD CONSTRAINT `flights_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`tournament_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flight_members` ADD CONSTRAINT `flight_members_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `flights`(`flight_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flight_members` ADD CONSTRAINT `flight_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scores` ADD CONSTRAINT `scores_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `flights`(`flight_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scores` ADD CONSTRAINT `scores_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scores` ADD CONSTRAINT `scores_hole_id_fkey` FOREIGN KEY (`hole_id`) REFERENCES `holes`(`hole_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
