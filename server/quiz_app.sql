-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 02, 2025 at 07:43 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quiz_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculties`
--

CREATE TABLE `faculties` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculties`
--

INSERT INTO `faculties` (`id`, `name`, `code`, `created_at`, `updated_at`) VALUES
(1, 'ICT', 'FAB002', '2025-08-29 01:04:44', '2025-08-29 01:04:44'),
(3, 'Tourism', 'FAB004', '2025-08-29 01:05:53', '2025-08-29 01:06:20'),
(4, 'Management', 'FAB003', '2025-08-29 01:07:59', '2025-08-29 01:08:19');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_28_054753_create_personal_access_tokens_table', 1),
(5, '2025_08_28_170355_create_subjects_table', 2),
(6, '2025_08_29_061636_create_faculties_table', 3),
(7, '2025_08_29_072429_create_students_table', 4),
(8, '2025_08_30_050434_create_teachers_table', 5),
(9, '2025_08_30_132754_create_quizzes_table', 6),
(10, '2025_08_30_141529_create_questions_table', 7),
(11, '2025_08_30_144114_create_options_table', 8),
(12, '2025_09_02_060004_create_studentquizzes_table', 9);

-- --------------------------------------------------------

--
-- Table structure for table `options`
--

CREATE TABLE `options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `question_id` bigint(20) UNSIGNED NOT NULL,
  `option_text` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `options`
--

INSERT INTO `options` (`id`, `question_id`, `option_text`, `is_correct`, `created_at`, `updated_at`) VALUES
(18, 5, 'Yes', 1, '2025-08-30 17:18:55', '2025-08-30 17:18:55'),
(19, 5, 'No', 0, '2025-08-30 17:18:57', '2025-08-30 17:18:57'),
(28, 8, 'gaya', 1, '2025-09-02 06:39:41', '2025-09-02 06:39:41'),
(29, 8, 'wa', 0, '2025-09-02 06:39:42', '2025-09-02 06:39:42'),
(30, 8, 'ya', 0, '2025-09-02 06:39:43', '2025-09-02 06:39:43'),
(31, 8, 'sd', 0, '2025-09-02 06:39:44', '2025-09-02 06:39:44'),
(32, 9, '34', 1, '2025-09-02 06:39:45', '2025-09-02 06:39:45'),
(33, 9, '35', 0, '2025-09-02 06:39:46', '2025-09-02 06:39:46'),
(34, 9, '36', 0, '2025-09-02 06:39:46', '2025-09-02 06:39:46'),
(35, 9, '32', 0, '2025-09-02 06:39:47', '2025-09-02 06:39:47'),
(36, 10, 'sa', 1, '2025-09-02 07:33:37', '2025-09-02 07:33:37'),
(37, 10, 'd', 0, '2025-09-02 07:33:38', '2025-09-02 07:33:38'),
(38, 10, 'a', 0, '2025-09-02 07:33:39', '2025-09-02 07:33:39'),
(39, 10, 's', 0, '2025-09-02 07:33:40', '2025-09-02 07:33:40'),
(40, 11, 'asd', 1, '2025-09-02 07:33:41', '2025-09-02 07:33:41'),
(41, 11, 's', 0, '2025-09-02 07:33:42', '2025-09-02 07:33:42'),
(42, 11, 'df', 0, '2025-09-02 07:33:42', '2025-09-02 07:33:42'),
(43, 11, 's', 0, '2025-09-02 07:33:43', '2025-09-02 07:33:43'),
(44, 12, 's', 1, '2025-09-02 11:00:21', '2025-09-02 11:00:21'),
(45, 12, 'sd', 0, '2025-09-02 11:00:22', '2025-09-02 11:00:22'),
(46, 12, 'cd', 0, '2025-09-02 11:00:22', '2025-09-02 11:00:22'),
(47, 12, 'fc', 0, '2025-09-02 11:00:23', '2025-09-02 11:00:23'),
(48, 13, 'f', 1, '2025-09-02 11:00:25', '2025-09-02 11:00:25'),
(49, 13, 'cb', 0, '2025-09-02 11:00:25', '2025-09-02 11:00:25'),
(50, 13, 'fv', 0, '2025-09-02 11:00:26', '2025-09-02 11:00:26'),
(51, 13, 'cd', 0, '2025-09-02 11:00:27', '2025-09-02 11:00:27');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(13, 'App\\Models\\User', 1, 'token', '939c8ac371c4abc137de6db8085596cb472ad6df3b92defe2dd982831551847e', '[\"*\"]', NULL, NULL, '2025-08-28 09:16:37', '2025-08-28 09:16:37'),
(14, 'App\\Models\\User', 1, 'token', '0d2e9ab65c3e4c02298881f033dc0152125241c67f4b65318525d99cf0ed5737', '[\"*\"]', NULL, NULL, '2025-08-28 09:17:01', '2025-08-28 09:17:01'),
(15, 'App\\Models\\User', 1, 'token', 'd10573bc3745ee91a80b502a5f9a8695e77251e7b82c8b7cbd8baeb74c6a25d4', '[\"*\"]', NULL, NULL, '2025-08-28 09:18:12', '2025-08-28 09:18:12'),
(16, 'App\\Models\\User', 1, 'token', 'ab6395321403d12a02e00bc9d610317a6cabf94ddbde0632e14748b330f533e1', '[\"*\"]', NULL, NULL, '2025-08-28 10:04:30', '2025-08-28 10:04:30'),
(17, 'App\\Models\\User', 1, 'token', '930980ab7dd350b54e92542d42fcb362686d5eea3b908c764f50dc6af419ccdb', '[\"*\"]', NULL, NULL, '2025-08-28 10:04:40', '2025-08-28 10:04:40'),
(18, 'App\\Models\\User', 1, 'token', 'fed18bef87c17523a85b789f37141504b8b3c841b6303e466484fffcbcd0a00e', '[\"*\"]', NULL, NULL, '2025-08-28 10:04:58', '2025-08-28 10:04:58'),
(19, 'App\\Models\\User', 1, 'token', '55ed8cf82a967fc8ad3f32a142b1bf58f8a252184bed3aee458d237ac9693b00', '[\"*\"]', NULL, NULL, '2025-08-28 10:05:01', '2025-08-28 10:05:01'),
(20, 'App\\Models\\User', 1, 'token', '884a017620d78f7924ccb25cfb2fd99f6b3603039d28796177463f71df7f9d9a', '[\"*\"]', NULL, NULL, '2025-08-28 10:06:36', '2025-08-28 10:06:36'),
(21, 'App\\Models\\User', 1, 'token', '0a4b4f7f16ffc60829c889814201d7fafa09adf7f96aa804bda8f2ceda2ccc4f', '[\"*\"]', NULL, NULL, '2025-08-28 10:06:46', '2025-08-28 10:06:46'),
(22, 'App\\Models\\User', 1, 'token', '7b628493bb81318ecc6fbc6e70bc8573e5f58e56154805c9aea08eb67249e779', '[\"*\"]', NULL, NULL, '2025-08-28 10:08:31', '2025-08-28 10:08:31'),
(23, 'App\\Models\\User', 1, 'token', '06d888ea9c9a97c2eb7e2944827b708460b7cf7764abd503466c4a4b4e95b204', '[\"*\"]', NULL, NULL, '2025-08-28 10:18:44', '2025-08-28 10:18:44'),
(24, 'App\\Models\\User', 1, 'token', 'ad74431ea5edaf8bdb6fa52afcbaae17030c0b076ceb42eee3422e4dfb9476cd', '[\"*\"]', NULL, NULL, '2025-08-28 10:18:51', '2025-08-28 10:18:51'),
(25, 'App\\Models\\User', 1, 'token', 'cfc8101ada16a1c0eb955d645479d4111d4d2d3d62354fa4f281e4697be438fa', '[\"*\"]', NULL, NULL, '2025-08-28 10:21:11', '2025-08-28 10:21:11'),
(26, 'App\\Models\\User', 1, 'token', '4dcb188dc0cb6da7d8784f17c90c12eb612b2256f9b6335a05f411c0a8785a9a', '[\"*\"]', NULL, NULL, '2025-08-28 10:21:38', '2025-08-28 10:21:38'),
(27, 'App\\Models\\User', 1, 'token', '00d8aa2063fc750a5650d1f9caa6973a4ce51372bb29363dd8cc9d1de2586f6f', '[\"*\"]', NULL, NULL, '2025-08-28 10:22:24', '2025-08-28 10:22:24'),
(28, 'App\\Models\\User', 1, 'token', 'dd1de47866f2faabec23d775643a3d41ba1f26fb97221a49f4cf16cee4ffa5c5', '[\"*\"]', NULL, NULL, '2025-08-28 10:23:50', '2025-08-28 10:23:50'),
(29, 'App\\Models\\User', 1, 'token', '5efbce69e95ec7148315e38189036e0220b0c5ad6d553719217cd0813ce9fc3c', '[\"*\"]', NULL, NULL, '2025-08-28 10:24:02', '2025-08-28 10:24:02'),
(30, 'App\\Models\\User', 1, 'token', 'c6a71675cd48add9cc944b5d52ceccb68f4691cd4586680fc6c6161f93fcf703', '[\"*\"]', NULL, NULL, '2025-08-28 10:24:08', '2025-08-28 10:24:08'),
(31, 'App\\Models\\User', 1, 'token', 'f56c61fe61ce5116dbacf17d98d6b42bb27e74e304f7d48c4398770477ebf667', '[\"*\"]', NULL, NULL, '2025-08-28 10:24:15', '2025-08-28 10:24:15'),
(32, 'App\\Models\\User', 1, 'token', 'd115e05eefd30fd6ccc92af9f73655d0813db692d3d250ea433fe98f06fdba75', '[\"*\"]', NULL, NULL, '2025-08-28 10:29:48', '2025-08-28 10:29:48'),
(33, 'App\\Models\\User', 1, 'token', '11ff625444f3973292b5d74ceaf102a411374642584f3ea0859e651feffb9c41', '[\"*\"]', NULL, NULL, '2025-08-28 10:35:42', '2025-08-28 10:35:42'),
(34, 'App\\Models\\User', 1, 'token', 'dac9fa245086ac18ac15710604dfe9d04dc1abfa1ef52accdba204647093e5c8', '[\"*\"]', NULL, NULL, '2025-08-28 10:36:06', '2025-08-28 10:36:06'),
(35, 'App\\Models\\User', 1, 'token', '1ca241d926096261c57aba6c3e7dcb9fac5c84bc8a4c40be54c757bd0a41b0e3', '[\"*\"]', NULL, NULL, '2025-08-28 10:42:09', '2025-08-28 10:42:09'),
(36, 'App\\Models\\User', 1, 'token', 'a1a2212e66f35d96a704ff7e31be1fd8023fe7244f1b2fed559410e670ea83ac', '[\"*\"]', NULL, NULL, '2025-08-28 10:44:59', '2025-08-28 10:44:59'),
(37, 'App\\Models\\User', 1, 'token', '35748c367ea9b6b74bd68d53964eb42a69babfb590db88aec6895ec7c89681f4', '[\"*\"]', NULL, NULL, '2025-08-28 10:46:22', '2025-08-28 10:46:22'),
(38, 'App\\Models\\User', 1, 'token', '75175a5b4c3b1acdc3a390e370e41b0a19720b979ad5b7a22a871dc6af9639dc', '[\"*\"]', NULL, NULL, '2025-08-28 10:46:35', '2025-08-28 10:46:35'),
(39, 'App\\Models\\User', 1, 'token', 'acd918accf08e08ce5a4ac05568167eb89c3ecbb25b1d2ec61c4a8261c9f1b1a', '[\"*\"]', NULL, NULL, '2025-08-28 10:46:40', '2025-08-28 10:46:40'),
(40, 'App\\Models\\User', 1, 'token', 'a2274abe7156875867e04f04394d86f084f3aaa22423ec6a7f5b00583f5596a5', '[\"*\"]', NULL, NULL, '2025-08-28 10:49:54', '2025-08-28 10:49:54'),
(41, 'App\\Models\\User', 1, 'token', 'adba380fd9c67207d4367bbf8d444a4bbb9b8e5f09dd823dd9dd85d6218e4957', '[\"*\"]', NULL, NULL, '2025-08-28 10:51:08', '2025-08-28 10:51:08'),
(42, 'App\\Models\\User', 1, 'token', 'c8d5a7ddb3e9e43081bad5d6a14025255a5eb86161b28eba0757d0e41dd673f8', '[\"*\"]', NULL, NULL, '2025-08-28 10:51:29', '2025-08-28 10:51:29'),
(43, 'App\\Models\\User', 1, 'token', 'f714d4f09935c6cebf28028046e9d28343973941749ce673aee323b78a05c32a', '[\"*\"]', NULL, NULL, '2025-08-28 10:51:36', '2025-08-28 10:51:36'),
(44, 'App\\Models\\User', 1, 'token', '9bc005b3d31a28b9954ba13da015ab53fe8fb9baace6f8a80c26412278b5e083', '[\"*\"]', NULL, NULL, '2025-08-28 11:05:39', '2025-08-28 11:05:39'),
(45, 'App\\Models\\User', 1, 'token', '5424a69ffb066c3c738888f711cec4a53dee8e4604a8943aecbb1932a73eec0c', '[\"*\"]', '2025-08-30 13:19:53', NULL, '2025-08-28 23:13:03', '2025-08-30 13:19:53'),
(46, 'App\\Models\\User', 1, 'token', '436878aea056cefb2fc7066cedc7266a9b2eeff404e54291a150f9302e4c4cc0', '[\"*\"]', NULL, NULL, '2025-08-28 23:50:38', '2025-08-28 23:50:38'),
(47, 'App\\Models\\User', 1, 'token', '18ab13daef93c00ab2a1e7ea80dcdfdc40a1f93b4c245bfe741df87792a36ee0', '[\"*\"]', NULL, NULL, '2025-08-28 23:58:37', '2025-08-28 23:58:37'),
(48, 'App\\Models\\User', 1, 'token', '9e63be46e1645086444be97b447668be3fd9fa752636120cf5b2b7e0dff4f080', '[\"*\"]', NULL, NULL, '2025-08-29 00:24:49', '2025-08-29 00:24:49'),
(49, 'App\\Models\\User', 1, 'token', 'bb79b1bd4e13ad015a01c7ee81a1421d7621dfa98363bcdba1108308664420b3', '[\"*\"]', NULL, NULL, '2025-08-29 00:25:24', '2025-08-29 00:25:24'),
(50, 'App\\Models\\User', 1, 'token', '09fd1caa8ab5a5e768304b2ed3f4f9d31889e811bdba41f7397393c2796cb90a', '[\"*\"]', '2025-08-29 01:11:01', NULL, '2025-08-29 00:26:39', '2025-08-29 01:11:01'),
(51, 'App\\Models\\User', 1, 'token', '348c9df82b56fd070dc93cbbf994e67008c408f06d3a6dab6c6ff9874828dbf5', '[\"*\"]', NULL, NULL, '2025-08-29 01:22:13', '2025-08-29 01:22:13'),
(52, 'App\\Models\\User', 1, 'token', 'faf695a96c00c3842bf3f596def9a812665b40dfd8551cfa462914416cc9d6f7', '[\"*\"]', NULL, NULL, '2025-08-29 01:23:27', '2025-08-29 01:23:27'),
(53, 'App\\Models\\User', 1, 'token', '6afaa925f1bda27ea0ba433cb7ec651247adf0039b9bacd744ca99064c4838d7', '[\"*\"]', NULL, NULL, '2025-08-29 01:27:52', '2025-08-29 01:27:52'),
(54, 'App\\Models\\User', 1, 'token', '94131a499083a4a97def39f04a0271ef7a0fac98646ea05740c0dcd987c7f2ca', '[\"*\"]', NULL, NULL, '2025-08-29 01:28:36', '2025-08-29 01:28:36'),
(55, 'App\\Models\\User', 1, 'token', '641b3c4d06e55b1262261562fad529cda73643307609b45e3f3499c71903c4df', '[\"*\"]', NULL, NULL, '2025-08-29 01:34:17', '2025-08-29 01:34:17'),
(56, 'App\\Models\\User', 1, 'token', '88bdb3b9574beb30afb86935e26013aa2242226a90a72adf46f770501a9e0ea3', '[\"*\"]', '2025-08-29 01:36:59', NULL, '2025-08-29 01:35:01', '2025-08-29 01:36:59'),
(57, 'App\\Models\\User', 1, 'token', '7b7cbcf4def4032ecb3f388bddfad9779495ff100a855475e818d01dd8e4b391', '[\"*\"]', NULL, NULL, '2025-08-29 01:38:03', '2025-08-29 01:38:03'),
(58, 'App\\Models\\User', 1, 'token', 'fe99171240bc016b6ad849e072a1996c7ad7c6bba212ea31e2afc56d031728c5', '[\"*\"]', '2025-08-29 01:44:43', NULL, '2025-08-29 01:44:34', '2025-08-29 01:44:43'),
(59, 'App\\Models\\User', 1, 'token', '5f8d0990302d38661b45288786ed5013f71703b3f21fa22b6c3fbcc375ef552c', '[\"*\"]', '2025-08-29 01:45:00', NULL, '2025-08-29 01:44:49', '2025-08-29 01:45:00'),
(60, 'App\\Models\\User', 1, 'token', '82bfa43886740024ab4cdef063902996f25b4ffbecbdcc2c826ce333fb3445f7', '[\"*\"]', '2025-08-29 01:45:21', NULL, '2025-08-29 01:45:10', '2025-08-29 01:45:21'),
(61, 'App\\Models\\User', 1, 'token', 'a079a54e2a8661bca62617535237fcb43b8d9af4eab25e3c6b4b0918c52a76c6', '[\"*\"]', NULL, NULL, '2025-08-29 01:47:53', '2025-08-29 01:47:53'),
(62, 'App\\Models\\User', 1, 'token', 'f864b10abb9221554da815099ba5a0ef2cee35daf94315985cfcb6cac339e8f1', '[\"*\"]', '2025-08-29 02:30:12', NULL, '2025-08-29 01:48:10', '2025-08-29 02:30:12'),
(63, 'App\\Models\\User', 1, 'token', 'c7139785d7c7ef116be6916bab5c199b7551ad85b6a00aa07e2b34d82d41cd64', '[\"*\"]', '2025-08-29 22:54:18', NULL, '2025-08-29 22:51:24', '2025-08-29 22:54:18'),
(64, 'App\\Models\\User', 1, 'token', '6f7d2ed6c50ab538bc6814dd191ebec852a51c03e00b3934c6636b804c96160f', '[\"*\"]', '2025-08-30 00:17:42', NULL, '2025-08-29 22:54:27', '2025-08-30 00:17:42'),
(65, 'App\\Models\\User', 1, 'token', 'fab0a06839f1a1b4f4ea8705c7268c7f65bbe8ce01c99b94d90bb3c4e18c4958', '[\"*\"]', '2025-08-30 01:38:17', NULL, '2025-08-30 01:05:39', '2025-08-30 01:38:17'),
(68, 'App\\Models\\User', 1, 'token', 'a0ca5aeef95b47e4aea0b9f4dc4569c049e95b3e1d96bda307a40e33afb80532', '[\"*\"]', NULL, NULL, '2025-08-30 01:57:15', '2025-08-30 01:57:15'),
(69, 'App\\Models\\Teacher', 2, 'token', '0b65fe677c87c54077356e21f6fa7c13078bfb5370b50ffcbb09cbd3fa93d33f', '[\"*\"]', NULL, NULL, '2025-08-30 02:02:07', '2025-08-30 02:02:07'),
(70, 'App\\Models\\Teacher', 2, 'token', '4d8b356f1567a3526e1297017a1b6cf1fa5687ec0b6190a9c9fc8960672d7f64', '[\"*\"]', NULL, NULL, '2025-08-30 02:15:19', '2025-08-30 02:15:19'),
(71, 'App\\Models\\Teacher', 2, 'token', 'ec0ef39745578878513d954b8c287c841bdfafc8abd5f10627fa5587b49e12eb', '[\"*\"]', NULL, NULL, '2025-08-30 02:15:44', '2025-08-30 02:15:44'),
(72, 'App\\Models\\Teacher', 2, 'token', 'd255b25b35224231695e390a0a1eed608e9519199cda004b30335279a7605541', '[\"*\"]', NULL, NULL, '2025-08-30 02:25:43', '2025-08-30 02:25:43'),
(73, 'App\\Models\\User', 1, 'token', 'eb1f14392647dde6d343e9a9c29873037bcd5975b3504a7ee29c7ae456727cfb', '[\"*\"]', NULL, NULL, '2025-08-30 02:25:55', '2025-08-30 02:25:55'),
(74, 'App\\Models\\Teacher', 2, 'token', 'b5f2fde876b0a7156c16f246fab4dd59a3cd16a830a27d7df9e088230e3bc412', '[\"*\"]', NULL, NULL, '2025-08-30 02:27:26', '2025-08-30 02:27:26'),
(75, 'App\\Models\\Teacher', 2, 'token', 'fdd081622e5bffd4624d25bdc5612fb3ce6fc7aed7531a1926b2d1d0a1c1f95a', '[\"*\"]', NULL, NULL, '2025-08-30 02:27:36', '2025-08-30 02:27:36'),
(76, 'App\\Models\\Teacher', 2, 'token', '2eff4b607d972f1726a93a5df7737026be6dec21007359f0c286db9aeb3f0a5f', '[\"*\"]', NULL, NULL, '2025-08-30 02:32:23', '2025-08-30 02:32:23'),
(77, 'App\\Models\\Teacher', 2, 'token', 'e363d77dc876394f5249c3568c5281c8d5f1d4c574549bed9c222dd86a5c9a1c', '[\"*\"]', '2025-08-30 10:13:07', NULL, '2025-08-30 08:36:24', '2025-08-30 10:13:07'),
(78, 'App\\Models\\Teacher', 2, 'token', '3bb2518c10be5f0ac4905f7be1515573d3ee91739ce4b85da46b55f626984d6c', '[\"*\"]', '2025-08-30 12:07:46', NULL, '2025-08-30 10:38:26', '2025-08-30 12:07:46'),
(79, 'App\\Models\\Teacher', 2, 'token', '891b21863d853b4c2d2eb53d939bc7c62125d52a301eee57cfa846d2300caedc', '[\"*\"]', NULL, NULL, '2025-08-30 13:01:38', '2025-08-30 13:01:38'),
(80, 'App\\Models\\Teacher', 2, 'token', 'dee49acd1de69e51cc358bcbd81f03f089845cd88918c7d80fc6a23b63c4fa32', '[\"*\"]', '2025-08-30 13:02:03', NULL, '2025-08-30 13:01:58', '2025-08-30 13:02:03'),
(81, 'App\\Models\\Teacher', 2, 'token', 'a261fc3d52a87bd9e840a3306ab629c0c0c6932085f959cbbb912ae3c7254fa6', '[\"*\"]', '2025-08-30 16:08:00', NULL, '2025-08-30 13:20:46', '2025-08-30 16:08:00'),
(82, 'App\\Models\\Teacher', 2, 'token', '4f3d2d7c3c447d2ec4e5b19346df2e3e3b20ffcb2ce4101bf1b6abfcfe242c6e', '[\"*\"]', '2025-08-31 21:53:52', NULL, '2025-08-30 13:28:29', '2025-08-31 21:53:52'),
(83, 'App\\Models\\Teacher', 2, 'token', '0ceb10314189f08734bdae5061c395072ff7a25bf858602a32ae6caa647a83f4', '[\"*\"]', '2025-09-02 00:23:16', NULL, '2025-08-30 16:11:17', '2025-09-02 00:23:16'),
(84, 'App\\Models\\Teacher', 2, 'token', '9faad26878fd0115b1a6f19f33a7f0ce2f59456f3c96fb3cf21dfbabd86349db', '[\"*\"]', '2025-09-01 01:45:15', NULL, '2025-08-31 21:53:57', '2025-09-01 01:45:15'),
(85, 'App\\Models\\Teacher', 2, 'token', '14a889f18bb07f45f290af5f743093436c113710bcdc495b872316de2bc37498', '[\"*\"]', '2025-09-01 01:54:32', NULL, '2025-09-01 01:52:41', '2025-09-01 01:54:32'),
(86, 'App\\Models\\Teacher', 2, 'token', '48684aa37f7f2e646806ead520836aace56380af43b995b315219ea1023004fe', '[\"*\"]', '2025-09-01 02:02:16', NULL, '2025-09-01 01:55:59', '2025-09-01 02:02:16'),
(87, 'App\\Models\\Teacher', 2, 'token', 'b01c3dafc97417550e06b90ec4179eca7ffbf4587f82dc2f2b1f600ff71689dd', '[\"*\"]', NULL, NULL, '2025-09-01 02:04:53', '2025-09-01 02:04:53'),
(88, 'App\\Models\\Teacher', 2, 'token', 'aeab644646561dcb85f726c957224c2a39a1559c66b2451ce3314465bb599804', '[\"*\"]', '2025-09-01 02:08:08', NULL, '2025-09-01 02:05:00', '2025-09-01 02:08:08'),
(89, 'App\\Models\\Teacher', 2, 'token', '7e7f7c6d6e926cb5e83a6f81656c6a32d69863c23d9f22db3726a9ffe115bd69', '[\"*\"]', '2025-09-01 02:09:43', NULL, '2025-09-01 02:08:32', '2025-09-01 02:09:43'),
(90, 'App\\Models\\Teacher', 2, 'token', '38ef30fc565cd6ee0d17db523b42360efce645e28111d54a18fa8fdfd8f07718', '[\"*\"]', '2025-09-01 02:11:42', NULL, '2025-09-01 02:11:37', '2025-09-01 02:11:42'),
(91, 'App\\Models\\Teacher', 2, 'token', '1d76c10f48c2420facdaf9ecdf403a4506d03c48f32699a0157dbe53d08f6ed9', '[\"*\"]', '2025-09-01 02:12:39', NULL, '2025-09-01 02:12:29', '2025-09-01 02:12:39'),
(92, 'App\\Models\\Teacher', 2, 'token', 'f127c4b034315fa86c917cb91fc1160a9c49c447d95d5ab6e7462e7e78e6b4f8', '[\"*\"]', '2025-09-01 02:17:14', NULL, '2025-09-01 02:17:09', '2025-09-01 02:17:14'),
(93, 'App\\Models\\Teacher', 2, 'token', 'e1c1d355542730d9537bfbb7ab7e547becfc7421f2f8da074c9a3855dbba5453', '[\"*\"]', '2025-09-01 02:27:59', NULL, '2025-09-01 02:22:16', '2025-09-01 02:27:59'),
(94, 'App\\Models\\Teacher', 2, 'token', '6929505745beee2e5c97fd71aa12663154f6aaaa0a53b57b3f9319aafcfe9abe', '[\"*\"]', '2025-09-01 02:28:11', NULL, '2025-09-01 02:28:06', '2025-09-01 02:28:11'),
(95, 'App\\Models\\Teacher', 2, 'token', 'a2f5b83391b29f4a9f830e9c910f848207afe397d72307dfb9dae5f787f0aaf8', '[\"*\"]', '2025-09-01 02:29:35', NULL, '2025-09-01 02:29:11', '2025-09-01 02:29:35'),
(96, 'App\\Models\\Teacher', 2, 'token', '45da7eaf83f696507a4a66adf815f60006f712f4e4a418cbc133e60db1d4f7b1', '[\"*\"]', '2025-09-01 02:37:29', NULL, '2025-09-01 02:29:41', '2025-09-01 02:37:29'),
(97, 'App\\Models\\Teacher', 2, 'token', '2eb3a35672457029c03b06a4d5d49ffb2923bd3ac3f93da72e6afe8902903443', '[\"*\"]', '2025-09-01 08:29:07', NULL, '2025-09-01 02:37:35', '2025-09-01 08:29:07'),
(98, 'App\\Models\\Teacher', 2, 'token', '13186d70811c90f651461cc3bdc93292b45a4236bfb7a86ea34cb04323ffa1ff', '[\"*\"]', '2025-09-01 08:57:03', NULL, '2025-09-01 08:47:02', '2025-09-01 08:57:03'),
(99, 'App\\Models\\Teacher', 2, 'token', '91d886191fb8c929d902c75f8ea465a46accc8b6e918fcf575f1a7d78bdcbe1a', '[\"*\"]', '2025-09-01 09:09:16', NULL, '2025-09-01 08:57:32', '2025-09-01 09:09:16'),
(100, 'App\\Models\\Teacher', 2, 'token', '3e37a62deb547893b73a9e5bf45caedb86c36489c7f0c4ab9c0845458ed6e625', '[\"*\"]', '2025-09-01 09:10:09', NULL, '2025-09-01 09:10:04', '2025-09-01 09:10:09'),
(101, 'App\\Models\\Teacher', 2, 'token', '5b76833b969b36053e60ae86598f6dfbc0f20ca6b4100a301d5b0e03e1bd8c6a', '[\"*\"]', '2025-09-01 09:23:54', NULL, '2025-09-01 09:10:50', '2025-09-01 09:23:54'),
(102, 'App\\Models\\Teacher', 2, 'token', '9dfe51143ee49278cd3b392e25ad915880ea29100a417b734033bff22774189b', '[\"*\"]', '2025-09-01 09:26:35', NULL, '2025-09-01 09:25:19', '2025-09-01 09:26:35'),
(103, 'App\\Models\\Teacher', 2, 'token', 'f805f59658997755468b8b9f1f95ada52c2ce27ee07e58e931f1d7496c0504f0', '[\"*\"]', '2025-09-01 09:32:49', NULL, '2025-09-01 09:27:10', '2025-09-01 09:32:49'),
(104, 'App\\Models\\Teacher', 2, 'token', '6a699692e4259fb1fbaa35341726b8e41bae148aad2752b2d9aa10bb6c6db8b8', '[\"*\"]', '2025-09-01 10:02:37', NULL, '2025-09-01 09:33:56', '2025-09-01 10:02:37'),
(105, 'App\\Models\\Teacher', 2, 'token', '2df9d965ae7348d36f21539d860e049016efbd7fe866f1b86abc013cc5a04aaf', '[\"*\"]', '2025-09-01 10:45:14', NULL, '2025-09-01 10:02:45', '2025-09-01 10:45:14'),
(106, 'App\\Models\\Teacher', 2, 'token', 'b5a5438921b79e602fb83fe09c05903dbc0e050b1f6fd9114d430edbb54d4a30', '[\"*\"]', '2025-09-01 22:31:16', NULL, '2025-09-01 10:45:13', '2025-09-01 22:31:16'),
(107, 'App\\Models\\User', 1, 'token', '5c462f01c891df7c20e788fe6bfb42506bcedaec61c66e8aecba10d2e94ec087', '[\"*\"]', '2025-09-01 22:31:34', NULL, '2025-09-01 22:31:33', '2025-09-01 22:31:34'),
(108, 'App\\Models\\User', 1, 'token', '6cb2a06f2f44a2459cadbad51c1ff8b1d70a2d652f29cb5895caf7f087dc6703', '[\"*\"]', '2025-09-01 22:31:41', NULL, '2025-09-01 22:31:40', '2025-09-01 22:31:41'),
(109, 'App\\Models\\User', 1, 'token', '520b2e752546271b29663f4402438e48d7ce83651cba9316ead54ee0b7a2c1df', '[\"*\"]', '2025-09-01 22:32:06', NULL, '2025-09-01 22:32:06', '2025-09-01 22:32:06'),
(110, 'App\\Models\\User', 1, 'token', 'e3353ee70f5e1d595c8e059560a8173451a571619f3f7f8c0a7a2834852987c5', '[\"*\"]', '2025-09-01 22:33:18', NULL, '2025-09-01 22:33:17', '2025-09-01 22:33:18'),
(111, 'App\\Models\\Teacher', 2, 'token', '819d9bc0a9b0f839564ad094b8fac92fe46a685a22a691d61978ae2e54b6822f', '[\"*\"]', '2025-09-01 22:33:37', NULL, '2025-09-01 22:33:28', '2025-09-01 22:33:37'),
(112, 'App\\Models\\User', 1, 'token', 'd2d22252d7e456bdf1462d28a1a47b18b25221cf9a2362bf8b7a0c817da0937f', '[\"*\"]', '2025-09-01 22:33:45', NULL, '2025-09-01 22:33:45', '2025-09-01 22:33:45'),
(113, 'App\\Models\\Teacher', 2, 'token', 'ce1665a2cf4d82ecdf128a9418e99e8440a27ae13f563c9fa827bccf44e6a121', '[\"*\"]', '2025-09-01 22:57:52', NULL, '2025-09-01 22:57:33', '2025-09-01 22:57:52'),
(114, 'App\\Models\\User', 1, 'token', '3d32b24b4223e704e25c8882f1d4d0941d0269e4bbb422baa0624be444cb167f', '[\"*\"]', '2025-09-01 23:03:14', NULL, '2025-09-01 23:03:13', '2025-09-01 23:03:14'),
(115, 'App\\Models\\User', 1, 'token', 'e55f0e8bfa3df45146b378be74772db0254dda53e7d451196f2aed9594f545ba', '[\"*\"]', '2025-09-01 23:04:30', NULL, '2025-09-01 23:04:29', '2025-09-01 23:04:30'),
(116, 'App\\Models\\Teacher', 2, 'token', '8380c8df6b4a675484dfecce26e26c475317dc7f7f8390fb7bd1e6a9dd84cd09', '[\"*\"]', '2025-09-01 23:05:16', NULL, '2025-09-01 23:04:40', '2025-09-01 23:05:16'),
(117, 'App\\Models\\User', 1, 'token', '52fd61fe3455637fbe5b26a4e62670fa89e6a1001393e1d8678101f35605575c', '[\"*\"]', '2025-09-01 23:05:22', NULL, '2025-09-01 23:05:21', '2025-09-01 23:05:22'),
(118, 'App\\Models\\User', 1, 'token', '6e8f46f927f693c357cc2b4a22f694af6b46644a7a3dd626cddcf217b7e6959f', '[\"*\"]', '2025-09-01 23:06:37', NULL, '2025-09-01 23:06:36', '2025-09-01 23:06:37'),
(119, 'App\\Models\\User', 1, 'token', '7f6ed8538efdbcd8eebf56160335da8a88cca0f960a8d278680f286a1885a8f4', '[\"*\"]', '2025-09-01 23:06:44', NULL, '2025-09-01 23:06:43', '2025-09-01 23:06:44'),
(120, 'App\\Models\\User', 1, 'token', 'efd5ac1e94140bd916da042c9f53a07aeb69a806aaf17a0ecec305c21ba7f7a9', '[\"*\"]', '2025-09-01 23:13:40', NULL, '2025-09-01 23:13:39', '2025-09-01 23:13:40'),
(121, 'App\\Models\\Teacher', 2, 'token', '6e4ffdd8b83e4b47b3596bc1d96091d970218221c9853d049ef5570e95cda909', '[\"*\"]', '2025-09-01 23:13:59', NULL, '2025-09-01 23:13:51', '2025-09-01 23:13:59'),
(122, 'App\\Models\\Teacher', 2, 'token', '00f43277aed7603f9a0a867011ec2c1ce3886c693b6d9a452e3046c12164a1a7', '[\"*\"]', '2025-09-01 23:14:06', NULL, '2025-09-01 23:14:00', '2025-09-01 23:14:06'),
(123, 'App\\Models\\Teacher', 2, 'token', '7fab1b96a92b0bc784cbbaf827fc4b68377050991a7a2569063cfa59e57a8466', '[\"*\"]', '2025-09-01 23:15:25', NULL, '2025-09-01 23:15:14', '2025-09-01 23:15:25'),
(124, 'App\\Models\\User', 1, 'token', '0eaa687f5fefa3f9700f783f87a225c716361c875f68dcd38ed887566a6990b6', '[\"*\"]', '2025-09-01 23:15:28', NULL, '2025-09-01 23:15:27', '2025-09-01 23:15:28'),
(125, 'App\\Models\\User', 1, 'token', '45cf7bb0ac6ab435c8ccac3a6176dd01be981bb99d4fade1d1a1705604f77033', '[\"*\"]', '2025-09-01 23:17:02', NULL, '2025-09-01 23:16:35', '2025-09-01 23:17:02'),
(126, 'App\\Models\\Student', 1, 'token', 'f978f0660beb0832282f40f3954028d29675df47c5ca9b412ce942b29bdc2e9e', '[\"*\"]', '2025-09-01 23:17:20', NULL, '2025-09-01 23:17:20', '2025-09-01 23:17:20'),
(127, 'App\\Models\\Student', 1, 'token', '9fe6d151f4262d9eaed55e36bf5d97d91603f9ab60ed1281ca611632ad814ee8', '[\"*\"]', '2025-09-01 23:18:51', NULL, '2025-09-01 23:18:50', '2025-09-01 23:18:51'),
(128, 'App\\Models\\Student', 1, 'token', '6fd0f65c1a3d9dccb4acb53c287400c93d3872e1278f6f6d9c61599d8e5e1f23', '[\"*\"]', '2025-09-01 23:19:03', NULL, '2025-09-01 23:19:02', '2025-09-01 23:19:03'),
(129, 'App\\Models\\Student', 1, 'token', '9229da4cc7be0eda9bfbe4024b951db302dd30214c107ebd55d776e5dbe8466b', '[\"*\"]', '2025-09-01 23:20:18', NULL, '2025-09-01 23:20:17', '2025-09-01 23:20:18'),
(130, 'App\\Models\\Student', 1, 'token', '1ff35e813cdac8ce8cfc4769fff16d0b6554950deef6e09c90688b3e86ff7250', '[\"*\"]', '2025-09-01 23:20:23', NULL, '2025-09-01 23:20:22', '2025-09-01 23:20:23'),
(131, 'App\\Models\\Student', 1, 'token', '158fed6649020961e6fc99ca5cd4e5c52eab1b667f50fae3592537b1e7ebaa6a', '[\"*\"]', '2025-09-01 23:21:48', NULL, '2025-09-01 23:21:47', '2025-09-01 23:21:48'),
(132, 'App\\Models\\Student', 1, 'token', '36cf89087aa0a2e05a56557eb1a7f42e80e0a6c9cba8df90266415920d36763a', '[\"*\"]', '2025-09-01 23:22:52', NULL, '2025-09-01 23:22:50', '2025-09-01 23:22:52'),
(133, 'App\\Models\\Student', 1, 'token', '1b55bb4ef2093dd6df0913a61b38c812a926169a4c34d2da18ab3d16eef1ca13', '[\"*\"]', '2025-09-01 23:23:01', NULL, '2025-09-01 23:23:00', '2025-09-01 23:23:01'),
(134, 'App\\Models\\User', 1, 'token', '320594c5f83324fc5ad81ddae36a8cd597021a089a69e2185c1e6c5965eba0ae', '[\"*\"]', '2025-09-01 23:41:13', NULL, '2025-09-01 23:41:11', '2025-09-01 23:41:13'),
(135, 'App\\Models\\Teacher', 2, 'token', '9478ad4f7763a3e059cd1cac246dcd6561dace1b57431ad91bfbaff26c6ceef1', '[\"*\"]', '2025-09-01 23:41:34', NULL, '2025-09-01 23:41:20', '2025-09-01 23:41:34'),
(136, 'App\\Models\\Student', 1, 'token', 'ef2cc1703fb670d3e2fbdc7e04bc4ee8bedcbb823d4c8541f59e7e6b15c9e3d5', '[\"*\"]', '2025-09-01 23:41:44', NULL, '2025-09-01 23:41:43', '2025-09-01 23:41:44'),
(137, 'App\\Models\\Teacher', 2, 'token', 'ce5e2eac3ea23939afd4f8bccdbaef84a83bfcf48fae7b9c351fe4f454101d5c', '[\"*\"]', '2025-09-02 00:19:54', NULL, '2025-09-02 00:19:37', '2025-09-02 00:19:54'),
(138, 'App\\Models\\Student', 1, 'token', 'c0c9f5c183a8285acf4b2ffafaf70195774541a1c850ce96824ea1cbb335db2e', '[\"*\"]', '2025-09-02 01:59:25', NULL, '2025-09-02 01:59:23', '2025-09-02 01:59:25'),
(139, 'App\\Models\\Student', 1, 'token', 'ceb0b271066b1606accb7d451c15b3ecf950c5072f8c03bac0ca0ba00914a102', '[\"*\"]', '2025-09-02 02:02:02', NULL, '2025-09-02 02:00:27', '2025-09-02 02:02:02'),
(140, 'App\\Models\\Student', 1, 'token', 'dfee14a161ddeab846fe1089da384aeafc12012f4981301b548607062bac500f', '[\"*\"]', '2025-09-02 02:03:04', NULL, '2025-09-02 02:02:09', '2025-09-02 02:03:04'),
(141, 'App\\Models\\Student', 1, 'token', '1a3d890c272976c0a9a61dd39db622c72acca2694aca9452dcb720176f432912', '[\"*\"]', '2025-09-02 02:04:22', NULL, '2025-09-02 02:03:06', '2025-09-02 02:04:22'),
(142, 'App\\Models\\Student', 1, 'token', '083d9504761f4eb2e491e49fcfd1a1b4f7d3585c2abe7ea9ca5ca700e9a5e3a2', '[\"*\"]', '2025-09-02 02:05:02', NULL, '2025-09-02 02:04:41', '2025-09-02 02:05:02'),
(143, 'App\\Models\\Student', 1, 'token', '07084bd8efc6028df72b8d516b6745145966e7c31201cf6f1af982cdde307849', '[\"*\"]', '2025-09-02 02:17:16', NULL, '2025-09-02 02:05:07', '2025-09-02 02:17:16'),
(144, 'App\\Models\\Student', 1, 'token', 'd2696710ffa87ea333fb77e68b18b4e3b804da94a6457b037b8ea79f36ac8f0b', '[\"*\"]', '2025-09-02 02:25:58', NULL, '2025-09-02 02:17:15', '2025-09-02 02:25:58'),
(145, 'App\\Models\\Student', 1, 'token', '4743615526883946d616b2e1c0d3b6f23bc53a5a5f17819b447f2642959aad93', '[\"*\"]', '2025-09-02 02:26:05', NULL, '2025-09-02 02:22:31', '2025-09-02 02:26:05'),
(146, 'App\\Models\\Student', 1, 'token', '901fdb67e1e0c378e9a48a289abc1b9ba745eb94029bf98f05725daca6f20e80', '[\"*\"]', '2025-09-02 03:30:37', NULL, '2025-09-02 02:22:48', '2025-09-02 03:30:37'),
(147, 'App\\Models\\Student', 1, 'token', '198c0c10450951b16b2d6591982c26710d35034906ca7ae1f39ef9e16147ca2b', '[\"*\"]', '2025-09-02 02:26:00', NULL, '2025-09-02 02:24:42', '2025-09-02 02:26:00'),
(148, 'App\\Models\\Student', 1, 'token', 'c202c1e3b195c15339649adafaaebb5a598c3c41d653a18613fde49828561027', '[\"*\"]', '2025-09-02 03:30:34', NULL, '2025-09-02 03:24:47', '2025-09-02 03:30:34'),
(149, 'App\\Models\\Teacher', 2, 'token', 'cfae66c85abe17fe8efbb3411de0fe052f41e6c23a127b04b25277c84603ac46', '[\"*\"]', '2025-09-02 03:30:41', NULL, '2025-09-02 03:25:30', '2025-09-02 03:30:41'),
(150, 'App\\Models\\Teacher', 2, 'token', '73bde19d3fb60e6abb7776e3c221de3ce52c497c7a6f734e0b8e15f7d33f45cd', '[\"*\"]', '2025-09-02 03:43:11', NULL, '2025-09-02 03:43:03', '2025-09-02 03:43:11'),
(151, 'App\\Models\\Teacher', 2, 'token', '26bad6b775ae04f463516d0929bd28890f568551f39dd48c59ba2447d3d3fcd0', '[\"*\"]', '2025-09-02 04:10:24', NULL, '2025-09-02 03:50:35', '2025-09-02 04:10:24'),
(152, 'App\\Models\\User', 1, 'token', '5e20884ca14d7043d32b26e11b71f82fa25125f95b8d848f9aa5d0a0007cd378', '[\"*\"]', '2025-09-02 04:11:27', NULL, '2025-09-02 03:50:44', '2025-09-02 04:11:27'),
(153, 'App\\Models\\User', 1, 'token', '99656d74a7721fd269be3800c3afcda124f2de2bb79a6e567c5fb7eded428624', '[\"*\"]', '2025-09-02 04:10:20', NULL, '2025-09-02 03:50:56', '2025-09-02 04:10:20'),
(154, 'App\\Models\\Teacher', 2, 'token', '223460f06cea4cd1cd9cbf5b0559007f9a54abfc8bc7a7ee6d307e204e58263e', '[\"*\"]', '2025-09-02 04:10:26', NULL, '2025-09-02 03:58:30', '2025-09-02 04:10:26'),
(155, 'App\\Models\\Teacher', 2, 'token', 'a9bb00ad6993e40e43da109e317b1dd72c162858b6e06415a3a178b8b7a7b87b', '[\"*\"]', '2025-09-02 04:16:11', NULL, '2025-09-02 04:12:43', '2025-09-02 04:16:11'),
(156, 'App\\Models\\Teacher', 2, 'token', 'e436fcfa1ed32811cb217a9b8f4c72a30b10509b2a9b666e132466aa6ecc790f', '[\"*\"]', '2025-09-02 04:21:03', NULL, '2025-09-02 04:16:24', '2025-09-02 04:21:03'),
(157, 'App\\Models\\Teacher', 2, 'token', '543650bf39a477b37ccb7a0fc9b60bab16958f0ea346376dca03f344d247e686', '[\"*\"]', '2025-09-02 04:21:22', NULL, '2025-09-02 04:21:08', '2025-09-02 04:21:22'),
(158, 'App\\Models\\Teacher', 2, 'token', '4cfbce88fc98224a0eb9ddfcdf16495e5d59d45e291e772874975551174ab949', '[\"*\"]', '2025-09-02 04:24:59', NULL, '2025-09-02 04:22:26', '2025-09-02 04:24:59'),
(159, 'App\\Models\\Student', 1, 'token', 'c2c18cd00c84c480ca5ca6d22739d1e7346afe97f753ed3c6828dd3cea554a01', '[\"*\"]', '2025-09-02 04:25:56', NULL, '2025-09-02 04:25:42', '2025-09-02 04:25:56'),
(160, 'App\\Models\\Teacher', 2, 'token', 'd171ea2735d1b0ad17f1a1c245e0e4c26f0a2840b230fe1b6e90f2efffb291de', '[\"*\"]', '2025-09-02 04:27:15', NULL, '2025-09-02 04:26:42', '2025-09-02 04:27:15'),
(161, 'App\\Models\\Teacher', 2, 'token', 'a3ff742d53d29d737875d40ca14abb7267b863a9b490a115f181277e96af48c5', '[\"*\"]', '2025-09-02 04:27:43', NULL, '2025-09-02 04:27:21', '2025-09-02 04:27:43'),
(162, 'App\\Models\\Teacher', 2, 'token', '3e178b59ee6697f3ce211e4e6355c2b1f2dd47ceae59c985b3c705e0fc8e8006', '[\"*\"]', '2025-09-02 04:27:59', NULL, '2025-09-02 04:27:55', '2025-09-02 04:27:59'),
(163, 'App\\Models\\Teacher', 2, 'token', '01eecc807bb6e42f53b860581608f5b61e80eecfe064362863eb1a0aa9b17b50', '[\"*\"]', '2025-09-02 04:38:19', NULL, '2025-09-02 04:38:14', '2025-09-02 04:38:19'),
(164, 'App\\Models\\Student', 1, 'token', 'ef0233d572b18e8f2299b4b3804f48bf927fc4273f4cf2e98512d99a98c0b53c', '[\"*\"]', '2025-09-02 04:42:32', NULL, '2025-09-02 04:38:40', '2025-09-02 04:42:32'),
(165, 'App\\Models\\Student', 1, 'token', '79c990ce21c0371790a08005f3229f6b9e0ffdfbab4f5203d5447aaf1cc5e9b2', '[\"*\"]', '2025-09-02 04:46:53', NULL, '2025-09-02 04:46:08', '2025-09-02 04:46:53'),
(166, 'App\\Models\\Teacher', 2, 'token', '28e35924ef235b9ae1262c6c835218c2a4c1daca5da7cfea7d87352c6983671b', '[\"*\"]', '2025-09-02 04:52:03', NULL, '2025-09-02 04:49:08', '2025-09-02 04:52:03'),
(167, 'App\\Models\\Teacher', 2, 'token', 'a6eddac7950c508bf9e3960000b4c4c7fe7940c7fcfc1032995347e38e057216', '[\"*\"]', '2025-09-02 05:08:11', NULL, '2025-09-02 05:07:59', '2025-09-02 05:08:11'),
(168, 'App\\Models\\Student', 1, 'token', '537012696011c262574088d9587ccab8565c7b6ed748b058d612d761f4dd6bc5', '[\"*\"]', '2025-09-02 05:14:51', NULL, '2025-09-02 05:14:50', '2025-09-02 05:14:51'),
(169, 'App\\Models\\Teacher', 2, 'token', 'c5d19b96706e2c5f62992ecda0a481ffa1c15838c446ec91dd82ab9e02408437', '[\"*\"]', '2025-09-02 06:15:03', NULL, '2025-09-02 05:55:48', '2025-09-02 06:15:03'),
(170, 'App\\Models\\Teacher', 2, 'token', '9f1f57b3330f9edb2311d776616fc5b56e75940ec9b97d47b14af10984776a52', '[\"*\"]', '2025-09-02 06:21:05', NULL, '2025-09-02 06:15:31', '2025-09-02 06:21:05'),
(171, 'App\\Models\\Teacher', 2, 'token', 'b9c45cd45ca6bd010e70c59655faf5f639f6aa6e235b928bd71cd89c7064bced', '[\"*\"]', '2025-09-02 06:39:57', NULL, '2025-09-02 06:28:11', '2025-09-02 06:39:57'),
(172, 'App\\Models\\Student', 1, 'token', '5bb0815e38f929e75c493a50828a401cdf801864101e37526450f52613b54d2e', '[\"*\"]', '2025-09-02 06:40:23', NULL, '2025-09-02 06:40:14', '2025-09-02 06:40:23'),
(173, 'App\\Models\\Student', 1, 'token', '70202cbe817f580f32435247bb2bf904d6ae949138acce6bb873e2d13f440427', '[\"*\"]', '2025-09-02 06:52:15', NULL, '2025-09-02 06:40:33', '2025-09-02 06:52:15'),
(174, 'App\\Models\\Student', 1, 'token', '1a661d9cf3937d2d5ff8c3a1679881b74aa64500de53ccf5f58b5becd07b114f', '[\"*\"]', '2025-09-02 07:00:21', NULL, '2025-09-02 06:55:27', '2025-09-02 07:00:21'),
(175, 'App\\Models\\Student', 1, 'token', '2c25f7cb1cdad9c08e1b207857b876bb93b007fa15bef8e15ff33c5a657c4f2d', '[\"*\"]', '2025-09-02 07:02:10', NULL, '2025-09-02 07:00:27', '2025-09-02 07:02:10'),
(176, 'App\\Models\\Student', 1, 'token', '3210cf65d07961943287426c1187c55d265dddb7638017f1f1dd72afec4eddfd', '[\"*\"]', '2025-09-02 07:10:05', NULL, '2025-09-02 07:02:12', '2025-09-02 07:10:05'),
(177, 'App\\Models\\Student', 1, 'token', 'cf56328aeff96d1e911cadec4118486fec4b8fdccc2c84331f2438c3b51c4c76', '[\"*\"]', '2025-09-02 07:31:53', NULL, '2025-09-02 07:10:50', '2025-09-02 07:31:53'),
(178, 'App\\Models\\Teacher', 2, 'token', 'e45bae4cff980ae9ad142cdd2c1534bf13274270360c5ce3b9d00800ea27c4f0', '[\"*\"]', '2025-09-02 07:33:53', NULL, '2025-09-02 07:32:11', '2025-09-02 07:33:53'),
(179, 'App\\Models\\Student', 1, 'token', 'a250f5c6790b20417a9ef3e35c52d9486fc781815bdd309d1a9970358e697a6b', '[\"*\"]', '2025-09-02 09:56:08', NULL, '2025-09-02 07:34:03', '2025-09-02 09:56:08'),
(180, 'App\\Models\\Student', 1, 'token', 'd1c80c70ea234c7c71f9a1bbddde2ea9f0a0a34ec46365b603d89982a96b6a4b', '[\"*\"]', '2025-09-02 09:56:23', NULL, '2025-09-02 09:56:18', '2025-09-02 09:56:23'),
(181, 'App\\Models\\Student', 1, 'token', 'f0a249515e5dec72bd755a780fb5973075b7b8d293e3ff82f627a98d5c247734', '[\"*\"]', '2025-09-02 09:56:54', NULL, '2025-09-02 09:56:47', '2025-09-02 09:56:54'),
(182, 'App\\Models\\Student', 1, 'token', 'd1f642292d3e9ba5ac6ca95f3a0928add1d49c57e8ffb29956eae65e128684eb', '[\"*\"]', '2025-09-02 09:57:14', NULL, '2025-09-02 09:57:07', '2025-09-02 09:57:14'),
(183, 'App\\Models\\Student', 1, 'token', '400b45546ab477a62e6cc94a17cb0b46b9779a0b290d04d970a92adcd72e1e62', '[\"*\"]', '2025-09-02 09:58:14', NULL, '2025-09-02 09:58:07', '2025-09-02 09:58:14'),
(184, 'App\\Models\\Student', 1, 'token', 'dea5a385ef08b03a4ebb97fac15a9870a9bdb456caefd26d74c4430936107945', '[\"*\"]', '2025-09-02 09:59:01', NULL, '2025-09-02 09:58:55', '2025-09-02 09:59:01'),
(185, 'App\\Models\\Student', 1, 'token', '0c4c83426bcd9ccc005fcf3e23f7c74ceb381f2a577db251300840a482685ffe', '[\"*\"]', '2025-09-02 10:40:58', NULL, '2025-09-02 10:03:21', '2025-09-02 10:40:58'),
(186, 'App\\Models\\User', 1, 'token', 'b5293cad6168c4633fc342c8f42516407874b5a47252e911e87f9381aeefa982', '[\"*\"]', '2025-09-02 10:48:11', NULL, '2025-09-02 10:47:18', '2025-09-02 10:48:11'),
(187, 'App\\Models\\Teacher', 1, 'token', '1922fb7fddbcf2ed51af9677d79e7a85ec11ed9f33f83b061ef084ec921dd1f1', '[\"*\"]', '2025-09-02 10:50:28', NULL, '2025-09-02 10:48:29', '2025-09-02 10:50:28'),
(188, 'App\\Models\\Teacher', 2, 'token', 'e3391b93f1c172f809ab3954f26eb09f4602ed813383b246bedff5ac49844361', '[\"*\"]', '2025-09-02 11:00:32', NULL, '2025-09-02 10:58:16', '2025-09-02 11:00:32'),
(189, 'App\\Models\\Student', 1, 'token', 'a62f85497a52ee2dba8dd3ae261414c30c245d778e38369716e1f78803888b4b', '[\"*\"]', '2025-09-02 11:03:59', NULL, '2025-09-02 11:00:41', '2025-09-02 11:03:59'),
(190, 'App\\Models\\Teacher', 1, 'token', 'c1ec2b4a78ac0555d5292217f7c91906b15373e5ba124ae234620a2a0157f45f', '[\"*\"]', '2025-09-02 11:21:44', NULL, '2025-09-02 11:20:10', '2025-09-02 11:21:44'),
(191, 'App\\Models\\Student', 1, 'token', '435e8c412e43dd1fd4c67092e55665b92298f3cc969720296c8ea386703cc23e', '[\"*\"]', '2025-09-02 11:25:12', NULL, '2025-09-02 11:24:46', '2025-09-02 11:25:12'),
(192, 'App\\Models\\Teacher', 1, 'token', '8ba08334e00928483c5007a7c59ab48b721e34ebb614cf672f64a4a0e8d3952c', '[\"*\"]', '2025-09-02 11:41:24', NULL, '2025-09-02 11:41:13', '2025-09-02 11:41:24'),
(193, 'App\\Models\\Teacher', 2, 'token', 'f1df847011ba16575b4a7268f2970a0597bfbf7e23c03a22e7689c2ba199eab3', '[\"*\"]', '2025-09-02 11:41:50', NULL, '2025-09-02 11:41:41', '2025-09-02 11:41:50');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `question_text` text NOT NULL,
  `points` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `quiz_id`, `question_text`, `points`, `created_at`, `updated_at`) VALUES
(5, 7, 'am gayshan', 1, '2025-08-30 17:18:54', '2025-08-30 17:18:54'),
(8, 10, 'what is your name is', 1, '2025-09-02 06:39:41', '2025-09-02 06:39:41'),
(9, 10, 'what is age', 1, '2025-09-02 06:39:44', '2025-09-02 06:39:44'),
(10, 11, 'wghatis yiy name', 1, '2025-09-02 07:33:37', '2025-09-02 07:33:37'),
(11, 11, 'gysdas asdasd  adsas  asdasd', 1, '2025-09-02 07:33:40', '2025-09-02 07:33:40'),
(12, 12, 'asdasdasdas', 1, '2025-09-02 11:00:20', '2025-09-02 11:00:20'),
(13, 12, 'fty is a legal', 1, '2025-09-02 11:00:24', '2025-09-02 11:00:24');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_title` varchar(255) NOT NULL,
  `quiz_password` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `time_limit` int(11) NOT NULL,
  `passing_score` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `quiz_title`, `quiz_password`, `subject_id`, `teacher_id`, `time_limit`, `passing_score`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES
