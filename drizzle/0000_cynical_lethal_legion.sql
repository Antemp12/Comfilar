CREATE TABLE `categoria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`id_categoria_pai` int,
	`image` text,
	`is_featured` boolean DEFAULT false,
	`managed_by` varchar(20) DEFAULT 'admin',
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categoria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `category_attributes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`attribute_name` varchar(100) NOT NULL,
	`attribute_values` json NOT NULL,
	CONSTRAINT `category_attributes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favoritos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_utilizador` int NOT NULL,
	`id_material` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `favoritos_id` PRIMARY KEY(`id`),
	CONSTRAINT `favoritos_user_material_unique` UNIQUE(`id_utilizador`,`id_material`)
);
--> statement-breakpoint
CREATE TABLE `material_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`material_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`value` varchar(100) NOT NULL,
	`label` varchar(100),
	`image` text,
	`stock` int DEFAULT 0,
	`price_adjustment` decimal(10,2) DEFAULT '0',
	`is_available` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `material_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(150) NOT NULL,
	`descricao` text,
	`preco` decimal(10,2) NOT NULL,
	`stock` int DEFAULT 0,
	`imagem` text NOT NULL,
	`id_categoria` int NOT NULL,
	`id_tipo_preco` int,
	`is_featured` boolean DEFAULT false,
	`managed_by` varchar(20) DEFAULT 'admin',
	`attributes` json DEFAULT ('{}'),
	`is_deleted` boolean DEFAULT false,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `material_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedido_reuniao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_utilizador` int NOT NULL,
	`data` timestamp NOT NULL,
	`hora_inicio` varchar(5) NOT NULL,
	`hora_fim` varchar(5) NOT NULL,
	`assunto` varchar(200),
	`estado` enum('pendente','aprovado','rejeitado','cancelado') NOT NULL DEFAULT 'pendente',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `pedido_reuniao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reuniao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_utilizador` int NOT NULL,
	`data` timestamp NOT NULL DEFAULT (now()),
	`descricao` text,
	CONSTRAINT `reuniao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_utilizador` int NOT NULL,
	`tipo` enum('pedido_criado','pedido_confirmado','pedido_preparacao','pedido_enviado','pedido_entregue','reuniao_agendada','reuniao_cancelada','sistema','mensagem','promocao') NOT NULL,
	`titulo` varchar(150) NOT NULL,
	`mensagem` text NOT NULL,
	`cor` varchar(20),
	`id_relacionado` int,
	`lido` boolean DEFAULT false,
	`email_enviado` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `encomenda_item` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_encomenda` int NOT NULL,
	`id_material` int NOT NULL,
	`id_material_variant` int,
	`quantidade` int NOT NULL DEFAULT 1,
	`preco_unitario` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `encomenda_item_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `encomenda` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_pedido_orca` int NOT NULL,
	`estado` enum('processamento','preparacao','enviado','entregue') NOT NULL DEFAULT 'processamento',
	`data_confirm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `encomenda_id` PRIMARY KEY(`id`),
	CONSTRAINT `encomenda_id_pedido_orca_unique` UNIQUE(`id_pedido_orca`)
);
--> statement-breakpoint
CREATE TABLE `tipo_preco` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('unitario','m2','litro','kg','m3') NOT NULL,
	CONSTRAINT `tipo_preco_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedido_orca_item` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_pedido_orca` int NOT NULL,
	`id_material` int NOT NULL,
	`quantidade` int NOT NULL DEFAULT 1,
	CONSTRAINT `pedido_orca_item_id` PRIMARY KEY(`id`),
	CONSTRAINT `pedido_orca_item_id_pedido_orca_id_material_unique` UNIQUE(`id_pedido_orca`,`id_material`)
);
--> statement-breakpoint
CREATE TABLE `pedido_orca` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_utilizador` int NOT NULL,
	`estado` enum('pendente','analise','aprovado','rejeitado','convertido') NOT NULL DEFAULT 'pendente',
	`data` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pedido_orca_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `configuracoes_site` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chave` varchar(100) NOT NULL,
	`valor` text,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracoes_site_id` PRIMARY KEY(`id`),
	CONSTRAINT `configuracoes_site_chave_unique` UNIQUE(`chave`)
);
--> statement-breakpoint
CREATE TABLE `utilizador` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`email` varchar(120) NOT NULL,
	`password` varchar(255) NOT NULL,
	`tipo` enum('cliente','funcionario','admin') NOT NULL DEFAULT 'cliente',
	`data_registo` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `utilizador_id` PRIMARY KEY(`id`),
	CONSTRAINT `utilizador_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `shopping_cart` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`materialId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopping_cart_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalogs` (
	`id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`image_url` text NOT NULL,
	`description` text,
	`order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `categoria` ADD CONSTRAINT `categoria_id_categoria_pai_categoria_id_fk` FOREIGN KEY (`id_categoria_pai`) REFERENCES `categoria`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `category_attributes` ADD CONSTRAINT `category_attributes_category_id_categoria_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categoria`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoritos` ADD CONSTRAINT `favoritos_id_utilizador_utilizador_id_fk` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoritos` ADD CONSTRAINT `favoritos_id_material_material_id_fk` FOREIGN KEY (`id_material`) REFERENCES `material`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `material_variants` ADD CONSTRAINT `material_variants_material_id_material_id_fk` FOREIGN KEY (`material_id`) REFERENCES `material`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `material` ADD CONSTRAINT `material_id_categoria_categoria_id_fk` FOREIGN KEY (`id_categoria`) REFERENCES `categoria`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `material` ADD CONSTRAINT `material_id_tipo_preco_tipo_preco_id_fk` FOREIGN KEY (`id_tipo_preco`) REFERENCES `tipo_preco`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pedido_reuniao` ADD CONSTRAINT `pedido_reuniao_id_utilizador_utilizador_id_fk` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reuniao` ADD CONSTRAINT `reuniao_id_utilizador_utilizador_id_fk` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_id_utilizador_utilizador_id_fk` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `encomenda_item` ADD CONSTRAINT `encomenda_item_id_encomenda_encomenda_id_fk` FOREIGN KEY (`id_encomenda`) REFERENCES `encomenda`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `encomenda_item` ADD CONSTRAINT `encomenda_item_id_material_material_id_fk` FOREIGN KEY (`id_material`) REFERENCES `material`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `encomenda_item` ADD CONSTRAINT `encomenda_item_id_material_variant_material_variants_id_fk` FOREIGN KEY (`id_material_variant`) REFERENCES `material_variants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `encomenda` ADD CONSTRAINT `encomenda_id_pedido_orca_pedido_orca_id_fk` FOREIGN KEY (`id_pedido_orca`) REFERENCES `pedido_orca`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pedido_orca_item` ADD CONSTRAINT `pedido_orca_item_id_pedido_orca_pedido_orca_id_fk` FOREIGN KEY (`id_pedido_orca`) REFERENCES `pedido_orca`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pedido_orca_item` ADD CONSTRAINT `pedido_orca_item_id_material_material_id_fk` FOREIGN KEY (`id_material`) REFERENCES `material`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pedido_orca` ADD CONSTRAINT `pedido_orca_id_utilizador_utilizador_id_fk` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizador`(`id`) ON DELETE cascade ON UPDATE no action;