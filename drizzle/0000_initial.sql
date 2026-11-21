CREATE TABLE `admins` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `user_id` text NOT NULL, `email` text NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_user_id_idx` ON `admins` (`user_id`);
--> statement-breakpoint
CREATE TABLE `learners` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `user_id` text NOT NULL, `email` text NOT NULL, `display_name` text DEFAULT '' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `learners_user_id_idx` ON `learners` (`user_id`);
--> statement-breakpoint
CREATE TABLE `programs` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `slug` text NOT NULL, `title` text NOT NULL, `subtitle` text DEFAULT '' NOT NULL, `description` text DEFAULT '' NOT NULL, `cover_image` text DEFAULT '' NOT NULL, `price_thb` integer DEFAULT 0 NOT NULL, `status` text DEFAULT 'draft' NOT NULL, `sort_order` integer DEFAULT 0 NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `programs_slug_idx` ON `programs` (`slug`);
--> statement-breakpoint
CREATE TABLE `topics` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `program_id` integer NOT NULL, `slug` text NOT NULL, `title` text NOT NULL, `description` text DEFAULT '' NOT NULL, `cover_image` text DEFAULT '' NOT NULL, `status` text DEFAULT 'draft' NOT NULL, `sort_order` integer DEFAULT 0 NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action);
--> statement-breakpoint
CREATE TABLE `lessons` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `topic_id` integer NOT NULL, `title` text NOT NULL, `description` text DEFAULT '' NOT NULL, `video_key` text DEFAULT '' NOT NULL, `access_type` text DEFAULT 'paid' NOT NULL, `cover_image` text DEFAULT '' NOT NULL, `duration` text DEFAULT '' NOT NULL, `status` text DEFAULT 'draft' NOT NULL, `sort_order` integer DEFAULT 0 NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action);
--> statement-breakpoint
CREATE TABLE `enrollments` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `user_id` text NOT NULL, `program_id` integer NOT NULL, `status` text DEFAULT 'active' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action);
--> statement-breakpoint
CREATE TABLE `entitlements` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `user_id` text NOT NULL, `lesson_id` integer NOT NULL, `can_view` integer DEFAULT false NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action);
--> statement-breakpoint
CREATE UNIQUE INDEX `entitlements_user_lesson_idx` ON `entitlements` (`user_id`,`lesson_id`);
