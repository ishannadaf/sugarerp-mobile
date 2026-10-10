CREATE DATABASE  IF NOT EXISTS `sugarfactory` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sugarfactory`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: sugarfactory
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES ('9ac91eef570a');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `districts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_districts_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES (1,'Sangli','Maharashtra',1);
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_years`
--

DROP TABLE IF EXISTS `financial_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_years` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_current` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_years`
--

LOCK TABLES `financial_years` WRITE;
/*!40000 ALTER TABLE `financial_years` DISABLE KEYS */;
INSERT INTO `financial_years` VALUES (1,'2026-27','2026-04-01','2027-03-31',1,1,'2026-10-09 00:00:00');
/*!40000 ALTER TABLE `financial_years` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member_share_capital`
--

DROP TABLE IF EXISTS `member_share_capital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member_share_capital` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `share_number` int NOT NULL,
  `amount_paid` decimal(12,2) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_member_share_capital_member_share` (`member_id`,`share_number`),
  KEY `ix_member_share_capital_id` (`id`),
  KEY `ix_member_share_capital_member_id` (`member_id`),
  CONSTRAINT `member_share_capital_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member_share_capital`
--

LOCK TABLES `member_share_capital` WRITE;
/*!40000 ALTER TABLE `member_share_capital` DISABLE KEYS */;
/*!40000 ALTER TABLE `member_share_capital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `village_id` int NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `shares` int NOT NULL,
  `eligibility_kg` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_members_member_code` (`member_code`),
  KEY `ix_members_village_id` (`village_id`),
  CONSTRAINT `members_ibfk_1` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'USER_VIEW','View users',1),(2,'USER_CREATE','Create users',1),(3,'USER_EDIT','Edit users',1),(4,'USER_DELETE','Delete users',1),(5,'ROLE_VIEW','View roles',1),(6,'ROLE_CREATE','Create roles',1),(7,'ROLE_EDIT','Edit roles',1),(8,'MEMBER_VIEW','View members',1),(9,'MEMBER_CREATE','Create members',1),(10,'MEMBER_EDIT','Edit members',1),(11,'MEMBER_DELETE','Delete members',1),(12,'ROUTE_VIEW','View routes',1),(13,'ROUTE_CREATE','Create routes',1),(14,'ROUTE_EDIT','Edit routes',1),(15,'ROUTE_DELETE','Delete routes',1),(16,'VILLAGE_VIEW','View villages',1),(17,'VILLAGE_CREATE','Create villages',1),(18,'VILLAGE_EDIT','Edit villages',1),(19,'RATE_VIEW','View rates',1),(20,'RATE_CREATE','Create rates',1),(21,'RATE_EDIT','Edit rates',1),(22,'STOCK_VIEW','View stock',1),(23,'STOCK_CREATE','Add stock',1),(24,'STOCK_EDIT','Edit stock',1),(25,'DISTRIBUTION_VIEW','View distribution',1),(26,'DISTRIBUTION_CREATE','Create distribution',1),(27,'DISTRIBUTION_EDIT','Edit distribution',1),(28,'DISTRIBUTION_DELETE','Delete distribution',1),(29,'PAYMENT_VIEW','View payments',1),(30,'PAYMENT_CREATE','Create payments',1),(31,'PAYMENT_EDIT','Edit payments',1),(32,'REPORT_VIEW','View reports',1),(33,'REPORT_EXPORT','Export reports',1),(34,'AUDIT_VIEW','View audit logs',1),(35,'FINANCIAL_YEAR_VIEW','View financial years',1),(36,'FINANCIAL_YEAR_CREATE','Create financial years',1),(37,'FINANCIAL_YEAR_EDIT','Edit financial years',1);
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(2,8),(3,8),(1,9),(3,9),(1,10),(3,10),(1,11),(1,12),(2,12),(3,12),(1,13),(3,13),(1,14),(3,14),(1,15),(1,16),(2,16),(3,16),(1,17),(3,17),(1,18),(3,18),(1,19),(2,19),(3,19),(1,20),(1,21),(1,22),(2,22),(3,22),(1,23),(1,24),(1,25),(2,25),(3,25),(1,26),(2,26),(1,27),(3,27),(1,28),(1,29),(3,29),(1,30),(1,31),(1,32),(3,32),(1,33),(3,33),(1,34),(1,35),(1,36),(1,37);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'MASTER','Full system administrator',1,'2026-10-09 02:48:55'),(2,'DISTRIBUTION_WORKER','Field worker who creates distribution entries',1,'2026-10-09 02:48:55'),(3,'SUPERVISOR','Supervisor who manages field operations',1,'2026-10-09 02:48:55');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_workers`
--