(7, 'perera', 'Cha@1234', 4, 2, 30, 70, '2025-10-25 01:00:00', '2025-11-25 01:00:00', '2025-08-30 17:18:52', '2025-08-30 17:18:52'),
(10, 'ass', 'gaya123', 2, 2, 30, 70, '2025-09-02 17:40:00', '2025-09-02 18:30:00', '2025-09-02 06:39:40', '2025-09-02 06:39:40'),
(11, 'ass1', 'gaya1234', 4, 2, 30, 70, '2025-09-02 18:34:00', '2025-09-02 22:00:00', '2025-09-02 07:33:36', '2025-09-02 07:33:36'),
(12, 'pere', 'gaya1235', 2, 2, 30, 70, '2025-09-02 22:00:00', '2025-09-02 23:05:00', '2025-09-02 11:00:19', '2025-09-02 11:00:19');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('Vu686o3V2UvEEuiRT42i4nK7MKAV1e1c85xBiTmy', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiS1M0M0NjMHF6bWxod1A0eDA2VFZTNURpS01oa1VTTmlJMkZqWkhuQiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1756361855);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `name`, `email`, `phone`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Kasun Perera', 'kasun.perera@example.com', '0771234567', '$2y$12$kJlAq.HXH3qnVzVjoEaQ6uabFyUbw7jzcZsgMjtxA3HNn.C2j57Dq', '2025-08-29 22:39:46', '2025-09-01 23:17:01'),
(2, 'Kasun Perera3', 'kasun1.perera@example.com', '0771234568', '$2y$12$pfdg1NQgdr9v5XrYXCYYD.AhtCjsbRh12p2Fwl5R9hRnrtwSLDWwG', '2025-08-29 22:40:50', '2025-08-29 22:45:51'),
(4, 'nimal1', 'gaya123@gmail.com', '0778471456', '$2y$12$hnvQRcRyj0rbipTJtfGJJOx7OPn4P7xVGDzv/SRLRczZRhyapFZii', '2025-08-29 23:16:28', '2025-08-29 23:23:54'),
(5, 'nimal2', 'nimal.perera@example.com', '0771234565', '$2y$12$GH5yt9UksUzUfkuUOZ.0J.m7EBNcW7oDWQ0/mdN1b1u7pgvubp6sK', '2025-08-29 23:19:53', '2025-08-30 01:06:16');

