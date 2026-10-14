CREATE TABLE `event` (
	`id` integer PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`data` text NOT NULL
);