DROP TABLE IF EXISTS `route_workers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route_workers` (
  `route_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`route_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `route_workers_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `route_workers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_workers`
--

LOCK TABLES `route_workers` WRITE;
/*!40000 ALTER TABLE `route_workers` DISABLE KEYS */;
/*!40000 ALTER TABLE `route_workers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `financial_year_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_route_code_financial_year` (`code`,`financial_year_id`),
  UNIQUE KEY `ix_routes_code` (`code`),
  KEY `ix_routes_financial_year_id` (`financial_year_id`),
  CONSTRAINT `routes_ibfk_1` FOREIGN KEY (`financial_year_id`) REFERENCES `financial_years` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routes`
--

LOCK TABLES `routes` WRITE;
/*!40000 ALTER TABLE `routes` DISABLE KEYS */;
INSERT INTO `routes` VALUES (1,'R1','Default Route',NULL,1,1,'2026-10-09 00:00:00','2026-10-09 00:00:00');
/*!40000 ALTER TABLE `routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `share_capital_rates`
--

DROP TABLE IF EXISTS `share_capital_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `share_capital_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tier_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `minimum_paid_per_share` decimal(12,2) NOT NULL,
  `rate_per_kg` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tier_code` (`tier_code`),
  KEY `ix_share_capital_rates_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `share_capital_rates`
--

LOCK TABLES `share_capital_rates` WRITE;
/*!40000 ALTER TABLE `share_capital_rates` DISABLE KEYS */;
/*!40000 ALTER TABLE `share_capital_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sugar_distributions`
--

DROP TABLE IF EXISTS `sugar_distributions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sugar_distributions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `distribution_date` date NOT NULL,
  `route_id` int NOT NULL,
  `village_id` int NOT NULL,
  `member_id` int NOT NULL,
  `worker_id` int NOT NULL,
  `sugar_rate_id` int DEFAULT NULL,
  `bag_count` int NOT NULL,
  `bag_weight_kg` decimal(10,2) NOT NULL,
  `rate_per_kg` decimal(10,2) NOT NULL,
  `total_weight_kg` decimal(12,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `delivery_photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_sugar_distributions_distribution_date` (`distribution_date`),
  KEY `ix_sugar_distributions_member_id` (`member_id`),
  KEY `ix_sugar_distributions_route_id` (`route_id`),
  KEY `ix_sugar_distributions_sugar_rate_id` (`sugar_rate_id`),
  KEY `ix_sugar_distributions_village_id` (`village_id`),
  KEY `ix_sugar_distributions_worker_id` (`worker_id`),
  CONSTRAINT `sugar_distributions_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `sugar_distributions_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `sugar_distributions_ibfk_3` FOREIGN KEY (`sugar_rate_id`) REFERENCES `sugar_rates` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `sugar_distributions_ibfk_4` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `sugar_distributions_ibfk_5` FOREIGN KEY (`worker_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sugar_distributions`
--

LOCK TABLES `sugar_distributions` WRITE;
/*!40000 ALTER TABLE `sugar_distributions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sugar_distributions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sugar_payments`
--

DROP TABLE IF EXISTS `sugar_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sugar_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `distribution_id` int NOT NULL,
  `member_id` int NOT NULL,
  `collection_worker_id` int NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_mode` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_sugar_payments_collection_worker_id` (`collection_worker_id`),
  KEY `ix_sugar_payments_distribution_id` (`distribution_id`),
  KEY `ix_sugar_payments_member_id` (`member_id`),
  KEY `ix_sugar_payments_payment_date` (`payment_date`),
  CONSTRAINT `sugar_payments_ibfk_1` FOREIGN KEY (`collection_worker_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `sugar_payments_ibfk_2` FOREIGN KEY (`distribution_id`) REFERENCES `sugar_distributions` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `sugar_payments_ibfk_3` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sugar_payments`
--

LOCK TABLES `sugar_payments` WRITE;
/*!40000 ALTER TABLE `sugar_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `sugar_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sugar_rates`
--

DROP TABLE IF EXISTS `sugar_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sugar_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `financial_year_id` int NOT NULL,
  `rate` double NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_sugar_rates_financial_year_id` (`financial_year_id`),
  CONSTRAINT `sugar_rates_ibfk_1` FOREIGN KEY (`financial_year_id`) REFERENCES `financial_years` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sugar_rates`
--

LOCK TABLES `sugar_rates` WRITE;
/*!40000 ALTER TABLE `sugar_rates` DISABLE KEYS */;
/*!40000 ALTER TABLE `sugar_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `talukas`
--

DROP TABLE IF EXISTS `talukas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `talukas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_talukas_district_id` (`district_id`),
  KEY `ix_talukas_name` (`name`),
  CONSTRAINT `talukas_ibfk_1` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `talukas`
--

LOCK TABLES `talukas` WRITE;
/*!40000 ALTER TABLE `talukas` DISABLE KEYS */;
INSERT INTO `talukas` VALUES (1,'Miraj',1,1),(2,'Tasgaon',1,1),(3,'Kavathe Mahankal',1,1),(4,'Jat',1,1),(5,'Atpadi',1,1),(6,'Khanapur (Vita)',1,1),(7,'Palus',1,1),(8,'Kadegaon',1,1),(9,'Walwa (Islampur)',1,1),(10,'Shirala',1,1);
/*!40000 ALTER TABLE `talukas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1),(2,2),(3,2),(4,2),(5,2),(6,2),(7,2),(8,2),(9,2),(10,2),(11,2),(12,2),(13,2),(14,2),(15,2),(16,2),(17,2),(18,2),(19,2),(20,2),(21,2);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'master','$argon2id$v=19$m=65536,t=3,p=4$xz1kpQvsHh/bij46LwgSIw$loqE6+nxBIy1MGnD2R5QW5FYstR0BYTq6Q6GCk3W8jE','ishan nadaf','8530013777',1,'2026-10-09 02:51:01','2026-10-09 02:51:01'),(2,'worker01','$argon2id$v=19$m=65536,t=3,p=4$aLvM+JMTrjX7UKsCj3KWxw$C4M0PREsYOaUy2RV12lYbCevpTQNieD19yDgfn/38w8','Distribution Worker 1',NULL,1,'2026-10-09 11:58:25','2026-10-09 11:58:25'),(3,'worker02','$argon2id$v=19$m=65536,t=3,p=4$W6CRHfBQ+nQMkvVQen05pQ$TCkbWnUb6r1TMgDlYRgIA3Ebyz6OiM1nLLAT4hCSvGY','Distribution Worker 2',NULL,1,'2026-10-09 11:58:25','2026-10-09 11:58:25'),(4,'worker03','$argon2id$v=19$m=65536,t=3,p=4$H4utcB/nLMdHTuK1Td29PQ$1qOZnt6h/OqBhjjqzrOvql9C5ATMcEhfPDKcm8hPGPU','Distribution Worker 3',NULL,1,'2026-10-09 11:58:25','2026-10-09 11:58:25'),(5,'worker04','$argon2id$v=19$m=65536,t=3,p=4$D6AkWYqx/xtHJnrVFRpocg$QyJnK/PGomAgJOjLYbLqbd3jxoURwONUwNlWjDsoypg','Distribution Worker 4',NULL,1,'2026-10-09 11:58:25','2026-10-09 11:58:25'),(6,'worker05','$argon2id$v=19$m=65536,t=3,p=4$aZ8aQb0ldJWnH3CLkRKF1w$84AAKMrL6rY3LkFNxUGNUhjDfQOW8kd+nGXIQP4vxlk','Distribution Worker 5',NULL,1,'2026-10-09 11:58:25','2026-10-09 11:58:25'),(7,'worker06','$argon2id$v=19$m=65536,t=3,p=4$ybFjr0W5B28DLCNLlIwUOg$nNekXfNhk8I0U4mZRVn+Zg04TQSU5UttVdDjjZhzZMM','Distribution Worker 6',NULL,1,'2026-10-09 11:58:25','2026-10-09 11:58:25'),(8,'worker07','$argon2id$v=19$m=65536,t=3,p=4$/bJHXYTZYpmPJP+zvICPog$3hpbaPCPwtA66Eh8CywGfViPQxB5NJqeXCf3D3QmDhI','Distribution Worker 7',NULL,1,'2026-10-09 11:58:25','2026-10-09 11:58:25'),(9,'worker08','$argon2id$v=19$m=65536,t=3,p=4$UlxD4sBkQY8IeBzq0ai7kA$nWIwJVDm7mEcV3Jnpl3Br9iIf3EDBvG6Cy6W/m5ZQRM','Distribution Worker 8',NULL,1,'2026-10-09 11:58:25','2026-10-09 11:58:25'),(10,'worker09','$argon2id$v=19$m=65536,t=3,p=4$7kIdrCY81HtBVeHo/qMFqg$vTrCy9j/k2t+78TJeReAw33vilYO3rEtFs5QQ3XVKMs','Distribution Worker 9',NULL,1,'2026-10-09 11:58:25','2026-10-09 11:58:25'),(11,'worker10','$argon2id$v=19$m=65536,t=3,p=4$dHaPyPqEqBMa4iIWpFGQJA$57uugFNRd8LLnk735hx2rOclv9g++6LOY1xbd/pzphI','Distribution Worker 10',NULL,1,'2026-10-09 11:58:25','2026-10-09 11:58:25'),(12,'user1','$argon2id$v=19$m=65536,t=3,p=4$ccy61TCyP358QrqppzqV2w$2R4e+j3wrIQQqFj//4vQHdmjAlrmc+Z/jHV0PwxqCEI','Distribution Worker 1',NULL,1,'2026-10-09 12:04:22','2026-10-09 12:04:22'),(13,'user2','$argon2id$v=19$m=65536,t=3,p=4$4er5WwG4G+twZSyZJBFosQ$Ugex0NVoWdqg4MB78a9jlu4FRpUfATUVDqyYpn/+nEk','Distribution Worker 2',NULL,1,'2026-10-09 12:04:22','2026-10-09 12:04:22'),(14,'user3','$argon2id$v=19$m=65536,t=3,p=4$Ns0McHWz+O9PEJgLVL7MMw$0oXc6YVappb/YxZMi8OFldU1iNYmZVDwZxd3Q8Jy7wM','Distribution Worker 3',NULL,1,'2026-10-09 12:04:22','2026-10-09 12:04:22'),(15,'user4','$argon2id$v=19$m=65536,t=3,p=4$Arn3RSDnCGr0OtypqTMPLQ$sNoeesvj/+2y+pd44w76Dn4mzpVt6QNPdc+bl9GRFIM','Distribution Worker 4',NULL,1,'2026-10-09 12:04:22','2026-10-09 12:04:22'),(16,'user5','$argon2id$v=19$m=65536,t=3,p=4$TubgDC6N6G6rhwlTDvPIfw$E1b9pA6im2o95GZPYMT1C/9gj6rb2OYQc1PNUkbx78g','Distribution Worker 5',NULL,1,'2026-10-09 12:04:22','2026-10-09 12:04:22'),(17,'user6','$argon2id$v=19$m=65536,t=3,p=4$lHXrTZ+RrJ14qY+EjEFo4g$Hbey6IucFv15YLtLPjPRWi0Tu3u7XZx51LB6Smj+wYs','Distribution Worker 6',NULL,1,'2026-10-09 12:04:22','2026-10-09 12:04:22'),(18,'user7','$argon2id$v=19$m=65536,t=3,p=4$lTAr+Bex5PO9yBr/xTJpvQ$/G+bVPpa24aon8rwJVch2ZW/dlzb3qeQ5FkevoDxpqE','Distribution Worker 7',NULL,1,'2026-10-09 12:04:22','2026-10-09 12:04:22'),(19,'user8','$argon2id$v=19$m=65536,t=3,p=4$zCzvft3XKMAVmJUv1ybNuw$C+ILKj021YFeUSFdyxHlU88/xh3jaI+JlQCKt/6gljk','Distribution Worker 8',NULL,1,'2026-10-09 12:04:22','2026-10-09 12:04:22'),(20,'user9','$argon2id$v=19$m=65536,t=3,p=4$rW4JoMQ2B2AVUbwR0/Uq6Q$JNFhYtLHPwSMfRoZZo28DCO1kjDcobNWNAmRzS4Uw28','Distribution Worker 9',NULL,1,'2026-10-09 12:04:22','2026-10-09 12:04:22'),(21,'user10','$argon2id$v=19$m=65536,t=3,p=4$I+nQqTLOp3fAn9flCAmk8A$ZpbaEIGbQNFmEMkZAwHkK/1qcERG++8UHKiJsCGzTy8','Distribution Worker 10',NULL,1,'2026-10-09 12:04:22','2026-10-09 12:04:22');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `villages`
--

DROP TABLE IF EXISTS `villages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `villages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_id` int DEFAULT NULL,
  `sequence_no` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `taluka_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_villages_name` (`name`),
  KEY `ix_villages_route_id` (`route_id`),
  KEY `ix_villages_taluka_id` (`taluka_id`),
  CONSTRAINT `villages_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `villages_ibfk_2` FOREIGN KEY (`taluka_id`) REFERENCES `talukas` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1015 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `villages`
--

LOCK TABLES `villages` WRITE;
/*!40000 ALTER TABLE `villages` DISABLE KEYS */;
INSERT INTO `villages` VALUES (1,'Ankali',NULL,1,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(2,'Arag',NULL,2,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(3,'Bamani',NULL,3,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(4,'Bamnoli',NULL,4,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(5,'Bedag',NULL,5,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(6,'Belanki',NULL,6,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(7,'Bhose',NULL,7,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(8,'Bisur',NULL,8,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(9,'Bolwad',NULL,9,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(10,'Chabukswarwadi',NULL,10,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(11,'Dhavali',NULL,11,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(12,'Dongarwadi',NULL,12,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(13,'Dudhgaon',NULL,13,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(14,'Erandoli',NULL,14,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(15,'Gundewadi',NULL,15,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(16,'Haripur',NULL,16,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(17,'Inam Dhamani',NULL,17,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(18,'Janaraowadi',NULL,18,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(19,'Kadamwadi',NULL,19,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(20,'Kakadwadi',NULL,20,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(21,'Kalambi',NULL,21,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(22,'Kanadwadi',NULL,22,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(23,'Karnal',NULL,23,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(24,'Karoli',NULL,24,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(25,'Kasabe Digraj',NULL,25,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(26,'Kavaji Khotwadi',NULL,26,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(27,'Kavalapur',NULL,27,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(28,'Kavathe Piran',NULL,28,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(29,'Khanderajuri',NULL,29,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(30,'Kharkatwadi',NULL,30,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(31,'Khatav',NULL,31,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(32,'Laxmiwadi',NULL,32,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(33,'Lingnur',NULL,33,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(34,'Malewadi',NULL,34,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(35,'Malgaon',NULL,35,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(36,'Malwadi',NULL,36,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(37,'Manmodi',NULL,37,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(38,'Mhaisal',NULL,38,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(39,'Mouje Digraj',NULL,39,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(40,'Nandra',NULL,40,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(41,'Narwad',NULL,41,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(42,'Nilaji',NULL,42,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(43,'Padmale',NULL,43,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(44,'Patgaon',NULL,44,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(45,'Payappachiwadi',NULL,45,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(46,'Rasulwadi',NULL,46,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(47,'Salgare',NULL,47,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(48,'Sambarwadi',NULL,48,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(49,'Samdoli',NULL,49,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(50,'Santoshwadi',NULL,50,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(51,'Savali',NULL,51,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(52,'Savalwadi',NULL,52,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(53,'Sheri Kavathe',NULL,53,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(54,'Shindewadi',NULL,54,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(55,'Shipur',NULL,55,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(56,'Siddhewadi',NULL,56,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(57,'Soni',NULL,57,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(58,'Takali',NULL,58,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(59,'Tanang',NULL,59,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(60,'Tung',NULL,60,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(61,'Vaddi',NULL,61,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(62,'Vijay Nagar',NULL,62,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(63,'Vyankuchiwadi',NULL,63,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(64,'Wajegaon',NULL,64,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',1),(128,'Alate',NULL,1,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(129,'Anjani',NULL,2,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(130,'Arwade',NULL,3,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(131,'Balgavade',NULL,4,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(132,'Bastawade',NULL,5,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(133,'Bendri',NULL,6,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(134,'Bhairvawadi',NULL,7,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(135,'Biranwadi',NULL,8,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(136,'Borgaon',NULL,9,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(137,'Chikhal Gothan',NULL,10,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(138,'Chinchani',NULL,11,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(139,'Dahiwadi',NULL,12,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(140,'Dhavali',NULL,13,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(141,'Dhondewadi',NULL,14,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(142,'Dhulgaon',NULL,15,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(143,'Dongarsoni',NULL,16,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(144,'Dorli',NULL,17,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(145,'Gaurgaon',NULL,18,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(146,'Gavhan',NULL,19,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(147,'Gotewadi',NULL,20,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(148,'Hatnoli',NULL,21,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(149,'Hatnoor',NULL,22,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(150,'Jarandi',NULL,23,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(151,'Julewadi',NULL,24,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(152,'Kacharewadi',NULL,25,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(153,'Kaulage',NULL,26,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(154,'Kavathe Ekand',NULL,27,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(155,'Khalsa Dhamani',NULL,28,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(156,'Khujagaon',NULL,29,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(157,'Kindarwadi',NULL,30,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(158,'Kumathe',NULL,31,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(159,'Limb',NULL,32,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(160,'Lode',NULL,33,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(161,'Lokarewadi',NULL,34,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(162,'Manerajuri',NULL,35,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(163,'Manjarde',NULL,36,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(164,'Matkunki',NULL,37,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(165,'Morale Ped',NULL,38,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(166,'Nagaon Kavathe',NULL,39,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(167,'Nagaon Nimani',NULL,40,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(168,'Nagewadi',NULL,41,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(169,'Narsewadi',NULL,42,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(170,'Nehru Nagar',NULL,43,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(171,'Nimani',NULL,44,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(172,'Nimblak',NULL,45,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(173,'Padali',NULL,46,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(174,'Panmalewadi',NULL,47,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(175,'Ped',NULL,48,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(176,'Punadi',NULL,49,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(177,'Rajapur',NULL,50,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(178,'Savalaj',NULL,51,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(179,'Savarde',NULL,52,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(180,'Shirgaon Kavathe',NULL,53,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(181,'Siddhewadi',NULL,54,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(182,'Sirgaon Visapur',NULL,55,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(183,'Turchi',NULL,56,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(184,'Upalavi',NULL,57,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(185,'Vajrachaunde',NULL,58,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(186,'Vanjarwadi',NULL,59,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(187,'Vijay Nagar',NULL,60,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(188,'Visapur',NULL,61,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(189,'Wadgaon',NULL,62,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(190,'Waghapur',NULL,63,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(191,'Waifale',NULL,64,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(192,'Wasumbe',NULL,65,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(193,'Yamgarwadi',NULL,66,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(194,'Yelavi',NULL,67,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(195,'Yogewadi',NULL,68,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',2),(255,'Agalgaon',NULL,1,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(256,'Alkud',NULL,2,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(257,'Alkud (S)',NULL,3,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(258,'Arewadi',NULL,4,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(259,'Banewadi',NULL,5,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(260,'Bassappawadi',NULL,6,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(261,'Borgaon',NULL,7,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(262,'Chorochi',NULL,8,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(263,'Chudekhindi',NULL,9,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(264,'Deshing',NULL,10,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(265,'Dhalewadi',NULL,11,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(266,'Dhalgaon',NULL,12,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(267,'Dholewadi',NULL,13,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(268,'Dhulgaon',NULL,14,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(269,'Dudhebhavi',NULL,15,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(270,'Garjewadi',NULL,16,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(271,'Ghatnandre',NULL,17,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(272,'Ghorpadi',NULL,18,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(273,'Haroli',NULL,19,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(274,'Hingangaon',NULL,20,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(275,'Irali',NULL,21,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(276,'Jadhavwadi',NULL,22,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(277,'Jakhapur',NULL,23,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(278,'Jambhulwadi',NULL,24,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(279,'Jaygavhan',NULL,25,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(280,'Kadamwadi',NULL,26,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(281,'Karalhetti',NULL,27,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(282,'Karoli',NULL,28,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(283,'Kavathe Mahankal',NULL,29,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(284,'Kerewadi',NULL,30,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(285,'Kharshing',NULL,31,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(286,'Kognoli',NULL,32,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(287,'Kokale',NULL,33,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(288,'Kuchi',NULL,34,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(289,'Kuktoli',NULL,35,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(290,'Kundlapur',NULL,36,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(291,'Landgewadi',NULL,37,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(292,'Langarpeth',NULL,38,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(293,'Lonarwadi',NULL,39,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(294,'Malangaon',NULL,40,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(295,'Mhaisal',NULL,41,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(296,'Moghamwadi',NULL,42,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(297,'Morgaon',NULL,43,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(298,'Nagaj',NULL,44,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(299,'Nangole',NULL,45,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(300,'Nimaj',NULL,46,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(301,'Pimpalwadi',NULL,47,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(302,'Rampurwadi',NULL,48,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(303,'Ranjani',NULL,49,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(304,'Raywadi',NULL,50,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(305,'Sarati',NULL,51,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(306,'Shelkewadi',NULL,52,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(307,'Shindewadi',NULL,53,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(308,'Shindewadi',NULL,54,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(309,'Shirdhon',NULL,55,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(310,'Thabadewadi',NULL,56,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(311,'Tisangi',NULL,57,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(312,'Vithurayachi Wadi',NULL,58,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(313,'Wagholi',NULL,59,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(314,'Zurewadi',NULL,60,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',3),(318,'Achkanhalli',NULL,1,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(319,'Akkalawadi',NULL,2,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(320,'Ambyachiwadi',NULL,3,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(321,'Amrutwadi',NULL,4,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(322,'Ankalagi',NULL,5,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(323,'Ankale',NULL,6,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(324,'Antral',NULL,7,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(325,'Asangi Jat',NULL,8,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(326,'Asangi Turk',NULL,9,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(327,'Avandhi',NULL,10,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(328,'Bagalwadi',NULL,11,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(329,'Bagewadi',NULL,12,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(330,'Baj',NULL,13,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(331,'Balgaon',NULL,14,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(332,'Banali',NULL,15,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(333,'Basargi',NULL,16,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(334,'Belondgi',NULL,17,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(335,'Belunki',NULL,18,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(336,'Bevanur',NULL,19,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(337,'Bhivargi',NULL,20,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(338,'Bilur',NULL,21,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(339,'Birnal',NULL,22,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(340,'Borgi Bk',NULL,23,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(341,'Borgi Kh',NULL,24,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(342,'Dafalapur',NULL,25,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(343,'Daribadachi',NULL,26,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(344,'Darikonur',NULL,27,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(345,'Devnal',NULL,28,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(346,'Dhavadwadi',NULL,29,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(347,'Dhulkarwadi',NULL,30,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(348,'Dorli',NULL,31,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(349,'Ekundi',NULL,32,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(350,'Gholeshwar',NULL,33,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(351,'Girgaon',NULL,34,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(352,'Gondhalewadi',NULL,35,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(353,'Guddapur',NULL,36,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(354,'Gugwad',NULL,37,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(355,'Gulgunjnal',NULL,38,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(356,'Gulvanchi',NULL,39,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(357,'Halli',NULL,40,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(358,'Hivare',NULL,41,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(359,'Jadraboblad',NULL,42,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(360,'Jalyal Bk',NULL,43,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(361,'Jalyal Kh',NULL,44,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(362,'Jat',NULL,45,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(363,'Jirgyal',NULL,46,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(364,'Kaganari',NULL,47,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(365,'Kanthi',NULL,48,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(366,'Karajagi',NULL,49,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(367,'Karajanagi',NULL,50,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(368,'Karewadi',NULL,51,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(369,'Karewadi',NULL,52,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(370,'Kaslingwadi',NULL,53,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(371,'Khairao',NULL,54,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(372,'Khalati',NULL,55,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(373,'Khandnal',NULL,56,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(374,'Khilarwadi',NULL,57,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(375,'Khojanwadi',NULL,58,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(376,'Kolgiri',NULL,59,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(377,'Konbagi',NULL,60,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(378,'Kontya Boblad',NULL,61,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(379,'Kosari',NULL,62,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(380,'Kudnur',NULL,63,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(381,'Kulalwadi',NULL,64,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(382,'Kumbhari',NULL,65,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(383,'Kunikonur',NULL,66,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(384,'Lakdewadi',NULL,67,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(385,'Lamantanda',NULL,68,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(386,'Lamantanda',NULL,69,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(387,'Lavanga',NULL,70,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(388,'Lohagaon',NULL,71,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(389,'Madgyal',NULL,72,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(390,'Maithal',NULL,73,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(391,'Mallal',NULL,74,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(392,'Manik Nal',NULL,75,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(393,'Mendhegiri',NULL,76,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(394,'Mirawad',NULL,77,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(395,'Mokashawadi',NULL,78,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(396,'Morbagi',NULL,79,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(397,'Motewadi',NULL,80,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(398,'Motewadi',NULL,81,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(399,'Muchandi',NULL,82,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(400,'Navalwadi',NULL,83,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(401,'Nigadi Bk',NULL,84,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(402,'Nigadi Kh',NULL,85,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(403,'Pandharewadi',NULL,86,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(404,'Pandozari',NULL,87,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(405,'Paradhi Wasti',NULL,88,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(406,'Pratapur',NULL,89,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(407,'Rajobawadi',NULL,90,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(408,'Rampur',NULL,91,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(409,'Ravalgundwadi',NULL,92,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(410,'Revnal',NULL,93,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(411,'Salekari',NULL,94,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(412,'Salmalgewadi',NULL,95,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(413,'Sanamadi',NULL,96,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(414,'Sankh',NULL,97,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(415,'Shedyal',NULL,98,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(416,'Shegaon',NULL,99,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(417,'Shelkewadi',NULL,100,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(418,'Siddhanath',NULL,101,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(419,'Sindur',NULL,102,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(420,'Singanhalli',NULL,103,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(421,'Singnapur',NULL,104,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(422,'Sonalagi',NULL,105,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(423,'Sonyal',NULL,106,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(424,'Sordi',NULL,107,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(425,'Suslad',NULL,108,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(426,'Tikondi',NULL,109,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(427,'Tilyal',NULL,110,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(428,'Tippehalli',NULL,111,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(429,'Tonewadi',NULL,112,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(430,'Umadi',NULL,113,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(431,'Umarani',NULL,114,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(432,'Untwadi',NULL,115,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(433,'Utagi',NULL,116,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(434,'Vajrawad',NULL,117,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(435,'Vhaspeth',NULL,118,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(436,'Vithalwadi',NULL,119,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(437,'Waifal',NULL,120,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(438,'Walekhindi',NULL,121,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(439,'Walsang',NULL,122,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(440,'Washan',NULL,123,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(441,'Yelavi',NULL,124,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(442,'Yeldari',NULL,125,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',4),(445,'Ainwadi',NULL,1,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(446,'Alsund',NULL,2,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(447,'Balvadi',NULL,3,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(448,'Balvadi Bhalvani',NULL,4,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(449,'Bamani',NULL,5,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(450,'Banurgad',NULL,6,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(451,'Benapur',NULL,7,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(452,'Bhadakewadi',NULL,8,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(453,'Bhagyanagar',NULL,9,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(454,'Bhalwani',NULL,10,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(455,'Bhambarde',NULL,11,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(456,'Bhendvade',NULL,12,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(457,'Bhikawadi Bk',NULL,13,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(458,'Bhood',NULL,14,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(459,'Chikhalhol',NULL,15,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(460,'Chinchani',NULL,16,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(461,'Devikhindi',NULL,17,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(462,'Devnagar',NULL,18,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(463,'Dhawaleshwar',NULL,19,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(464,'Dhondewadi',NULL,20,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(465,'Dhondgewadi',NULL,21,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(466,'Gardi',NULL,22,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(467,'Ghadgewadi',NULL,23,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(468,'Ghanwad',NULL,24,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(469,'Ghoti Bk',NULL,25,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(470,'Ghoti Kh',NULL,26,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(471,'Gorewadi',NULL,27,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(472,'Himgangade',NULL,28,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(473,'Hivare',NULL,29,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(474,'Jadhavnagar',NULL,30,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(475,'Jadhavwadi',NULL,31,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(476,'Jakhinwadi',NULL,32,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(477,'Jondhalkhindi',NULL,33,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(478,'Kalambi',NULL,34,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(479,'Kamlapur',NULL,35,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(480,'Karanje',NULL,36,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(481,'Karve',NULL,37,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(482,'Khambale Bhalvani',NULL,38,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(483,'Khanapur',NULL,39,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(484,'Kurli',NULL,40,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(485,'Kusbavade',NULL,41,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(486,'Lengre',NULL,42,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(487,'Madhalmuthi',NULL,43,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(488,'Mahuli',NULL,44,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(489,'Mangrul',NULL,45,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(490,'Menganwadi',NULL,46,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(491,'Mohi',NULL,47,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(492,'Nagewadi',NULL,48,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(493,'Palashi',NULL,49,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(494,'Panchlingnagar',NULL,50,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(495,'Pare',NULL,51,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(496,'Posewadi',NULL,52,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(497,'Ramnagar',NULL,53,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(498,'Renavi',NULL,54,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(499,'Rewangaon',NULL,55,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(500,'Salshinge',NULL,56,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(501,'Sangole',NULL,57,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(502,'Shendgewadi',NULL,58,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(503,'Sultangade',NULL,59,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(504,'Tadachiwadi',NULL,60,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(505,'Tandalgaon',NULL,61,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(506,'Vejegaon',NULL,62,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(507,'Walkhad',NULL,63,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(508,'Waluj',NULL,64,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(509,'Wasumbe',NULL,65,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(510,'Wazar',NULL,66,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',6),(572,'Amanapur',NULL,1,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(573,'Andhali',NULL,2,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(574,'Ankalkhop',NULL,3,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(575,'Anugdewadi',NULL,4,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(576,'Bambavade',NULL,5,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(577,'Bhilwadi',NULL,6,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(578,'Bramhanal',NULL,7,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(579,'Burli',NULL,8,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(580,'Burungwadi',NULL,9,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(581,'Chopdewadi',NULL,10,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(582,'Dahyari',NULL,11,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(583,'Dudhondi',NULL,12,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(584,'Ghogaon',NULL,13,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(585,'Hajarwadi',NULL,14,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(586,'Khandobachiwadi',NULL,15,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(587,'Khatav',NULL,16,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(588,'Kundal',NULL,17,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(589,'Malewadi',NULL,18,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(590,'Morale',NULL,19,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(591,'Nagrale',NULL,20,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(592,'Nagthane',NULL,21,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(593,'Palus',NULL,22,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(594,'Pundi Tarf Walava',NULL,23,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(595,'Pundiwadi',NULL,24,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(596,'Radewadi',NULL,25,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(597,'Ramanandnagar',NULL,26,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(598,'Sandgewadi',NULL,27,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(599,'Sawantpur',NULL,28,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(600,'Share Dudhondi',NULL,29,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(601,'Sukhwadi',NULL,30,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(602,'Suryagaon',NULL,31,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(603,'Tavdarwadi',NULL,32,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(604,'Tupari',NULL,33,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(605,'Vithalwadi',NULL,34,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(606,'Wasgade',NULL,35,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',7),(635,'Ambak',NULL,1,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(636,'Ambegaon',NULL,2,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(637,'Amrapur',NULL,3,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(638,'Apsinge',NULL,4,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(639,'Asad',NULL,5,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(640,'Belavade',NULL,6,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(641,'Bhikawadi Kh',NULL,7,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(642,'Bombalewadi',NULL,8,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(643,'Chikhali',NULL,9,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(644,'Chinchani Wangi',NULL,10,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(645,'Devrashtre',NULL,11,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(646,'Dhanewadi',NULL,12,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(647,'Hanmant Vadiye',NULL,13,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(648,'Hingangaon Bk',NULL,14,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(649,'Hingangaon Kh',NULL,15,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(650,'Kadegaon',NULL,16,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(651,'Kadepur',NULL,17,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(652,'Kanharwadi',NULL,18,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(653,'Karandewadi',NULL,19,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(654,'Khambale Aundh',NULL,20,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(655,'Kherade Vita',NULL,21,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(656,'Kheradewangi',NULL,22,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(657,'Kotawade',NULL,23,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(658,'Kotij',NULL,24,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(659,'Kumbhargaon',NULL,25,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(660,'Mohityache Vadgaon',NULL,26,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(661,'Nerli',NULL,27,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(662,'Nevari',NULL,28,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(663,'Nimsod',NULL,29,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(664,'Padali',NULL,30,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(665,'Ramapur',NULL,31,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(666,'Raygaon',NULL,32,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(667,'Renusewadi',NULL,33,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(668,'Saholi',NULL,34,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(669,'Saspade',NULL,35,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(670,'Shalgaon',NULL,36,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(671,'Shelakbav',NULL,37,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(672,'Shirasgaon',NULL,38,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(673,'Shirgaon',NULL,39,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(674,'Shivajinagar',NULL,40,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(675,'Shivani',NULL,41,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(676,'Sonkire',NULL,42,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(677,'Sonsal',NULL,43,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(678,'Tadasar',NULL,44,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(679,'Tondoli',NULL,45,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(680,'Tupewadi',NULL,46,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(681,'Tupewadi',NULL,47,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(682,'Upale Mayani',NULL,48,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(683,'Upalewangi',NULL,49,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(684,'Vadiye-Raybag',NULL,50,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(685,'Vihapur',NULL,51,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(686,'Wang Rethare',NULL,52,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(687,'Wangi',NULL,53,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(688,'Yede',NULL,54,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(689,'Yetgaon',NULL,55,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(690,'Yevlewadi',NULL,56,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',8),(698,'Ambewadi',NULL,1,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(699,'Atpadi',NULL,2,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(700,'Autewadi',NULL,3,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(701,'Awalai',NULL,4,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(702,'Balewadi',NULL,5,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(703,'Banpuri',NULL,6,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(704,'Bhingewadi',NULL,7,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(705,'Bombewadi',NULL,8,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(706,'Chinchale',NULL,9,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(707,'Deshamukhwadi',NULL,10,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(708,'Dhavadwadi',NULL,11,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(709,'Dighanchi',NULL,12,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(710,'Galavewadi',NULL,13,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(711,'Ghanand',NULL,14,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(712,'Gharniki',NULL,15,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(713,'Gomewadi',NULL,16,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(714,'Gulewadi',NULL,17,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(715,'Hivtad',NULL,18,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(716,'Jambhulni',NULL,19,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(717,'Kalewadi',NULL,20,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(718,'Kamth',NULL,21,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(719,'Kankatrewadi',NULL,22,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(720,'Kargani',NULL,23,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(721,'Kautholi',NULL,24,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(722,'Khanjodwadi',NULL,25,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(723,'Kharsundi',NULL,26,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(724,'Kurundwadi',NULL,27,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(725,'Lengrewadi',NULL,28,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(726,'Lingivare',NULL,29,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(727,'Madgule',NULL,30,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(728,'Malewadi',NULL,31,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(729,'Manewadi',NULL,32,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(730,'Maptemala',NULL,33,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(731,'Masalwadi',NULL,34,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(732,'Mitki',NULL,35,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(733,'Mudhewadi',NULL,36,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(734,'Nelkaranji',NULL,37,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(735,'Nimbawade',NULL,38,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(736,'Padalkarwadi',NULL,39,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(737,'Palaskhel',NULL,40,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(738,'Pandharewadi',NULL,41,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(739,'Parekarwadi',NULL,42,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(740,'Patrewadi',NULL,43,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(741,'Pimpari Bk',NULL,44,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(742,'Pimpari Kh',NULL,45,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(743,'Pisewadi',NULL,46,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(744,'Pujarwadi',NULL,47,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(745,'Pujarwadi',NULL,48,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(746,'Rajewadi',NULL,49,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(747,'Sherewadi',NULL,50,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(748,'Shetphale',NULL,51,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(749,'Tadvale',NULL,52,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(750,'Talewadi',NULL,53,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(751,'Umbargaon',NULL,54,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(752,'Vibhutwadi',NULL,55,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(753,'Vithalapur',NULL,56,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(754,'Wakasewadi',NULL,57,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(755,'Walwan',NULL,58,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(756,'Yamaji Patalachi Wadi',NULL,59,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(757,'Zare',NULL,60,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',5),(761,'Ahirwadi',NULL,1,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(762,'Aitavade Bk',NULL,2,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(763,'Aitavade Kh',NULL,3,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(764,'Bagani',NULL,4,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(765,'Bahadurwadi',NULL,5,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(766,'Bahe',NULL,6,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(767,'Banewadi',NULL,7,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(768,'Bavchi',NULL,8,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(769,'Beradmachi',NULL,9,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(770,'Bhadkimbe',NULL,10,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(771,'Bharatwadi',NULL,11,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(772,'Bhatwadi',NULL,12,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(773,'Bhavaninagar',NULL,13,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(774,'Bichud',NULL,14,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(775,'Borgaon',NULL,15,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(776,'Chikurde',NULL,16,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(777,'Devarde',NULL,17,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(778,'Dhagewadi',NULL,18,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(779,'Dhavali',NULL,19,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(780,'Dhotrewadi',NULL,20,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(781,'Dongarwadi',NULL,21,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(782,'Dudhari',NULL,22,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(783,'Farnewadi',NULL,23,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(784,'Gatadwadi',NULL,24,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(785,'Gaundwadi',NULL,25,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(786,'Ghabakwadi',NULL,26,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(787,'Gotkhindi',NULL,27,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(788,'Hubalwadi',NULL,28,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(789,'Itakare',NULL,29,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(790,'Jakraiwadi',NULL,30,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(791,'Jambhulwadi',NULL,31,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(792,'June Khed',NULL,32,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(793,'Kakachiwadi',NULL,33,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(794,'Kalamwadi',NULL,34,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(795,'Kameri',NULL,35,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(796,'Kanegaon',NULL,36,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(797,'Kapuskhed',NULL,37,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(798,'Karandwadi',NULL,38,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(799,'Karanjvade',NULL,39,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(800,'Karve',NULL,40,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(801,'Kasegaon',NULL,41,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(802,'Kedarwadi',NULL,42,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(803,'Kharatwadi',NULL,43,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(804,'Kille Machhindra Gad',NULL,44,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(805,'Kole',NULL,45,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(806,'Konoli',NULL,46,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(807,'Koregaon',NULL,47,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(808,'Krishnanagar',NULL,48,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(809,'Kundalwadi',NULL,49,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(810,'Kurlap',NULL,50,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(811,'Ladegaon',NULL,51,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(812,'Lavanmachi',NULL,52,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(813,'Mahadevwadi',NULL,53,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(814,'Malewadi',NULL,54,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(815,'Manikwadi',NULL,55,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(816,'Maralnathpur',NULL,56,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(817,'Mardawadi',NULL,57,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(818,'Masuchiwadi',NULL,58,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(819,'Mirajwadi',NULL,59,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(820,'Nagaon',NULL,60,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(821,'Narsihapur',NULL,61,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(822,'Nave Khed',NULL,62,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(823,'Naykalwadi',NULL,63,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(824,'Nerle',NULL,64,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(825,'Ozarde',NULL,65,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(826,'Padavalwadi',NULL,66,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(827,'Peth',NULL,67,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(828,'Phalkewadi & Chandachiwadi',NULL,68,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(829,'Pharnewadi',NULL,69,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(830,'Pokharni',NULL,70,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(831,'Rethare Dharan',NULL,71,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(832,'Rethare Harnaksha',NULL,72,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(833,'Rozawadi',NULL,73,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(834,'Sakharale',NULL,74,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(835,'Satapewadi',NULL,75,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(836,'Shekharwadi',NULL,76,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(837,'Shene',NULL,77,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(838,'Shigaon',NULL,78,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(839,'Shirate',NULL,79,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(840,'Shirgaon',NULL,80,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(841,'Shivpuri',NULL,81,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(842,'Surul',NULL,82,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(843,'Takari',NULL,83,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(844,'Tambave',NULL,84,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(845,'Tandulwadi',NULL,85,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(846,'Thanapude',NULL,86,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(847,'Tujarpur',NULL,87,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(848,'Vashi',NULL,88,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(849,'Vitthalwadi',NULL,89,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(850,'Waghwadi',NULL,90,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(851,'Walwa',NULL,91,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(852,'Wategaon',NULL,92,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(853,'Yede Machchhindra',NULL,93,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(854,'Yede Nipani',NULL,94,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(855,'Yelur',NULL,95,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(856,'Yewalewadi',NULL,96,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',9),(888,'Ambewadi',NULL,1,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(889,'Antri Bk',NULL,2,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(890,'Antri Kh',NULL,3,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(891,'Arala',NULL,4,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(892,'Asvalwadi',NULL,5,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(893,'Aundhi',NULL,6,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(894,'Bambavade',NULL,7,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(895,'Beldarwadi',NULL,8,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(896,'Belewadi',NULL,9,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(897,'Beradewadi',NULL,10,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(898,'Bhairewadi',NULL,11,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(899,'Bhashtewadi',NULL,12,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(900,'Bhatshirgaon',NULL,13,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(901,'Bhatwadi',NULL,14,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(902,'Bilashi',NULL,15,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(903,'Biur',NULL,16,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(904,'Charan',NULL,17,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(905,'Chikhali',NULL,18,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(906,'Chikhalwadi',NULL,19,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(907,'Chinchewadi',NULL,20,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(908,'Chincholi',NULL,21,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(909,'Devwadi',NULL,22,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(910,'Dhamavade',NULL,23,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(911,'Dhaswadi',NULL,24,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(912,'Dholewadi',NULL,25,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(913,'Gavalewadi',NULL,26,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(914,'Ghagarewadi',NULL,27,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(915,'Girajvade',NULL,28,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(916,'Gudhe',NULL,29,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(917,'Hategaon',NULL,30,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(918,'Ingrul',NULL,31,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(919,'Jambhalewadi',NULL,32,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(920,'Kadamwadi',NULL,33,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(921,'Kalundre',NULL,34,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(922,'Kande',NULL,35,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(923,'Kandur',NULL,36,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(924,'Kapari',NULL,37,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(925,'Karamale',NULL,38,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(926,'Karanguli',NULL,39,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(927,'Kharale',NULL,40,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(928,'Khed',NULL,41,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(929,'Khirawade',NULL,42,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(930,'Khujgaon',NULL,43,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(931,'Khundalapur',NULL,44,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(932,'Kinarewadi',NULL,45,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(933,'Kokarud',NULL,46,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(934,'Kondaiwadi',NULL,47,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(935,'Kusaiwadi',NULL,48,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(936,'Kusalewadi',NULL,49,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(937,'Ladewadi',NULL,50,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(938,'Madalawadi',NULL,51,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(939,'Malewadi',NULL,52,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(940,'Manadur',NULL,53,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(941,'Manewadi',NULL,54,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(942,'Mangle',NULL,55,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(943,'Mangrul',NULL,56,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(944,'Mankarwadi',NULL,57,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(945,'Marathwadi',NULL,58,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(946,'Meni',NULL,59,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(947,'Mohare',NULL,60,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(948,'Morewadi',NULL,61,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(949,'Nathavade',NULL,62,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(950,'Natoli',NULL,63,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(951,'Nigadi',NULL,64,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(952,'Pachumbri',NULL,65,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(953,'Padali',NULL,66,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(954,'Padaliwadi',NULL,67,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(955,'Panchagani',NULL,68,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(956,'Panumbre Tarf Shirala',NULL,69,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(957,'Panumbre Tarf Warun',NULL,70,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(958,'Pavalewadi',NULL,71,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(959,'Phakirwadi',NULL,72,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(960,'Phuphere',NULL,73,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(961,'Punavat',NULL,74,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(962,'Ranjanwadi',NULL,75,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(963,'Red',NULL,76,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(964,'Rile',NULL,77,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(965,'Sagaon',NULL,78,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(966,'Sawantwadi',NULL,79,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(967,'Shendgewadi',NULL,80,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(968,'Shindewadi',NULL,81,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(969,'Shirala',NULL,82,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(970,'Shirala Kh',NULL,83,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(971,'Shirsatwadi',NULL,84,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(972,'Shivarwadi',NULL,85,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(973,'Sirasi',NULL,86,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(974,'Sonavade',NULL,87,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(975,'Tadavale',NULL,88,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(976,'Takave',NULL,89,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(977,'Upavale',NULL,90,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(978,'Wadi Bhagai',NULL,91,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(979,'Wakurde Bk',NULL,92,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(980,'Wakurde Kh',NULL,93,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(981,'Yelapur',NULL,94,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10),(982,'Yeslewadi',NULL,95,1,'2026-10-09 09:25:32','2026-10-09 09:25:32',10);
/*!40000 ALTER TABLE `villages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-10  8:52:15
