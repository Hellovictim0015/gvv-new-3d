-- GVV school website database schema (raw MySQL, matches src/lib/db.js / mysql2 usage).
-- Run this once against the database pointed to by MYSQL_HOST/MYSQL_USER/MYSQL_PASSWORD/MYSQL_DATABASE.
-- Table/column names intentionally match the source project's own convention exactly
-- (enquiries/fees use camelCase columns; the content tables below use snake_case).

CREATE TABLE IF NOT EXISTS `enquiries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `studentName` VARCHAR(191) NOT NULL,
  `parentName` VARCHAR(191) NOT NULL,
  `classApplying` VARCHAR(191) NOT NULL,
  `mobileNumber` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `message` VARCHAR(500) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `fees` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `className` VARCHAR(191) NOT NULL,
  `installment1` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `installment2` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `installment3` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `annualAllocation` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `totalFee` DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `achievements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `details` TEXT NOT NULL,
  `image_name` VARCHAR(191) NULL,
  `image_url` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `facilities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `curriculums` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `pdf_url` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `academic_calendars` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `pdf_url` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `book_lists` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `classes` VARCHAR(191) NOT NULL,
  `pdf_url` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `download_forms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `file_size` VARCHAR(50) NOT NULL,
  `pdf_url` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin-uploaded replacements for hardcoded hero images on public pages.
-- `image_key` identifies the slot (e.g. "uniform_hero") — see
-- src/lib/siteImageSlots.ts. A missing row falls back to the page's
-- original built-in image.
CREATE TABLE IF NOT EXISTS `site_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `image_key` VARCHAR(191) NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_images_key_unique` (`image_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Per-page SEO overrides, edited from the admin panel's SEO section.
-- `route` is the site path (e.g. "/", "/about", "/about/introduction").
-- A missing row (or a NULL/empty column) falls back to the page's built-in
-- default title/description — see src/lib/seoPages.ts.
CREATE TABLE IF NOT EXISTS `page_seo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `route` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NULL,
  `meta_description` VARCHAR(500) NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_seo_route_unique` (`route`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Results of external exams (Olympiads, competitive exams), shown on
-- /academic/external-results. Admin can add a row in two ways:
--   entry_type = 'list' → typed result (student_name/class_name/result filled, pdf_url NULL)
--   entry_type = 'pdf'  → uploaded result document (pdf_url filled, student fields NULL)
CREATE TABLE IF NOT EXISTS `external_results` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entry_type` VARCHAR(10) NOT NULL DEFAULT 'list',
  `exam_name` VARCHAR(191) NOT NULL,
  `student_name` VARCHAR(191) NULL,
  `class_name` VARCHAR(50) NULL,
  `result` VARCHAR(191) NULL,
  `session_year` VARCHAR(20) NULL,
  `pdf_url` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Entries for the "Events and Activities" menu pages (/events/<category>).
-- `category` is one of the EVENT_PAGES slugs in src/lib/infoPages.ts:
-- school-events, inter-house, inter-school, clubs, tours.
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category` VARCHAR(50) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `event_date` DATE NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `events_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- School prospectus documents shown on /admission/prospectus. The newest row
-- is featured; older ones are listed below it. cover_image_url is optional.
CREATE TABLE IF NOT EXISTS `prospectus` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `session_year` VARCHAR(20) NULL,
  `description` TEXT NULL,
  `pdf_url` VARCHAR(255) NOT NULL,
  `cover_image_url` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin-added content for the generic info pages (see CONTENT_PAGES in
-- src/lib/infoPages.ts). `page_key` is the page's route, e.g.
-- "/academic/syllabus". Every entry needs a title; description, date,
-- image and PDF are optional. Shown in the order added.
CREATE TABLE IF NOT EXISTS `page_entries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `page_key` VARCHAR(100) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `entry_date` DATE NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `pdf_url` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `page_entries_page_idx` (`page_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- "Uniform In Action" reels on /uniform. Videos are uploaded from the admin
-- panel (Content → Uniform Reels) into uploads/uniform-reels/. Shown in
-- `sort_order`, then oldest first.
CREATE TABLE IF NOT EXISTS `uniform_reels` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `video_url` VARCHAR(255) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Articles / Blogs (admin → Articles / Blogs). Each post is served at /<slug>,
-- the same URL it had on the old WordPress site. src/lib/blogs.ts also creates
-- this table on first use and seeds it with the old site's posts
-- (src/data/blogs.json) when it is empty.
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT NULL,
  `content` MEDIUMTEXT NOT NULL,
  `seo_title` VARCHAR(255) NULL,
  `meta_description` VARCHAR(500) NULL,
  `image_url` VARCHAR(255) NULL,
  `published_date` DATE NOT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_blogs_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
