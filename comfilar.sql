-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 07-Fev-2026 às 14:12
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `comfilar`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `account`
--

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
  `user_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `account`
--

INSERT INTO `account` (`access_token`, `access_token_expires_at`, `account_id`, `created_at`, `id`, `id_token`, `password`, `provider_id`, `refresh_token`, `refresh_token_expires_at`, `scope`, `updated_at`, `user_id`) VALUES
(NULL, NULL, 'admin@comfilar.test', '2025-12-26 15:26:57', 'account-admin-1766762817234', NULL, '1234', 'credential', NULL, NULL, NULL, '2025-12-26 15:26:57', 'admin-1766762817234');

-- --------------------------------------------------------

--
-- Estrutura da tabela `catalogs`
--

CREATE TABLE `catalogs` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `image_url` longtext NOT NULL,
  `description` longtext DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `catalogs`
--

INSERT INTO `catalogs` (`id`, `title`, `image_url`, `description`, `order`, `created_at`, `updated_at`) VALUES
('catalog-1', 'Promoção Especial - Casas de Banho', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&q=85&fm=webp', 'Descubra as melhores ofertas em revestimentos para casas de banho com até 50% de desconto', 1, '2026-02-06 19:33:41', '2026-02-06 19:33:41'),
('catalog-2', 'Novidade - Pavimentos Premium', 'https://images.unsplash.com/photo-1509303226517-a0842adc3f73?w=1920&q=85&fm=webp', 'Explore nossa nova coleção de pavimentos em estilo moderno e contemporâneo', 2, '2026-02-06 19:33:41', '2026-02-06 19:33:41'),
('catalog-3', 'Climatização Inteligente', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1920&q=85&fm=webp', 'Sistemas de climatização eficientes para conforto máximo em sua casa ou empresa', 3, '2026-02-06 19:33:41', '2026-02-06 19:33:41');

-- --------------------------------------------------------

--
-- Estrutura da tabela `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `id_categoria_pai` int(11) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `managed_by` varchar(20) DEFAULT 'admin',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `categoria`
--

