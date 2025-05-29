-- MySQL 메일 시스템 테이블 생성 스크립트

-- 개인 우편 테이블
CREATE TABLE `dokku_mail` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) NOT NULL,
    `need_items` LONGTEXT NULL DEFAULT '{}' COLLATE 'utf8mb4_general_ci',
    `reward_items` LONGTEXT NOT NULL DEFAULT '{}' COLLATE 'utf8mb4_general_ci',
    `created_at` DATETIME NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `FK_dokku_mail_vrp_users` (`user_id`) USING BTREE,
    CONSTRAINT `FK_dokku_mail_vrp_users` FOREIGN KEY (`user_id`) REFERENCES `vrp_users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1;

-- 단체 우편 예약 테이블
CREATE TABLE `dokku_mail_reserve` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL DEFAULT '' COLLATE 'utf8mb4_general_ci',
    `content` LONGTEXT NOT NULL DEFAULT '' COLLATE 'utf8mb4_general_ci',
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `rewards` LONGTEXT NOT NULL COLLATE 'utf8mb4_bin',
    PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1;

-- 단체 우편 수령 로그 테이블
CREATE TABLE `dokku_mail_reserve_log` (
    `event_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `claimed_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`user_id`, `event_id`) USING BTREE,
    INDEX `FK_dokku_mail_reserve_log_event` (`event_id`) USING BTREE,
    CONSTRAINT `FK_dokku_mail_reserve_log_vrp_users` FOREIGN KEY (`user_id`) REFERENCES `vrp_users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `FK_dokku_mail_reserve_log_event` FOREIGN KEY (`event_id`) REFERENCES `dokku_mail_reserve` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB; 