-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 18, 2023 at 02:26 PM
-- Server version: 5.7.36
-- PHP Version: 7.4.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smart_energy_monitoring`
--

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wall_outlet_id` int(11) NOT NULL,
  `notification_type` enum('WARNING','STOP','EMPTY') NOT NULL,
  `title` varchar(256) DEFAULT NULL,
  `content` text NOT NULL,
  `is_seen` tinyint(1) NOT NULL DEFAULT '0',
  `modified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
CREATE TABLE IF NOT EXISTS `properties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `property_floor_plan_id` int(11) NOT NULL,
  `property_name` varchar(128) NOT NULL,
  `property_type` enum('RESIDENTIAL','INDUSTRY') NOT NULL,
  `property_tariff` varchar(16) DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `property_floor_plans`
--

DROP TABLE IF EXISTS `property_floor_plans`;
CREATE TABLE IF NOT EXISTS `property_floor_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `data` text NOT NULL,
  `modified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `room_floor_plan_id` int(11) NOT NULL,
  `room_name` varchar(128) NOT NULL,
  `modified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `room_floor_plans`
--

DROP TABLE IF EXISTS `room_floor_plans`;
CREATE TABLE IF NOT EXISTS `room_floor_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `data` text NOT NULL,
  `modified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `task_schedules`
--

DROP TABLE IF EXISTS `task_schedules`;
CREATE TABLE IF NOT EXISTS `task_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wall_outlet_id` int(11) NOT NULL,
  `wall_outlet_identifier` varchar(128) NOT NULL,
  `action` enum('ON','OFF') NOT NULL,
  `action_datetime` datetime NOT NULL,
  `is_schedule` tinyint(1) NOT NULL DEFAULT '0',
  `modified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(128) NOT NULL,
  `email` varchar(256) NOT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `password` varchar(128) NOT NULL,
  `img` varchar(128) DEFAULT NULL,
  `messaging_token` varchar(256) NOT NULL,
  `modified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `wall_outlets`
--

DROP TABLE IF EXISTS `wall_outlets`;
CREATE TABLE IF NOT EXISTS `wall_outlets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `wall_outlet_name` varchar(128) NOT NULL,
  `wall_outlet_identifier` varchar(128) NOT NULL,
  `quick_access` tinyint(1) NOT NULL DEFAULT '0',
  `daily_warning_value` double DEFAULT NULL,
  `daily_stop_value` double DEFAULT NULL,
  `monthly_warning_value` double DEFAULT NULL,
  `monthly_stop_value` double DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `wall_outlet_schedules`
--

DROP TABLE IF EXISTS `wall_outlet_schedules`;
CREATE TABLE IF NOT EXISTS `wall_outlet_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wall_outlet_id` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` tinyint(1) DEFAULT '0',
  `modified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
