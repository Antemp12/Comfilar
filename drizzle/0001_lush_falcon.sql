ALTER TABLE `catalogs` MODIFY COLUMN `image_url` longtext NOT NULL;--> statement-breakpoint
ALTER TABLE `catalogs` MODIFY COLUMN `description` longtext;--> statement-breakpoint
ALTER TABLE `catalogs` MODIFY COLUMN `order` int;--> statement-breakpoint
ALTER TABLE `catalogs` MODIFY COLUMN `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `catalogs` MODIFY COLUMN `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;