-- --------------------------------------------------------

--
-- Table structure for table `student_quizzes`
--

CREATE TABLE `student_quizzes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `score` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `name`, `code`, `created_at`, `updated_at`) VALUES
(2, 'Sinhalase', 'S001', '2025-08-28 23:28:14', '2025-08-29 01:36:15'),
(4, 'Maths', 'S002', '2025-08-29 00:34:08', '2025-08-29 01:36:22');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `name`, `email`, `phone`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Prabath1', 'nimal1.perera@example.com', '0771234565', '$2y$12$RTuwR/GFBkRyuI73qY1Wsu.oHK3ZhXY9UQ2tH7ipGOVxFwfICXzKe', '2025-08-29 23:45:41', '2025-09-02 10:48:10'),
(2, 'Gayashan', 'perera@example.com', '0752069762', '$2y$12$S5NJn8zTtITVL4dHMy8ehuxigVKswxIuqraBAUQOTNc58K7DSXw0u', '2025-08-29 23:53:36', '2025-08-30 01:38:15');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'amin@example.com', '2025-08-28 01:22:50', '$2y$12$oofrrV8yo5HpLvXDgsnpdu4WIHiQyJqobhs1WqHnnauuxkSEC.EOm', 'pa78qwnOLh', '2025-08-28 01:22:51', '2025-08-28 01:22:51');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `faculties`
--
ALTER TABLE `faculties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `faculties_code_unique` (`code`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `options`
--
ALTER TABLE `options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `options_question_id_foreign` (`question_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `questions_quiz_id_foreign` (`quiz_id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quizzes_quiz_password_unique` (`quiz_password`),
  ADD KEY `quizzes_subject_id_foreign` (`subject_id`),
  ADD KEY `quizzes_teacher_id_foreign` (`teacher_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `students_email_unique` (`email`),
  ADD UNIQUE KEY `students_phone_unique` (`phone`);

--
-- Indexes for table `student_quizzes`
--
ALTER TABLE `student_quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_quizzes_student_id_foreign` (`student_id`),
  ADD KEY `student_quizzes_quiz_id_foreign` (`quiz_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subjects_code_unique` (`code`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teachers_email_unique` (`email`),
  ADD UNIQUE KEY `teachers_phone_unique` (`phone`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `faculties`
--
ALTER TABLE `faculties`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `options`
--
ALTER TABLE `options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=194;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `student_quizzes`
--
ALTER TABLE `student_quizzes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `options`
--
ALTER TABLE `options`
  ADD CONSTRAINT `options_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_quiz_id_foreign` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quizzes_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_quizzes`
--
ALTER TABLE `student_quizzes`
  ADD CONSTRAINT `student_quizzes_quiz_id_foreign` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_quizzes_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
