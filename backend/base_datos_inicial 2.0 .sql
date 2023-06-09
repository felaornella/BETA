-- MySQL dump 10.13  Distrib 8.0.15, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: beta_app
-- ------------------------------------------------------
-- Server version	8.0.15

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `imagenes`
--

DROP TABLE IF EXISTS `imagenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `imagenes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contenido` text,
  `id_usuario` int(11) DEFAULT NULL,
  `id_publicacion` int(11) DEFAULT NULL,
  `id_mascota` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `activo` tinyint(4) DEFAULT NULL,
  `enabled` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_imagen_mascota_idx` (`id_mascota`),
  KEY `fk_imagen_publicacion_idx` (`id_publicacion`),
  KEY `fk_imagen_usuario_idx` (`id_usuario`),
  CONSTRAINT `fk_imagen_mascota` FOREIGN KEY (`id_mascota`) REFERENCES `mascota` (`id`),
  CONSTRAINT `fk_imagen_publicacion` FOREIGN KEY (`id_publicacion`) REFERENCES `publicacion` (`id`),
  CONSTRAINT `fk_imagen_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario_padre` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagenes`
--

LOCK TABLES `imagenes` WRITE;
/*!40000 ALTER TABLE `imagenes` DISABLE KEYS */;
/*!40000 ALTER TABLE `imagenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mascota`
--

DROP TABLE IF EXISTS `mascota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `mascota` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_dueño` int(11) DEFAULT NULL,
  `id_tipo_mascota` int(11) DEFAULT NULL,
  `id_raza_mascota` int(11) DEFAULT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `fecha_nacimiento` datetime DEFAULT NULL,
  `colores` varchar(255) DEFAULT NULL,
  `tamaño` varchar(45) DEFAULT NULL,
  `sexo` varchar(45) DEFAULT NULL,
  `caracteristicas` varchar(255) DEFAULT NULL,
  `castracion` tinyint(4) DEFAULT NULL,
  `vacunacion` varchar(45) DEFAULT NULL,
  `antirrabica` tinyint(4) DEFAULT NULL,
  `desparacitacion` varchar(45) DEFAULT NULL,
  `enfermedades` text,
  `cirugias` text,
  `medicacion` text,
  `perdido` tinyint(4) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `enabled` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tipo_mascota_idx` (`id_tipo_mascota`),
  KEY `fk_dueño_idx` (`id_dueño`),
  CONSTRAINT `fk_dueño` FOREIGN KEY (`id_dueño`) REFERENCES `usuario_padre` (`id`),
  CONSTRAINT `fk_tipo_mascota` FOREIGN KEY (`id_tipo_mascota`) REFERENCES `tipo_mascota` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mascota`
--

LOCK TABLES `mascota` WRITE;
/*!40000 ALTER TABLE `mascota` DISABLE KEYS */;
/*!40000 ALTER TABLE `mascota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizacion`
--

DROP TABLE IF EXISTS `organizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `organizacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `ciudad` varchar(45) DEFAULT NULL,
  `descripcion_breve` text,
  `link_donacion` text,
  `estadoGeneral` int(11) DEFAULT NULL,
  `dni_responsable` varchar(45) DEFAULT NULL,
  `nombre_responsable` varchar(45) DEFAULT NULL,
  `apellido_responsable` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizacion`
--

