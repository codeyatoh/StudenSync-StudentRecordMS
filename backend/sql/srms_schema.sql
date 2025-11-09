-- Student Record Management System - Consolidated Schema
-- Applies current backend expectations (addresses.type lowercase)

CREATE DATABASE IF NOT EXISTS `sis_data` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `sis_data`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `grades`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `guardians`;
DROP TABLE IF EXISTS `contact_info`;
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `majors`;
DROP TABLE IF EXISTS `programs`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','Registrar','Staff') DEFAULT 'Staff',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB;

CREATE TABLE `programs` (
  `program_id` int(11) NOT NULL AUTO_INCREMENT,
  `program_name` varchar(150) NOT NULL,
  `program_code` varchar(20) DEFAULT NULL,
  `degree_type` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`program_id`),
  UNIQUE KEY `program_code` (`program_code`),
  KEY `last_updated_by` (`last_updated_by`),
  CONSTRAINT `programs_user_fk` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE `majors` (
  `major_id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL,
  `major_name` varchar(100) NOT NULL,
  PRIMARY KEY (`major_id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `majors_program_fk` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_number` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `gender` enum('Male','Female','Non-binary','Prefer not to say') NOT NULL,
  `citizenship` varchar(50) DEFAULT NULL,
  `place_of_birth` varchar(100) DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `civil_status` enum('Single','Married','Other') DEFAULT NULL,
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `major_id` int(11) DEFAULT NULL,
  `year_level` int(11) DEFAULT NULL,
  `academic_status` enum('Regular','Irregular','Probationary','On Leave of Absence') DEFAULT NULL,
  `enrollment_status` enum('Enrolled','Not Enrolled','Graduated','Dropped','Transferred') DEFAULT NULL,
  `date_of_admission` date DEFAULT NULL,
  `expected_graduation_date` date DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `total_units_earned` int(11) DEFAULT NULL,
  `scholarship_type` enum('None','Academic','Financial Aid','Varsity') DEFAULT NULL,
  `blood_type` varchar(5) DEFAULT NULL,
  `known_allergies` text DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `student_number` (`student_number`),
  KEY `program_id` (`program_id`),
  KEY `major_id` (`major_id`),
  KEY `last_updated_by` (`last_updated_by`),
  CONSTRAINT `students_program_fk` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE SET NULL,
  CONSTRAINT `students_major_fk` FOREIGN KEY (`major_id`) REFERENCES `majors` (`major_id`) ON DELETE SET NULL,
  CONSTRAINT `students_user_fk` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE `addresses` (
  `address_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `type` enum('current','permanent') NOT NULL,
  `street` varchar(150) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`address_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `addresses_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `contact_info` (
  `contact_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `school_email` varchar(150) DEFAULT NULL,
  `alternate_email` varchar(150) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`contact_id`),
  UNIQUE KEY `school_email` (`school_email`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `contact_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `guardians` (
  `guardian_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `guardian_full_name` varchar(150) NOT NULL,
  `guardian_relationship` varchar(50) DEFAULT NULL,
  `guardian_phone_number` varchar(20) DEFAULT NULL,
  `guardian_email` varchar(150) DEFAULT NULL,
  `guardian_address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`guardian_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `guardians_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `courses` (
  `course_id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) DEFAULT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(150) NOT NULL,
  `units` decimal(3,1) NOT NULL,
  `semester` enum('1st','2nd','Summer') DEFAULT NULL,
  `year_level` int(11) DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `course_code` (`course_code`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `courses_program_fk` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE `enrollments` (
  `enrollment_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `semester` enum('1st','2nd','Summer') NOT NULL,
  `date_enrolled` date DEFAULT NULL,
  `status` enum('Enrolled','Completed','Dropped','Failed') DEFAULT 'Enrolled',
  PRIMARY KEY (`enrollment_id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enroll_student_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `enroll_course_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `grades` (
  `grade_id` int(11) NOT NULL AUTO_INCREMENT,
  `enrollment_id` int(11) NOT NULL,
  `midterm_grade` decimal(4,2) DEFAULT NULL,
  `final_grade` decimal(4,2) DEFAULT NULL,
  `remarks` enum('Passed','Failed','Incomplete','Dropped') DEFAULT NULL,
  `date_recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`grade_id`),
  KEY `enrollment_id` (`enrollment_id`),
  CONSTRAINT `grades_enrollment_fk` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`enrollment_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed default admin (password: admin123)
INSERT INTO `users` (`username`, `password_hash`, `role`) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8K', 'Admin');

