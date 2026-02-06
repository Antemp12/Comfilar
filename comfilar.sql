-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Banco de dados: `comfilar`

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

/* =========================
   TABELAS BASE (Authentication)
========================= */

CREATE TABLE `user` (
  `age` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` text NOT NULL,
  `email_verified` tinyint(1) NOT NULL,
  `first_name` text DEFAULT NULL,
  `id` varchar(255) NOT NULL,
  `image` text DEFAULT NULL,
  `last_name` text DEFAULT NULL,
  `name` text NOT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email_unique` (`email`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `user` (`age`, `created_at`, `email`, `email_verified`, `first_name`, `id`, `image`, `last_name`, `name`, `two_factor_enabled`, `updated_at`) VALUES
(NULL, '2025-12-26 15:26:57', 'admin@comfilar.test', 1, 'Admin', 'admin-1766762817234', NULL, NULL, 'Admin Comfilar', NULL, '2025-12-26 15:26:57');

CREATE TABLE `account` (
  `access_token` text DEFAULT NULL,
  `access_token_expires_at` text DEFAULT NULL,
  `account_id` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id` varchar(255) NOT NULL,
  `id_token` text DEFAULT NULL,
  `password` text DEFAULT NULL,
  `provider_id` text NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `refresh_token_expires_at` text DEFAULT NULL,
  `scope` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_user_id_fk` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `account` (`access_token`, `access_token_expires_at`, `account_id`, `created_at`, `id`, `id_token`, `password`, `provider_id`, `refresh_token`, `refresh_token_expires_at`, `scope`, `updated_at`, `user_id`) VALUES
(NULL, NULL, 'admin@comfilar.test', '2025-12-26 15:26:57', 'account-admin-1766762817234', NULL, '1234', 'credential', NULL, NULL, NULL, '2025-12-26 15:26:57', 'admin-1766762817234');

CREATE TABLE `session` (
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` text NOT NULL,
  `id` varchar(255) NOT NULL,
  `ip_address` text DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_agent` text DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token_unique` (`token`),
  KEY `session_user_id_fk` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `two_factor` (
  `backup_codes` text NOT NULL,
  `id` varchar(255) NOT NULL,
  `secret` text NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `two_factor_user_id_fk` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `uploads` (
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id` varchar(255) NOT NULL,
  `key` text NOT NULL,
  `type` enum('image','video') NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `url` text NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uploads_user_id_fk` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `verification` (
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` text NOT NULL,
  `id` varchar(255) NOT NULL,
  `identifier` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `value` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/* =========================
   CATEGORIAS
========================= */

CREATE TABLE `categoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `id_categoria_pai` int DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `managed_by` varchar(20) DEFAULT 'admin',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categoria_pai_fk` (`id_categoria_pai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Categorias principais (id_categoria_pai = NULL)
INSERT INTO `categoria` (`id`, `nome`, `id_categoria_pai`) VALUES
(1, 'Casas de banho', NULL),
(2, 'Pavimentos e revestimentos', NULL),
(3, 'Climatização', NULL),
(4, 'Construção', NULL),
(5, 'Pintura', NULL),
(6, 'Móveis e arrumação', NULL),
(7, 'Canalização', NULL),
(8, 'Energia renovável', NULL);

-- Subcategorias de Casas de banho (id_categoria_pai = 1)
INSERT INTO `categoria` (`id`, `nome`, `id_categoria_pai`) VALUES
(11, 'Sanitários', 1),
(12, 'Lavatórios', 1),
(13, 'Chuveiros', 1),
(14, 'Banheiras', 1),
(15, 'Acessórios de banho', 1),
(16, 'Espelhos', 1),
(17, 'Mobiliário de banho', 1);

-- Subcategorias de Pavimentos e revestimentos (id_categoria_pai = 2)
INSERT INTO `categoria` (`id`, `nome`, `id_categoria_pai`) VALUES
(21, 'Azulejos cerâmicos', 2),
(22, 'Mármores e granitos', 2),
(23, 'Vinílicos', 2),
(24, 'Laminados', 2),
(25, 'Pavimento elevado', 2),
(26, 'Revestimentos decorativos', 2);

-- Subcategorias de Climatização (id_categoria_pai = 3)
INSERT INTO `categoria` (`id`, `nome`, `id_categoria_pai`) VALUES
(31, 'Bombas de calor', 3),
(32, 'Ar condicionado', 3),
(33, 'Caldeiras', 3),
(34, 'Recuperadores', 3),
(35, 'Salamandras', 3),
(36, 'Radiadores', 3),
(37, 'Acessórios de climatização', 3);

-- Subcategorias de Construção (id_categoria_pai = 4)
INSERT INTO `categoria` (`id`, `nome`, `id_categoria_pai`) VALUES
(41, 'Cimentos e argamassas', 4),
(42, 'Blocos e tijolos', 4),
(43, 'Estruturas metálicas', 4),
(44, 'Madeiras de construção', 4),
(45, 'Isolamento térmico', 4),
(46, 'Impermeabilização', 4),
(47, 'Ferramentas de construção', 4);

-- Subcategorias de Pintura (id_categoria_pai = 5)
INSERT INTO `categoria` (`id`, `nome`, `id_categoria_pai`) VALUES
(51, 'Tintas látex', 5),
(52, 'Tintas esmaltes', 5),
(53, 'Tintas epóxi', 5),
(54, 'Vernizes', 5),
(55, 'Primer e seladores', 5),
(56, 'Ferramentas de pintura', 5),
(57, 'Aditivos', 5);

-- Subcategorias de Móveis e arrumação (id_categoria_pai = 6)
INSERT INTO `categoria` (`id`, `nome`, `id_categoria_pai`) VALUES
(61, 'Móveis de escritório', 6),
(62, 'Móveis de cozinha', 6),
(63, 'Armários e roupeiros', 6),
(64, 'Estantes e prateleiras', 6),
(65, 'Móveis modulares', 6),
(66, 'Soluções de arrumação', 6),
(67, 'Acessórios de mobiliário', 6);

-- Subcategorias de Canalização (id_categoria_pai = 7)
INSERT INTO `categoria` (`id`, `nome`, `id_categoria_pai`) VALUES
(71, 'Tubos PVC', 7),
(72, 'Tubos cobre', 7),
(73, 'Tubos PPR', 7),
(74, 'Conexões e acessórios', 7),
(75, 'Válvulas e registos', 7),
(76, 'Sifões e ralos', 7),
(77, 'Ferramentas de canalização', 7);

-- Subcategorias de Energia renovável (id_categoria_pai = 8)
INSERT INTO `categoria` (`id`, `nome`, `id_categoria_pai`) VALUES
(81, 'Painéis solares', 8),
(82, 'Inversores solares', 8),
(83, 'Baterias solares', 8),
(84, 'Sistemas eólicos', 8),
(85, 'Aquecimento solar', 8),
(86, 'Acessórios renováveis', 8);

/* =========================
   TIPO PREÇO
========================= */

CREATE TABLE `tipo_preco` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('unitario','m2','litro','kg','m3') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tipo_preco` (`id`, `tipo`) VALUES
(1, 'unitario'),
(2, 'm2'),
(3, 'kg'),
(4, 'litro'),
(5, 'm3');

/* =========================
   MATERIAL
========================= */

CREATE TABLE `material` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `descricao` text DEFAULT NULL,
  `id_categoria` int NOT NULL,
  `id_tipo_preco` int DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `stock` int DEFAULT 0,
  `imagem` text DEFAULT '/images/placeholder-product.jpg',
  `is_featured` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `material_categoria_fk` (`id_categoria`),
  KEY `material_tipo_preco_fk` (`id_tipo_preco`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `material` (`id`, `nome`, `descricao`, `id_categoria`, `id_tipo_preco`, `preco`, `stock`) VALUES
-- Produtos de Casas de banho
(1, 'Sanitário Suspenso Branco', 'Sanitário suspenso com caixa de descarga integrada', 11, 1, 180.00, 15),
(2, 'Lavatório Quadrado 60cm', 'Lavatório cerâmico quadrado com pedestal', 12, 1, 95.00, 8),
(3, 'Chuveiro Elétrico 5500W', 'Chuveiro elétrico com 3 temperaturas', 13, 1, 45.00, 25),
(4, 'Banheira Hidromassagem 170cm', 'Banheira acrílica com hidromassagem', 14, 1, 850.00, 5),
(5, 'Espelho LED 80x60cm', 'Espelho com iluminação LED integrada', 16, 1, 120.00, 10),
(6, 'Azulejo Branco 20x20cm', 'Azulejo cerâmico branco 20x20cm', 21, 2, 12.50, 200),
(7, 'Azulejo Cerâmico 45x45cm', 'Azulejo cerâmico esmaltado para parede', 21, 2, 18.50, 300),
(8, 'Mármore Carrara Branco', 'Mármore natural branco para bancadas', 22, 2, 85.00, 50),
(9, 'Piso Vinílico 3mm', 'Piso vinílico resistente à água', 23, 2, 12.00, 100),
(10, 'Bomba de Calor Ar-Ar 12kW', 'Bomba de calor para aquecimento e arrefecimento', 31, 1, 2500.00, 5),
(11, 'Ar Condicionado Split 9000 BTU', 'Ar condicionado split parede com tecnologia inverter', 32, 1, 450.00, 10),
(12, 'Caldeira a Gás 24kW', 'Caldeira a gás natural para aquecimento central', 33, 1, 1200.00, 3),
(13, 'Recuperador Calor 15kW', 'Recuperador de calor a lenha', 34, 1, 980.00, 4),
(14, 'Cimento Portland 50kg', 'Cimento Portland tipo CP II para construção', 41, 1, 18.50, 200),
(15, 'Bloco de Concreto 20x20x40cm', 'Bloco de concreto celular para alvenaria', 42, 1, 1.20, 1000),
(16, 'Madeira Pinho 2m', 'Tábua de pinho para construção', 44, 2, 15.00, 50),
(17, 'Tinta Látex Branca 18L', 'Tinta látex acrílica para paredes interiores', 51, 4, 85.00, 20),
(18, 'Tinta Látex Acrílica 18L', 'Tinta látex acrílica branca fosca', 51, 4, 75.00, 30),
(19, 'Verniz Marítimo 1L', 'Verniz marítimo para madeira exterior', 54, 4, 28.00, 40),
(20, 'Armário de Cozinha 60cm', 'Armário de cozinha com portas basculantes', 62, 1, 120.00, 12),
(21, 'Estante Modular 5 Prateleiras', 'Estante modular em MDF branco', 64, 1, 85.00, 20),
(22, 'Tubo PVC 32mm (barra 3m)', 'Tubo de PVC para canalização de águas', 71, 1, 8.50, 50),
(23, 'Tubo Cobre 15mm (barra 3m)', 'Tubo de cobre rígido para água quente', 72, 1, 25.00, 60),
(24, 'Válvula de Esfera 1/2"', 'Válvula de esfera em latão para água', 75, 1, 8.50, 100),
(25, 'Painel Solar 400W Monocristalino', 'Painel solar monocristalino 400W', 81, 1, 180.00, 10),
(26, 'Inversor Solar 3kW', 'Inversor solar on-grid 3000W', 82, 1, 450.00, 5);

CREATE TABLE `material_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `label` varchar(100) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `stock` int DEFAULT 0,
  `price_adjustment` decimal(10,2) DEFAULT 0.00,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `material_variant_fk` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/* =========================
   ATRIBUTOS POR CATEGORIA
========================= */

CREATE TABLE `category_attributes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `attribute_name` varchar(100) NOT NULL,
  `attribute_values` json NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_attr_fk` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `category_attributes` (`category_id`, `attribute_name`, `attribute_values`) VALUES
-- Casas de banho (id=1)
(1, 'Tipo', JSON_ARRAY('Sanitário', 'Lavatório', 'Chuveiro', 'Banheira', 'Espelho')),
(1, 'Material', JSON_ARRAY('Cerâmica', 'Acrílico', 'Vidro')),
(1, 'Cor', JSON_ARRAY('Branco', 'Preto', 'Cinzento', 'Bege')),
-- Pavimentos e revestimentos (id=2)
(2, 'Tipo', JSON_ARRAY('Azulejo', 'Piso Vinílico', 'Mármol', 'Granito')),
(2, 'Formato', JSON_ARRAY('20x20cm', '45x45cm', '60x60cm')),
(2, 'Acabamento', JSON_ARRAY('Fosco', 'Brilho', 'Mate')),
-- Climatização (id=3)
(3, 'Tipo', JSON_ARRAY('Bomba de Calor', 'Ar Condicionado', 'Caldeira', 'Recuperador de Calor')),
(3, 'Potência', JSON_ARRAY('5kW', '9kW', '12kW', '15kW', '24kW')),
(3, 'Tecnologia', JSON_ARRAY('Inverter', 'Fixa', 'On-Grid')),
-- Construção (id=4)
(4, 'Tipo', JSON_ARRAY('Cimento', 'Bloco', 'Madeira', 'Isolante')),
(4, 'Formato', JSON_ARRAY('50kg', '20x20x40cm', '2m')),
-- Pintura (id=5)
(5, 'Tipo', JSON_ARRAY('Tinta Látex', 'Tinta Acrílica', 'Verniz')),
(5, 'Cor', JSON_ARRAY('Branco', 'Azul', 'Verde', 'Vermelho', 'Preto', 'Cinzento')),
(5, 'Acabamento', JSON_ARRAY('Fosco', 'Brilho', 'Semibrilho')),
(5, 'Capacidade', JSON_ARRAY('1L', '5L', '18L')),
-- Móveis e arrumação (id=6)
(6, 'Tipo', JSON_ARRAY('Armário', 'Prateleira', 'Gaveta')),
(6, 'Material', JSON_ARRAY('Madeira', 'MDF', 'Metal')),
(6, 'Cor', JSON_ARRAY('Natural', 'Branco', 'Preto', 'Cinzento')),
-- Canalização (id=7)
(7, 'Tipo', JSON_ARRAY('Tubo PVC', 'Tubo Cobre', 'Válvula')),
(7, 'Diâmetro', JSON_ARRAY('15mm', '20mm', '32mm')),
(7, 'Comprimento', JSON_ARRAY('3m', '6m')),
-- Energia renovável (id=8)
(8, 'Tipo', JSON_ARRAY('Painel Solar', 'Inversor')),
(8, 'Potência', JSON_ARRAY('400W', '3kW')),
(8, 'Tipo Painel', JSON_ARRAY('Monocristalino', 'Policristalino'));

/* =========================
   UTILIZADORES / PEDIDOS
========================= */

CREATE TABLE `utilizador` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tipo` enum('cliente','funcionario','admin') NOT NULL DEFAULT 'cliente',
  `data_registo` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `utilizador_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `utilizador` (`id`, `nome`, `email`, `password`, `tipo`, `data_registo`) VALUES
(1, 'Admin Comfilar', 'admin@comfilar.test', '$2b$10$xzIpIrhFv1qNQbSa9abrve4BndgBM6KtRbje7fxZPJgX93dfKOqvu', 'admin', '2025-12-25 23:06:26'),
(2, 'Funcionario Comfilar', 'func@comfilar.test', 'funcpass', 'funcionario', '2025-12-25 23:06:26');

CREATE TABLE `pedido_orca` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendente','analise','aprovado','rejeitado','convertido') DEFAULT 'pendente',
  `id_utilizador` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pedido_orca_utilizador_fk` (`id_utilizador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pedido_orca_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pedido_orca` int NOT NULL,
  `id_material` int NOT NULL,
  `quantidade` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pedido_item_unique` (`id_pedido_orca`,`id_material`),
  KEY `pedido_item_material_fk` (`id_material`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `encomenda` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_confirm` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('processamento','preparacao','enviado','entregue') DEFAULT 'processamento',
  `id_pedido_orca` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `encomenda_pedido_unique` (`id_pedido_orca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `reuniao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `descricao` text DEFAULT NULL,
  `id_utilizador` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reuniao_utilizador_fk` (`id_utilizador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/* =========================
   NOTIFICAÇÕES
========================= */

CREATE TABLE `notificacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_utilizador` int NOT NULL,
  `tipo` enum(
    'pedido_criado',
    'pedido_confirmado',
    'pedido_preparacao',
    'pedido_enviado',
    'pedido_entregue',
    'reuniao_agendada',
    'reuniao_cancelada',
    'sistema',
    'mensagem',
    'promocao'
  ) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensagem` text NOT NULL,
  `cor` varchar(20) DEFAULT NULL,
  `id_relacionado` int DEFAULT NULL,
  `lido` tinyint(1) DEFAULT 0,
  `email_enviado` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `notificacoes_user_fk` (`id_utilizador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/* =========================
   FAVORITOS
========================= */

CREATE TABLE `favoritos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_utilizador` int NOT NULL,
  `id_material` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `favoritos_user_material_unique` (`id_utilizador`, `id_material`),
  KEY `favoritos_user_fk` (`id_utilizador`),
  KEY `favoritos_material_fk` (`id_material`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/* =========================
   FOREIGN KEYS
========================= */

ALTER TABLE `account`
  ADD CONSTRAINT `account_user_fk`
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

ALTER TABLE `session`
  ADD CONSTRAINT `session_user_fk`
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

ALTER TABLE `two_factor`
  ADD CONSTRAINT `two_factor_user_fk`
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

ALTER TABLE `uploads`
  ADD CONSTRAINT `uploads_user_fk`
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

ALTER TABLE `categoria`
  ADD CONSTRAINT `categoria_pai_fk`
  FOREIGN KEY (`id_categoria_pai`) REFERENCES `categoria` (`id`) ON DELETE SET NULL;

ALTER TABLE `material`
  ADD CONSTRAINT `material_categoria_fk`
  FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `material_tipo_preco_fk`
  FOREIGN KEY (`id_tipo_preco`) REFERENCES `tipo_preco` (`id`);

ALTER TABLE `material_variants`
  ADD CONSTRAINT `material_variants_fk`
  FOREIGN KEY (`material_id`) REFERENCES `material` (`id`) ON DELETE CASCADE;

ALTER TABLE `category_attributes`
  ADD CONSTRAINT `category_attr_fk`
  FOREIGN KEY (`category_id`) REFERENCES `categoria` (`id`) ON DELETE CASCADE;

ALTER TABLE `pedido_orca`
  ADD CONSTRAINT `pedido_orca_utilizador_fk`
  FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador` (`id`) ON DELETE CASCADE;

ALTER TABLE `pedido_orca_item`
  ADD CONSTRAINT `pedido_item_orca_fk`
  FOREIGN KEY (`id_pedido_orca`) REFERENCES `pedido_orca` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_item_material_fk`
  FOREIGN KEY (`id_material`) REFERENCES `material` (`id`);

ALTER TABLE `encomenda`
  ADD CONSTRAINT `encomenda_orca_fk`
  FOREIGN KEY (`id_pedido_orca`) REFERENCES `pedido_orca` (`id`) ON DELETE CASCADE;

ALTER TABLE `reuniao`
  ADD CONSTRAINT `reuniao_utilizador_fk`
  FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador` (`id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