LOCK TABLES `organizacion` WRITE;
/*!40000 ALTER TABLE `organizacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `organizacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicacion`
--

DROP TABLE IF EXISTS `publicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `publicacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_publicador_usuario` int(11) DEFAULT NULL,
  `id_publicador_organizacion` int(11) DEFAULT NULL,
  `id_mascota` int(11) DEFAULT NULL,
  `id_tipo_mascota` int(11) DEFAULT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `edad` int(11) DEFAULT NULL,
  `edad_unidad` varchar(45) DEFAULT NULL,
  `edad_aprox` tinyint(4) DEFAULT NULL,
  `raza` varchar(45) DEFAULT NULL,
  `colores` varchar(255) DEFAULT NULL,
  `tamaño` varchar(45) DEFAULT NULL,
  `sexo` varchar(45) DEFAULT NULL,
  `caracteristicas` text,
  `geoubicacion` varchar(255) DEFAULT NULL,
  `perdido` tinyint(4) DEFAULT NULL,
  `encontrado` tinyint(4) DEFAULT NULL,
  `transito` tinyint(4) DEFAULT NULL,
  `adopcion` tinyint(4) DEFAULT NULL,
  `estadoGeneral` int(11) DEFAULT NULL,
  `castracion` tinyint(4) DEFAULT NULL,
  `desparacitacion` varchar(45) DEFAULT NULL,
  `vacunacion` varchar(45) DEFAULT NULL,
  `patologias` varchar(255) DEFAULT NULL,
  `medicacion` varchar(255) DEFAULT NULL,
  `duracion_transito` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `enabled` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_publicador_usuario_idx` (`id_publicador_usuario`),
  KEY `fk_publicador_organizacion_idx` (`id_publicador_organizacion`),
  KEY `fk_mascota_idx` (`id_mascota`),
  KEY `fj_tipo_mascota_idx` (`id_tipo_mascota`),
  CONSTRAINT `fj_publicacion_tipo_mascota` FOREIGN KEY (`id_tipo_mascota`) REFERENCES `tipo_mascota` (`id`),
  CONSTRAINT `fk_mascota` FOREIGN KEY (`id_mascota`) REFERENCES `mascota` (`id`),
  CONSTRAINT `fk_publicador_organizacion` FOREIGN KEY (`id_publicador_organizacion`) REFERENCES `organizacion` (`id`),
  CONSTRAINT `fk_publicador_usuario` FOREIGN KEY (`id_publicador_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicacion`
--

LOCK TABLES `publicacion` WRITE;
/*!40000 ALTER TABLE `publicacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `publicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `raza_mascota`
--

DROP TABLE IF EXISTS `raza_mascota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `raza_mascota` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `raza` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='	';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raza_mascota`
--

LOCK TABLES `raza_mascota` WRITE;
/*!40000 ALTER TABLE `raza_mascota` DISABLE KEYS */;
/*!40000 ALTER TABLE `raza_mascota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_mascota`
--

DROP TABLE IF EXISTS `tipo_mascota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tipo_mascota` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='	';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_mascota`
--

LOCK TABLES `tipo_mascota` WRITE;
/*!40000 ALTER TABLE `tipo_mascota` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipo_mascota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `apellido` varchar(255) DEFAULT NULL,
  `fecha_nacimiento` datetime DEFAULT NULL,
  `id_padre` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_id_padre_idx` (`id_padre`),
  CONSTRAINT `fk_id_padre` FOREIGN KEY (`id_padre`) REFERENCES `usuario_padre` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_padre`
--

DROP TABLE IF EXISTS `usuario_padre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `usuario_padre` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(45) DEFAULT NULL,
  `instagram` varchar(45) DEFAULT NULL,
  `email_visible` tinyint(4) DEFAULT NULL,
  `instagram_visible` tinyint(4) DEFAULT NULL,
  `telefono_visible` tinyint(4) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `tempPass` varchar(255) DEFAULT NULL,
  `recuperarPass` tinyint(4) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `forced_logout` tinyint(4) DEFAULT NULL,
  `suspendido` tinyint(4) DEFAULT NULL,
  `enabled` tinyint(4) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_padre`
--

LOCK TABLES `usuario_padre` WRITE;
/*!40000 ALTER TABLE `usuario_padre` DISABLE KEYS */;
INSERT INTO `usuario_padre` VALUES (1,'felipeornella@hotmail.com','2215062101','felaornella',1,1,1,'sha256$doQXepCV6MeYJXOjmAsEuo9J74zqwBBf$b661dd898ca3e5efa0a1707047d1d1243ca0be46abc38113a06feba823b33d98',NULL,0,'2022-12-13 21:23:14',0,0,1,'2022-12-13 20:56:00','2022-12-13 20:56:00');
/*!40000 ALTER TABLE `usuario_padre` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-12-23 19:36:02
