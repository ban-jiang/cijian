CREATE TABLE `analytics_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`first_day` text NOT NULL,
	`source` text NOT NULL,
	`excluded` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text NOT NULL,
	`day` text NOT NULL,
	`kind` text NOT NULL,
	`received_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_day_kind` ON `analytics_events` (`day`,`kind`);--> statement-breakpoint
CREATE INDEX `analytics_device_day` ON `analytics_events` (`device_id`,`day`);