INSERT INTO `categoria` (`id`, `nome`, `id_categoria_pai`, `image`, `is_featured`, `managed_by`, `updated_at`) VALUES
(1, 'Casas de banho', NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB3_zGKtfsf_IPpwGBbstjUu2PKj4-Uix3VQ&s', 1, 'admin', '2026-02-06 21:10:58'),
(2, 'Pavimentos e revestimentos', NULL, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(3, 'Climatização', NULL, NULL, 1, 'admin', '2026-02-06 19:04:33'),
(4, 'Construção', NULL, NULL, 1, 'admin', '2026-02-06 19:04:33'),
(5, 'Pintura', NULL, NULL, 1, 'admin', '2026-02-06 19:04:33'),
(6, 'Móveis e arrumação', NULL, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(7, 'Canalização', NULL, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(8, 'Energia renovável', NULL, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(11, 'Sanitários', 1, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(12, 'Lavatórios', 1, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(13, 'Chuveiros', 1, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(14, 'Banheiras', 1, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(15, 'Acessórios de banho', 1, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(16, 'Espelhos', 1, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(17, 'Mobiliário de banho', 1, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(21, 'Azulejos cerâmicos', 2, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(22, 'Mármores e granitos', 2, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(23, 'Vinílicos', 2, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(24, 'Laminados', 2, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(25, 'Pavimento elevado', 2, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(26, 'Revestimentos decorativos', 2, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(31, 'Bombas de calor', 3, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(32, 'Ar condicionado', 3, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(33, 'Caldeiras', 3, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(34, 'Recuperadores', 3, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(35, 'Salamandras', 3, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(36, 'Radiadores', 3, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(37, 'Acessórios de climatização', 3, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(41, 'Cimentos e argamassas', 4, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(42, 'Blocos e tijolos', 4, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(43, 'Estruturas metálicas', 4, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(44, 'Madeiras de construção', 4, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(45, 'Isolamento térmico', 4, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(46, 'Impermeabilização', 4, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(47, 'Ferramentas de construção', 4, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(51, 'Tintas látex', 5, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(52, 'Tintas esmaltes', 5, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(53, 'Tintas epóxi', 5, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(54, 'Vernizes', 5, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(55, 'Primer e seladores', 5, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(56, 'Ferramentas de pintura', 5, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(57, 'Aditivos', 5, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(61, 'Móveis de escritório', 6, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(62, 'Móveis de cozinha', 6, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(63, 'Armários e roupeiros', 6, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(64, 'Estantes e prateleiras', 6, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(65, 'Móveis modulares', 6, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(66, 'Soluções de arrumação', 6, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(67, 'Acessórios de mobiliário', 6, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(71, 'Tubos PVC', 7, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(72, 'Tubos cobre', 7, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(73, 'Tubos PPR', 7, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(74, 'Conexões e acessórios', 7, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(75, 'Válvulas e registos', 7, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(76, 'Sifões e ralos', 7, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(77, 'Ferramentas de canalização', 7, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(81, 'Painéis solares', 8, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(82, 'Inversores solares', 8, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(83, 'Baterias solares', 8, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(84, 'Sistemas eólicos', 8, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(85, 'Aquecimento solar', 8, NULL, 0, 'admin', '2026-02-05 23:00:59'),
(86, 'Acessórios renováveis', 8, NULL, 0, 'admin', '2026-02-05 23:00:59');

-- --------------------------------------------------------

--
-- Estrutura da tabela `category_attributes`
--

CREATE TABLE `category_attributes` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `attribute_name` varchar(100) NOT NULL,
  `attribute_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`attribute_values`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `category_attributes`
--

INSERT INTO `category_attributes` (`id`, `category_id`, `attribute_name`, `attribute_values`) VALUES
(1, 1, 'Tipo', '[\"Sanitário\", \"Lavatório\", \"Chuveiro\", \"Banheira\", \"Espelho\"]'),
(2, 1, 'Material', '[\"Cerâmica\", \"Acrílico\", \"Vidro\"]'),
(3, 1, 'Cor', '[\"Branco\", \"Preto\", \"Cinzento\", \"Bege\"]'),
(4, 2, 'Tipo', '[\"Azulejo\", \"Piso Vinílico\", \"Mármol\", \"Granito\"]'),
(5, 2, 'Formato', '[\"20x20cm\", \"45x45cm\", \"60x60cm\"]'),
(6, 2, 'Acabamento', '[\"Fosco\", \"Brilho\", \"Mate\"]'),
(7, 3, 'Tipo', '[\"Bomba de Calor\", \"Ar Condicionado\", \"Caldeira\", \"Recuperador de Calor\"]'),
(8, 3, 'Potência', '[\"5kW\", \"9kW\", \"12kW\", \"15kW\", \"24kW\"]'),
(9, 3, 'Tecnologia', '[\"Inverter\", \"Fixa\", \"On-Grid\"]'),
(10, 4, 'Tipo', '[\"Cimento\", \"Bloco\", \"Madeira\", \"Isolante\"]'),
(11, 4, 'Formato', '[\"50kg\", \"20x20x40cm\", \"2m\"]'),
(12, 5, 'Tipo', '[\"Tinta Látex\", \"Tinta Acrílica\", \"Verniz\"]'),
(13, 5, 'Cor', '[\"Branco\", \"Azul\", \"Verde\", \"Vermelho\", \"Preto\", \"Cinzento\"]'),
(14, 5, 'Acabamento', '[\"Fosco\", \"Brilho\", \"Semibrilho\"]'),
(15, 5, 'Capacidade', '[\"1L\", \"5L\", \"18L\"]'),
(16, 6, 'Tipo', '[\"Armário\", \"Prateleira\", \"Gaveta\"]'),
(17, 6, 'Material', '[\"Madeira\", \"MDF\", \"Metal\"]'),
(18, 6, 'Cor', '[\"Natural\", \"Branco\", \"Preto\", \"Cinzento\"]'),
(19, 7, 'Tipo', '[\"Tubo PVC\", \"Tubo Cobre\", \"Válvula\"]'),
(20, 7, 'Diâmetro', '[\"15mm\", \"20mm\", \"32mm\"]'),
(21, 7, 'Comprimento', '[\"3m\", \"6m\"]'),
(22, 8, 'Tipo', '[\"Painel Solar\", \"Inversor\"]'),
(23, 8, 'Potência', '[\"400W\", \"3kW\"]'),
(24, 8, 'Tipo Painel', '[\"Monocristalino\", \"Policristalino\"]'),
(25, 1, 'Cor', '[\"Branco\", \"Preto\", \"Cinzento\", \"Bege\", \"Azul\", \"Verde\", \"Vermelho\"]'),
(26, 1, 'Tipo', '[\"Louça\", \"Cerâmica\", \"Acrílico\", \"Pedra Natural\", \"Vidro\"]'),
(27, 1, 'Tamanho (Largura x Comprimento)', '[\"60x60cm\", \"80x80cm\", \"100x100cm\", \"120x120cm\", \"150x150cm\", \"180x180cm\"]'),
(28, 2, 'Tipo', '[\"Cerâmico\", \"Porcelânico\", \"Vidrado\", \"Natural\", \"Laminado\", \"Vinílico\"]'),
(29, 2, 'Tamanho', '[\"30x30cm\", \"45x45cm\", \"60x60cm\", \"80x80cm\", \"100x100cm\", \"120x120cm\", \"150x150cm\"]'),
(30, 2, 'Cor', '[\"Branco\", \"Cinzento\", \"Bege\", \"Preto\", \"Castanho\", \"Vermelho\", \"Azul\"]'),
(31, 3, 'Tipo de Energia', '[\"Elétrico\", \"Gás natural\", \"Gasoléo\", \"Solar\", \"Híbrido\"]'),
(32, 3, 'Potência', '[\"2kW\", \"3kW\", \"5kW\", \"8kW\", \"10kW\", \"15kW\", \"20kW\", \"25kW\"]'),
(33, 4, 'Grosso ou Fino', '[\"Fino\", \"Normal\", \"Grosso\", \"Extra-grosso\"]'),
(34, 4, 'Peso', '[\"Leve\", \"Médio\", \"Pesado\", \"Extra-pesado\"]'),
(35, 4, 'Tamanho', '[\"25kg\", \"50kg\", \"100kg\", \"200kg\", \"500kg\", \"1000kg\"]'),
(36, 5, 'Interior/Exterior', '[\"Interior\", \"Exterior\", \"Interior + Exterior\"]'),
(37, 5, 'Cor', '[\"Branco\", \"Preto\", \"Cinzento\", \"Bege\", \"Castanho\", \"Vermelho\", \"Azul\", \"Verde\", \"Amarelo\"]'),
(38, 5, 'Capacidade', '[\"0.5L\", \"1L\", \"2.5L\", \"5L\", \"10L\", \"15L\", \"20L\"]'),
(39, 5, 'Finalidade', '[\"Paredes\", \"Madeira\", \"Metal\", \"Especial\", \"Impermeável\"]'),
(40, 6, 'Tamanho', '[\"Pequeno\", \"Médio\", \"Grande\", \"Extra-grande\"]'),
(41, 6, 'Acabamento', '[\"Natural\", \"Pintado\", \"Envernizado\", \"Laminado\", \"Vidro\"]'),
(42, 6, 'Finalidade', '[\"Armazenagem\", \"Decoração\", \"Funcional\", \"Trabalho\"]'),
(43, 6, 'Material', '[\"Madeira\", \"MDF\", \"Metal\", \"Vidro\", \"Pele\", \"Tecido\"]'),
(44, 7, 'Tipo', '[\"PVC\", \"Cobre\", \"PPR\", \"Ferro\", \"Aço inoxidável\"]'),
(45, 7, 'Diâmetro', '[\"10mm\", \"12mm\", \"15mm\", \"20mm\", \"25mm\", \"32mm\", \"40mm\", \"50mm\"]'),
(46, 7, 'Tamanho', '[\"1m\", \"2m\", \"3m\", \"5m\", \"10m\"]'),
(47, 7, 'Comprimento', '[\"1m\", \"2m\", \"5m\", \"10m\", \"50m\"]'),
(48, 8, 'Tipo', '[\"Solar fotovoltaico\", \"Solar térmico\", \"Eólico\", \"Híbrido\"]'),
(49, 8, 'Potência', '[\"1kW\", \"2kW\", \"3kW\", \"5kW\", \"10kW\", \"15kW\", \"20kW\", \"50kW\"]');

-- --------------------------------------------------------

--
-- Estrutura da tabela `configuracoes_site`
--

CREATE TABLE `configuracoes_site` (
  `id` int(11) NOT NULL,
  `chave` varchar(100) NOT NULL,
  `valor` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `configuracoes_site`
--

INSERT INTO `configuracoes_site` (`id`, `chave`, `valor`, `updated_at`) VALUES
(1, 'login_background_image', 'https://i.etsystatic.com/20800859/r/il/31ce6c/2784722638/il_570xN.2784722638_62jx.jpg', '2026-02-06 00:09:38'),
(2, 'admin_background_image', 'https://i.etsystatic.com/20800859/r/il/31ce6c/2784722638/il_570xN.2784722638_62jx.jpg', '2026-02-06 00:09:38'),
(3, 'funcionario_background_image', 'https://i.etsystatic.com/20800859/r/il/31ce6c/2784722638/il_570xN.2784722638_62jx.jpg', '2026-02-06 00:09:38');

-- --------------------------------------------------------

--
-- Estrutura da tabela `encomenda`
--

CREATE TABLE `encomenda` (
  `id` int(11) NOT NULL,
  `id_utilizador` int(11) NOT NULL,
  `data_confirm` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('processamento','preparacao','enviado','entregue') DEFAULT 'processamento',
  `id_pedido_orca` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `encomenda`
--

INSERT INTO `encomenda` (`id`, `id_utilizador`, `data_confirm`, `estado`, `id_pedido_orca`) VALUES
(2, 8, '2026-02-07 00:21:02', 'enviado', 4),
(3, 8, '2026-02-07 00:32:26', 'processamento', 5),
(4, 8, '2026-02-07 00:40:35', 'processamento', 6),
(5, 8, '2026-02-07 00:44:09', 'processamento', 7),
(6, 8, '2026-02-07 00:45:36', 'processamento', 8),
(7, 8, '2026-02-07 00:49:16', 'processamento', 9),
(8, 3, '2026-02-07 00:56:45', 'processamento', 10),
(9, 3, '2026-02-07 01:01:17', 'processamento', 11),
(10, 3, '2026-02-07 01:02:55', 'processamento', 12);

-- --------------------------------------------------------

--
-- Estrutura da tabela `encomenda_item`
--

CREATE TABLE `encomenda_item` (
  `id` int(11) NOT NULL,
  `id_encomenda` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `preco_unitario` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `encomenda_item`
--

INSERT INTO `encomenda_item` (`id`, `id_encomenda`, `id_material`, `quantidade`, `preco_unitario`, `created_at`) VALUES
(1, 2, 14, 2, 18.50, '2026-02-07 00:21:02'),
(2, 3, 4, 1, 850.00, '2026-02-07 00:32:26'),
(3, 4, 15, 1, 1.20, '2026-02-07 00:40:35'),
(4, 4, 7, 2, 18.50, '2026-02-07 00:40:35'),
(5, 5, 26, 2, 450.00, '2026-02-07 00:44:10'),
(6, 6, 26, 2, 450.00, '2026-02-07 00:45:36'),
(7, 7, 26, 2, 450.00, '2026-02-07 00:49:16'),
(8, 8, 27, 1, 250.00, '2026-02-07 00:56:45'),
(9, 9, 15, 1, 1.20, '2026-02-07 01:01:17'),
(10, 10, 7, 1, 18.50, '2026-02-07 01:02:55');

-- --------------------------------------------------------

--
-- Estrutura da tabela `favoritos`
--

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `id_utilizador` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `material`
--

CREATE TABLE `material` (
  `id` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `descricao` text DEFAULT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_tipo_preco` int(11) DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `imagem` text DEFAULT '/images/placeholder-product.jpg',
  `is_featured` tinyint(1) DEFAULT 0,
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' CHECK (json_valid(`attributes`)),
  `is_deleted` tinyint(1) DEFAULT 0,
  `managed_by` varchar(20) DEFAULT 'admin',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `material`
--

INSERT INTO `material` (`id`, `nome`, `descricao`, `id_categoria`, `id_tipo_preco`, `preco`, `stock`, `imagem`, `is_featured`, `attributes`, `is_deleted`, `managed_by`, `updated_at`) VALUES
(1, 'Sanitário Suspenso Branco', 'Sanitário suspenso com caixa de descarga integrada', 11, 1, 180.00, 15, '/images/placeholder-product.jpg', 1, '{}', 0, 'admin', '2026-02-06 18:46:05'),
(2, 'Lavatório Quadrado 60cm', 'Lavatório cerâmico quadrado com pedestal', 12, 1, 95.00, 8, '/images/placeholder-product.jpg', 1, '{}', 0, 'admin', '2026-02-06 18:46:05'),
(3, 'Chuveiro Elétrico 5500W', 'Chuveiro elétrico com 3 temperaturas', 13, 1, 45.00, 25, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(4, 'Banheira Hidromassagem 170cm', 'Banheira acrílica com hidromassagem', 14, 1, 850.00, 5, 'data:image/webp;base64,UklGRsQFAABXRUJQVlA4ILgFAACwHgCdASqgAHoAPj0ci0QiIaEUaL0YIAPEsoHYD1Ko8++8B8+3zgHWV+gB5bHtDScrlSnw3rr7QZntk30c4yXlK84rUK/Vv/fFaFZ15xblT43VgsripMaI46fGsRHyVtgx8hQ3mNGlD+YLXveVeuLZCBD5vv88Gs+owtNIXLU4gx/FUQSL8yLRBpJ9B91pRY0ewJWUBwiYpSVHnEBCKFaeecZI5dsRPlgH3+PsVTqf/1IUiHq4PYBxpvpCl7TWkAWMU97WlOqLDsbEBNHrydtOkm4cmZs/ltvn4ZcDwaP8VT70FiD5iS9LUmK+gQXcF3Q2RSNWKqqqdRx15xaIAAD+/mfwqfwAjXKDyIcKauIYN+Sb/Suqn//iY/Ixq442GNsbW8DIH4fvyfff/jtXR2fr15JBcZfcuT9FCC235hOTvv/9UM5bdoRDwdzLvry0cj+cPkkb+VO0f0539KfP+wGjnVyTs8ssn5I/aa/Gf4xPskFv3mrrTHY+/F/kV+a2xbDAcqiXT7apYvcAHOdSGVQEscHHaTDdf5iflbcZ84VKaoboo9iX7fs4i7sryOkXT7greDPXXzN9dG3u302c6kHjRXetzCB3ammJ0Lc8G6vR/EweznzjxceY4/pHukwA+gIF8cDZ4ig193aPSztglPIog1bUCN+Z5A0HhTcLkbkBaBh5MZlKH6rNjiGfQwY7jBEg03au2Ytj2XTnF/+UmKbqiehnIp+C6hrVBx0DzMbVwRFlziWB4VrfozGr2V7cJhUiHZJwyXzho38Tz2oggVByFYKcBcH5I+iHMqbWesLP3tLmveguLQVTRO6kvhakQv+zopG+RWJDnKg6Mr4gdVyffue8/+XpyPwz5u15mt38MGfXRzt4ywNUAL9MhH9uCmRYl9yNwsMNcrJ9piHrQ7n8TzXcSpbc+tRQt3lVYZZ/Kw1zpSjc1Wrle7w0HARYivnkRdvSFq3yMgmpV3Ljame1dUj4cLl8clh5JM462HveCpryFrmO+wNt4cTX79ZvynsCT5LMnGj7qPmL5YogRhBTcxI5c9vE0Vl6FwzC7nnzqA8IurlOA7dmgkeXnnM0VHaHDmcUCGHjFOj+MLkUxpImqnfKAA0w5NZ++Hv0pDMj7fK2HfTaYpHTUIM2ME9abinGp2hAl//csJR7+2oZpEz8Whj/a20D0eEnJawZHVqbcEI6QNXsD2KWdjpReGED1glyJnYXcOnoTSkH6vJ+3+jvnpNWGSAqpzTWUvrCUduAO4ip8ykUfn3fwT9tCPpR5oY7ivecfd5M8xWTz8u9K88zsPZrNhFLKeX50LrJHviIQNlebVF+xsol0ypT6PJGjRK441mlbkpfOg31cInaEpQIwd0xy5eAASqmsBIXrCd9fmjIP9oSqZGcqdUIw5DRg1Y4hoAbVSNmVf1oUQZIaArHiLHs2U8rOQilsNzmbb5VjzhLKjBv9+B+aSXZI3LiTpKRPN11TLFuJTdwjcGdFy696XcrFz5Jdc87uCJo9whcktQRwITLIsoY1uPM4Sd5vJA0gS0kHaJNhR84SpWJuO3AxBcnmI56rYamczyc/y48l2GeucbHtQND9Gac2Mmmh7mjKYbyEzCOu8jsASbkUEJbcOZVGvjdY74xybTC7kiLPB1yHw8w2Y6Dtxm6NYRFmjA7HJfFQAml8MvXf4RoFIvplYAPNWxR1Qhk7RmSFUrNKZ05ZlvbJ8WH/zcvyzb/bl9p4vZoxYUBt9dXC5+zjIdmHkG5E46rTJc4Z5FIyx0M1U2KSKextXxT4ONso6BnG2m8W5QQnpgt9+E7EicU/hx+lTzcW8S9o9z5Y3ozY12BR7+8UcNH+/+tROMmwbihRrOYKPOVAtT7QwzdzbeIun1h0GWi+hJgvclQARiZ0TEQ2ceGksJO2wRL4pf0bnFfoB8/PHo4Opg51zDn5CUo1xPbQAAAAAAAAAA=', 1, '\"{}\"', 0, 'admin', '2026-02-06 18:46:05'),
(5, 'Espelho LED 80x60cm', 'Espelho com iluminação LED integrada', 16, 1, 120.00, 10, '/images/placeholder-product.jpg', 1, '{}', 0, 'admin', '2026-02-06 18:46:05'),
(6, 'Azulejo Branco 20x20cm', 'Azulejo cerâmico branco 20x20cm', 21, 2, 12.50, 200, '/images/placeholder-product.jpg', 0, '{}', 1, 'admin', '2026-02-06 14:19:37'),
(7, 'Azulejo Cerâmico 45x45cm', 'Azulejo cerâmico esmaltado para parede', 21, 2, 18.50, 299, 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSMv-NZ_107LSCETambMu0BrDQ3NrQqO9wByXbjNlQQl7AfhPXSVLh_ZdGGRwBBM36JBjQGnpqcNWCoinvSMK61PW-rkX1xxUWsXQBCYJmL&usqp=CAc', 1, '\"{}\"', 0, 'admin', '2026-02-07 01:02:55'),
(8, 'Mármore Carrara Branco', 'Mármore natural branco para bancadas', 22, 2, 85.00, 50, '/images/placeholder-product.jpg', 1, '{}', 0, 'admin', '2026-02-06 18:46:05'),
(9, 'Piso Vinílico 3mm', 'Piso vinílico resistente à água', 23, 2, 12.00, 100, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(10, 'Bomba de Calor Ar-Ar 12kW', 'Bomba de calor para aquecimento e arrefecimento', 31, 1, 2500.00, 5, '/images/placeholder-product.jpg', 1, '{}', 0, 'admin', '2026-02-06 18:46:05'),
(12, 'Caldeira a Gás 24kW', 'Caldeira a gás natural para aquecimento central', 33, 1, 1200.00, 3, '/images/placeholder-product.jpg', 1, '{}', 0, 'admin', '2026-02-06 18:46:05'),
(13, 'Recuperador Calor 15kW', 'Recuperador de calor a lenha', 34, 1, 980.00, 4, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(14, 'Cimento Portland 50kg', 'Cimento Portland tipo CP II para construção', 41, 1, 18.50, 200, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(15, 'Bloco de Concreto 20x20x40cm', 'Bloco de concreto celular para alvenaria', 42, 1, 1.20, 999, 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcR-mENT6TaLErZZpBUniFpKVJLf-peXK8EdJi6jN2GTI7iyRYAdDYrmrWFNvHvDywKPj9OlWd-KS4sqOMa_0IO0z5BVm9RgpFBfSIuo_Q0KdLPcWr0cql5bWy7nDwehVWqQ0V8GXQ&usqp=CAc', 0, '\"{}\"', 0, 'admin', '2026-02-07 01:01:17'),
(16, 'Madeira Pinho 2m', 'Tábua de pinho para construção', 44, 2, 15.00, 50, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(18, 'Tinta Látex Acrílica 18L', 'Tinta látex acrílica branca fosca', 51, 4, 75.00, 30, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(19, 'Verniz Marítimo 1L', 'Verniz marítimo para madeira exterior', 5, 4, 28.00, 40, 'data:image/webp;base64,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', 0, '{}', 0, 'admin', '2026-02-07 01:30:59'),
(21, 'Estante Modular 5 Prateleiras', 'Estante modular em MDF branco', 64, 1, 85.00, 20, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(22, 'Tubo PVC 32mm (barra 3m)', 'Tubo de PVC para canalização de águas', 71, 1, 8.50, 50, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(23, 'Tubo Cobre 15mm (barra 3m)', 'Tubo de cobre rígido para água quente', 72, 1, 25.00, 60, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(24, 'Válvula de Esfera 1/2\"', 'Válvula de esfera em latão para água', 75, 1, 8.50, 100, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(25, 'Painel Solar 400W Monocristalino', 'Painel solar monocristalino 400W', 81, 1, 180.00, 10, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(26, 'Inversor Solar 3kW', 'Inversor solar on-grid 3000W', 82, 1, 450.00, 5, '/images/placeholder-product.jpg', 0, '{}', 0, 'admin', '2026-02-05 23:00:59'),
(27, 'Ar Condicionado Split 9000 BTU', 'dehbfvscv', 1, NULL, 250.00, 9, 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRf8QLfOyC8Hq_9-B6eJNQi1u0-OXQqnZxsNXzzF-F2kcqXOe3KBxm64f5zEDjj6pbtnGS_Gp_VA_tasAgmpbKKzh0Yp-rwUT-i4K6jRdTjEwckfkCmLHLjf8PhFGkdHX-jzHsWAQ&usqp=CAc', 0, '{\"tipo\": [\"Cerâmica\"], \"material\": [\"Acrílico\"], \"cor\": [\"Cinzento\"], \"tamanho (largura x comprimento)\": [\"80x80cm\"]}', 0, 'admin', '2026-02-07 01:30:46'),
(28, 'ola', 'ctgvjbkl', 2, NULL, 20.00, 20, '', 0, '{\"tipo\": [\"Porcelânico\"], \"formato\": [\"20x20cm\"], \"acabamento\": [\"Fosco\"], \"tamanho\": [\"30x30cm\"], \"cor\": [\"Vermelho\"]}', 0, 'admin', '2026-02-07 01:31:12'),
(29, 'De novo', 'çldslkjch', 2, NULL, 54.00, 0, '', 0, '{\"tipo\":[\"Piso Vinílico\"],\"formato\":[\"20x20cm\"],\"acabamento\":[\"Brilho\"],\"tamanho\":[\"120x120cm\"],\"cor\":[\"Vermelho\"]}', 0, 'admin', '2026-02-07 01:41:52'),
(30, 'Last tryda', 'dmlmanbjknd', 2, NULL, 56.00, 5, '', 0, '{\"tipo\":[\"Azulejo\"],\"formato\":[\"20x20cm\"],\"acabamento\":[\"Fosco\"],\"tamanho\":[\"30x30cm\"],\"cor\":[\"Branco\"]}', 0, 'admin', '2026-02-07 01:47:41');

-- --------------------------------------------------------

--
-- Estrutura da tabela `material_variants`
--

CREATE TABLE `material_variants` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `label` varchar(100) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `price_adjustment` decimal(10,2) DEFAULT 0.00,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `notificacoes`
--

CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL,
  `id_utilizador` int(11) NOT NULL,
  `tipo` enum('pedido_criado','pedido_confirmado','pedido_preparacao','pedido_enviado','pedido_entregue','reuniao_agendada','reuniao_cancelada','sistema','mensagem','promocao') NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensagem` text NOT NULL,
  `cor` varchar(20) DEFAULT NULL,
  `id_relacionado` int(11) DEFAULT NULL,
  `lido` tinyint(1) DEFAULT 0,
  `email_enviado` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `notificacoes`
--

INSERT INTO `notificacoes` (`id`, `id_utilizador`, `tipo`, `titulo`, `mensagem`, `cor`, `id_relacionado`, `lido`, `email_enviado`, `created_at`) VALUES
(35, 8, 'pedido_criado', 'Encomenda Recebida', 'A sua encomenda #4 foi recebida e está a ser processada.', '#f59e0b', 4, 0, 1, '2026-02-07 00:40:35'),
(36, 8, 'reuniao_agendada', 'Reunião Aprovada', 'A sua reunião para 18/02/2026 às 02:43 foi aprovada.', '#22c55e', NULL, 0, 1, '2026-02-07 00:40:56'),
(38, 8, 'pedido_criado', 'Encomenda Recebida', 'A sua encomenda #7 foi recebida e está a ser processada.', '#f59e0b', 7, 0, 1, '2026-02-07 00:49:16'),
(39, 8, 'reuniao_agendada', 'Reunião Aprovada', 'A sua reunião para 18/02/2026 às 03:52 foi aprovada.', '#22c55e', NULL, 0, 1, '2026-02-07 00:49:44'),
(40, 8, 'reuniao_agendada', 'Reunião Cancelada', 'A sua reunião para 07/02/2026 às 03:52 foi cancelada.\n\nPara mais informações, contacte-nos via WhatsApp: +351 xxx xxx xxx', '#22c55e', NULL, 0, 1, '2026-02-07 00:55:39'),
(41, 8, 'reuniao_agendada', 'Reunião Cancelada', 'A sua reunião para 07/02/2026 às 02:43 foi cancelada.\n\nPara mais informações, contacte-nos via WhatsApp: +351 xxx xxx xxx', '#22c55e', NULL, 0, 1, '2026-02-07 00:55:43'),
(63, 3, 'reuniao_agendada', 'Reunião Cancelada', 'A sua reunião para 15/02/2026 às 09:00 foi cancelada.\n\nPara mais informações, contacte-nos via WhatsApp: +351 xxx xxx xxx', '#22c55e', NULL, 0, 1, '2026-02-07 02:25:18');

-- --------------------------------------------------------

--
-- Estrutura da tabela `pedido_orca`
--

CREATE TABLE `pedido_orca` (
  `id` int(11) NOT NULL,
  `data` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendente','analise','aprovado','rejeitado','convertido') DEFAULT 'pendente',
  `id_utilizador` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `pedido_orca`
--

INSERT INTO `pedido_orca` (`id`, `data`, `estado`, `id_utilizador`) VALUES
(1, '2026-02-07 00:14:34', '', 8),
(2, '2026-02-07 00:15:29', '', 8),
(3, '2026-02-07 00:16:46', '', 8),
(4, '2026-02-07 00:21:02', '', 8),
(5, '2026-02-07 00:32:26', '', 8),
(6, '2026-02-07 00:40:35', '', 8),
(7, '2026-02-07 00:44:09', '', 8),
(8, '2026-02-07 00:45:36', '', 8),
(9, '2026-02-07 00:49:16', '', 8),
(10, '2026-02-07 00:56:45', '', 3),
(11, '2026-02-07 01:01:17', '', 3),
(12, '2026-02-07 01:02:55', '', 3);

-- --------------------------------------------------------

--
-- Estrutura da tabela `pedido_orca_item`
--

CREATE TABLE `pedido_orca_item` (
  `id` int(11) NOT NULL,
  `id_pedido_orca` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `pedido_orca_item`
--

INSERT INTO `pedido_orca_item` (`id`, `id_pedido_orca`, `id_material`, `quantidade`) VALUES
(1, 1, 14, 2),
(2, 2, 14, 2),
(3, 3, 14, 2),
(4, 4, 14, 2),
(5, 5, 4, 1),
(6, 6, 15, 1),
(7, 6, 7, 2),
(8, 7, 26, 2),
(9, 8, 26, 2),
(10, 9, 26, 2),
(11, 10, 27, 1),
(12, 11, 15, 1),
(13, 12, 7, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `pedido_reuniao`
--

CREATE TABLE `pedido_reuniao` (
  `id` int(11) NOT NULL,
  `id_utilizador` int(11) NOT NULL,
  `data` datetime NOT NULL,
  `hora_inicio` varchar(5) NOT NULL,
  `hora_fim` varchar(5) NOT NULL,
  `assunto` varchar(200) DEFAULT NULL,
  `estado` enum('pendente','aprovado','rejeitado','cancelado') NOT NULL DEFAULT 'pendente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `pedido_reuniao`
--

INSERT INTO `pedido_reuniao` (`id`, `id_utilizador`, `data`, `hora_inicio`, `hora_fim`, `assunto`, `estado`, `created_at`) VALUES
(14, 3, '2026-02-18 06:24:00', '06:24', '07:25', 'almfknjha', 'aprovado', '2026-02-07 02:21:15');

-- --------------------------------------------------------

--
-- Estrutura da tabela `reuniao`
--

CREATE TABLE `reuniao` (
  `id` int(11) NOT NULL,
  `data` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `descricao` text DEFAULT NULL,
  `id_utilizador` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `reuniao`
--

INSERT INTO `reuniao` (`id`, `data`, `descricao`, `id_utilizador`) VALUES
(13, '2026-02-04 00:19:00', 'Reunião relacionada com a encomenda #16', 3),
(14, '2026-02-04 02:44:00', 'Reunião relacionada com a encomenda #17', 3),
(15, '2026-02-12 03:49:00', 'Reunião para Encomenda #18 - Ver', 3);

-- --------------------------------------------------------

--
-- Estrutura da tabela `session`
--

CREATE TABLE `session` (
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` text NOT NULL,
  `id` varchar(255) NOT NULL,
  `ip_address` text DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_agent` text DEFAULT NULL,
  `user_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `shopping_cart`
--

CREATE TABLE `shopping_cart` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `materialId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tipo_preco`
--

CREATE TABLE `tipo_preco` (
  `id` int(11) NOT NULL,
  `tipo` enum('unitario','m2','litro','kg','m3') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `tipo_preco`
--

INSERT INTO `tipo_preco` (`id`, `tipo`) VALUES
(1, 'unitario'),
(2, 'm2'),
(3, 'kg'),
(4, 'litro'),
(5, 'm3');

-- --------------------------------------------------------

--
-- Estrutura da tabela `two_factor`
--

CREATE TABLE `two_factor` (
  `backup_codes` text NOT NULL,
  `id` varchar(255) NOT NULL,
  `secret` text NOT NULL,
  `user_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `uploads`
--

CREATE TABLE `uploads` (
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id` varchar(255) NOT NULL,
  `key` text NOT NULL,
  `type` enum('image','video') NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `url` text NOT NULL,
  `user_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `user`
--

CREATE TABLE `user` (
  `age` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` text NOT NULL,
  `email_verified` tinyint(1) NOT NULL,
  `first_name` text DEFAULT NULL,
  `id` varchar(255) NOT NULL,
  `image` text DEFAULT NULL,
  `last_name` text DEFAULT NULL,
  `name` text NOT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `user`
--

INSERT INTO `user` (`age`, `created_at`, `email`, `email_verified`, `first_name`, `id`, `image`, `last_name`, `name`, `two_factor_enabled`, `updated_at`) VALUES
(NULL, '2025-12-26 15:26:57', 'admin@comfilar.test', 1, 'Admin', 'admin-1766762817234', NULL, NULL, 'Admin Comfilar', NULL, '2025-12-26 15:26:57');

-- --------------------------------------------------------

--
-- Estrutura da tabela `utilizador`
--

CREATE TABLE `utilizador` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tipo` enum('cliente','funcionario','admin') NOT NULL DEFAULT 'cliente',
  `data_registo` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `utilizador`
--

INSERT INTO `utilizador` (`id`, `nome`, `email`, `password`, `tipo`, `data_registo`) VALUES
(2, 'Funcionario Comfilar', 'func@comfilar.test', 'funcpass', 'funcionario', '2025-12-25 23:06:26'),
(3, 'Antemp', 'tomas.amorim@ipvc.pt', '$2b$10$Nrv8KZAt6nvpdfXaYtfjwugREs9vn3c8gAgZklPzsdMANpxBbLdBm', 'cliente', '2026-02-03 04:11:37'),
(4, 'Cliente', 'antemp.amorim@gmail.com', '$2b$10$Wvur8CDX4qtP9pVklhlVIu8UBhjyzeyVe0Ybz8X5zSpEz5sA2jgzO', 'cliente', '2026-02-05 19:10:43'),
(5, 'Administrador', 'admin@comfilar.pt', '$2b$10$/ztFAecIR7z2OIHJm12.dOsj2U0gjcY6XdeKch6Vc/vdswCUI0ETa', 'admin', '2026-02-06 18:32:46'),
(6, 'Tomás Amorim', 'func@comfilar.pt', '$2b$10$lowP6KZTovJy51eR0w8AOuPL3Y3GaqkSfApa15WI6lM4xr5RPx2Ii', 'funcionario', '2026-02-06 21:41:38'),
(8, 'teste', 'teste@gmail.com', '$2b$10$qoI5Q1fK6q70e.F76mK6sO9uTaLhOtAPPQmjgr.XEjK6J93f1cChW', 'cliente', '2026-02-07 00:13:41');

-- --------------------------------------------------------

--
-- Estrutura da tabela `verification`
--

CREATE TABLE `verification` (
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` text NOT NULL,
  `id` varchar(255) NOT NULL,
  `identifier` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `__drizzle_migrations`
--

CREATE TABLE `__drizzle_migrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `hash` text NOT NULL,
  `created_at` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_user_id_fk` (`user_id`);

--
-- Índices para tabela `catalogs`
--
ALTER TABLE `catalogs`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_pai_fk` (`id_categoria_pai`);

--
-- Índices para tabela `category_attributes`
--
ALTER TABLE `category_attributes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_attr_fk` (`category_id`);

--
-- Índices para tabela `configuracoes_site`
--
ALTER TABLE `configuracoes_site`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `chave` (`chave`);

--
-- Índices para tabela `encomenda`
--
ALTER TABLE `encomenda`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `encomenda_pedido_unique` (`id_pedido_orca`),
  ADD KEY `fk_encomenda_utilizador` (`id_utilizador`);

--
-- Índices para tabela `encomenda_item`
--
ALTER TABLE `encomenda_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_encomenda` (`id_encomenda`),
  ADD KEY `id_material` (`id_material`);

--
-- Índices para tabela `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `favoritos_user_material_unique` (`id_utilizador`,`id_material`),
  ADD KEY `favoritos_user_fk` (`id_utilizador`),
  ADD KEY `favoritos_material_fk` (`id_material`);

--
-- Índices para tabela `material`
--
ALTER TABLE `material`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_categoria_fk` (`id_categoria`),
  ADD KEY `material_tipo_preco_fk` (`id_tipo_preco`);

--
-- Índices para tabela `material_variants`
--
ALTER TABLE `material_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_variant_fk` (`material_id`);

--
-- Índices para tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notificacoes_user_fk` (`id_utilizador`);

--
-- Índices para tabela `pedido_orca`
--
ALTER TABLE `pedido_orca`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_orca_utilizador_fk` (`id_utilizador`);

--
-- Índices para tabela `pedido_orca_item`
--
ALTER TABLE `pedido_orca_item`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pedido_item_unique` (`id_pedido_orca`,`id_material`),
  ADD KEY `pedido_item_material_fk` (`id_material`);

--
-- Índices para tabela `pedido_reuniao`
--
ALTER TABLE `pedido_reuniao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utilizador` (`id_utilizador`);

--
-- Índices para tabela `reuniao`
--
ALTER TABLE `reuniao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reuniao_utilizador_fk` (`id_utilizador`);

--
-- Índices para tabela `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token_unique` (`token`),
  ADD KEY `session_user_id_fk` (`user_id`);

--
-- Índices para tabela `shopping_cart`
--
ALTER TABLE `shopping_cart`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `tipo_preco`
--
ALTER TABLE `tipo_preco`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `two_factor`
--
ALTER TABLE `two_factor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `two_factor_user_id_fk` (`user_id`);

--
-- Índices para tabela `uploads`
--
ALTER TABLE `uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploads_user_id_fk` (`user_id`);

--
-- Índices para tabela `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_email_unique` (`email`(255));

--
-- Índices para tabela `utilizador`
--
ALTER TABLE `utilizador`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `utilizador_email_unique` (`email`);

--
-- Índices para tabela `verification`
--
ALTER TABLE `verification`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `__drizzle_migrations`
--
ALTER TABLE `__drizzle_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT de tabela `category_attributes`
--
ALTER TABLE `category_attributes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de tabela `configuracoes_site`
--
ALTER TABLE `configuracoes_site`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `encomenda`
--
ALTER TABLE `encomenda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `encomenda_item`
--
ALTER TABLE `encomenda_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `material`
--
ALTER TABLE `material`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de tabela `material_variants`
--
ALTER TABLE `material_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT de tabela `pedido_orca`
--
ALTER TABLE `pedido_orca`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `pedido_orca_item`
--
ALTER TABLE `pedido_orca_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `pedido_reuniao`
--
ALTER TABLE `pedido_reuniao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `reuniao`
--
ALTER TABLE `reuniao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `shopping_cart`
--
ALTER TABLE `shopping_cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de tabela `tipo_preco`
--
ALTER TABLE `tipo_preco`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `utilizador`
--
ALTER TABLE `utilizador`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `__drizzle_migrations`
--
ALTER TABLE `__drizzle_migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `account_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `categoria`
--
ALTER TABLE `categoria`
  ADD CONSTRAINT `categoria_pai_fk` FOREIGN KEY (`id_categoria_pai`) REFERENCES `categoria` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `category_attributes`
--
ALTER TABLE `category_attributes`
  ADD CONSTRAINT `category_attr_fk` FOREIGN KEY (`category_id`) REFERENCES `categoria` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `encomenda`
--
ALTER TABLE `encomenda`
  ADD CONSTRAINT `encomenda_orca_fk` FOREIGN KEY (`id_pedido_orca`) REFERENCES `pedido_orca` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_encomenda_utilizador` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `encomenda_item`
--
ALTER TABLE `encomenda_item`
  ADD CONSTRAINT `encomenda_item_ibfk_1` FOREIGN KEY (`id_encomenda`) REFERENCES `encomenda` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `encomenda_item_ibfk_2` FOREIGN KEY (`id_material`) REFERENCES `material` (`id`);

--
-- Limitadores para a tabela `material`
--
ALTER TABLE `material`
  ADD CONSTRAINT `material_categoria_fk` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `material_tipo_preco_fk` FOREIGN KEY (`id_tipo_preco`) REFERENCES `tipo_preco` (`id`);

--
-- Limitadores para a tabela `material_variants`
--
ALTER TABLE `material_variants`
  ADD CONSTRAINT `material_variants_fk` FOREIGN KEY (`material_id`) REFERENCES `material` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `pedido_orca`
--
ALTER TABLE `pedido_orca`
  ADD CONSTRAINT `pedido_orca_utilizador_fk` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `pedido_orca_item`
--
ALTER TABLE `pedido_orca_item`
  ADD CONSTRAINT `pedido_item_material_fk` FOREIGN KEY (`id_material`) REFERENCES `material` (`id`),
  ADD CONSTRAINT `pedido_item_orca_fk` FOREIGN KEY (`id_pedido_orca`) REFERENCES `pedido_orca` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `pedido_reuniao`
--
ALTER TABLE `pedido_reuniao`
  ADD CONSTRAINT `pedido_reuniao_ibfk_1` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `reuniao`
--
ALTER TABLE `reuniao`
  ADD CONSTRAINT `reuniao_utilizador_fk` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `session_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `two_factor`
--
ALTER TABLE `two_factor`
  ADD CONSTRAINT `two_factor_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `uploads`
--
ALTER TABLE `uploads`
  ADD CONSTRAINT `uploads_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
