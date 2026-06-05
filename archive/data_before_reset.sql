--
-- PostgreSQL database dump
--

\restrict wrAvXkYAc16Ec2tcISrljoulUmVWnSgLTSCXAOxICo3qgj4h2PkwUNBTMK2uvtb

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: BannerPreset; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."BannerPreset" VALUES ('color-coral-red', 'Coral Red', 'COLOR', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620595564_colors/coral-red.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620595711_colors/thumbs/coral-red.webp', 'Warm', true, 1, '2026-04-19 17:43:21.378', '2026-04-19 17:43:21.378');
INSERT INTO public."BannerPreset" VALUES ('color-sunset-orange', 'Sunset Orange', 'COLOR', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620595875_colors/sunset-orange.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596025_colors/thumbs/sunset-orange.webp', 'Warm', true, 2, '2026-04-19 17:43:21.969', '2026-04-19 17:43:21.969');
INSERT INTO public."BannerPreset" VALUES ('color-soft-pink', 'Soft Pink', 'COLOR', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596166_colors/soft-pink.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596264_colors/thumbs/soft-pink.webp', 'Warm', true, 3, '2026-04-19 17:43:22.301', '2026-04-19 17:43:22.301');
INSERT INTO public."BannerPreset" VALUES ('color-warm-beige', 'Warm Beige', 'COLOR', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596465_colors/warm-beige.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596680_colors/thumbs/warm-beige.webp', 'Neutral', true, 4, '2026-04-19 17:43:22.581', '2026-04-19 17:43:22.581');
INSERT INTO public."BannerPreset" VALUES ('color-ocean-blue', 'Ocean Blue', 'COLOR', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596923_colors/ocean-blue.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620597069_colors/thumbs/ocean-blue.webp', 'Cool', true, 5, '2026-04-19 17:43:22.904', '2026-04-19 17:43:22.904');
INSERT INTO public."BannerPreset" VALUES ('color-sky-blue', 'Sky Blue', 'COLOR', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620597214_colors/sky-blue.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620597450_colors/thumbs/sky-blue.webp', 'Cool', true, 6, '2026-04-19 17:43:23.217', '2026-04-19 17:43:23.217');
INSERT INTO public."BannerPreset" VALUES ('color-mint-green', 'Mint Green', 'COLOR', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620597666_colors/mint-green.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620597866_colors/thumbs/mint-green.webp', 'Cool', true, 7, '2026-04-19 17:43:23.504', '2026-04-19 17:43:23.504');
INSERT INTO public."BannerPreset" VALUES ('color-lavender', 'Lavender', 'COLOR', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620598095_colors/lavender.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620598266_colors/thumbs/lavender.webp', 'Cool', true, 8, '2026-04-19 17:43:23.866', '2026-04-19 17:43:23.866');
INSERT INTO public."BannerPreset" VALUES ('gradient-ocean', 'Ocean Depths', 'GRADIENT', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620598495_gradients/ocean.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620598665_gradients/thumbs/ocean.webp', NULL, true, 1, '2026-04-19 17:43:24.104', '2026-04-19 17:43:24.104');
INSERT INTO public."BannerPreset" VALUES ('gradient-sunset', 'Sunset Glow', 'GRADIENT', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620598809_gradients/sunset.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599021_gradients/thumbs/sunset.webp', NULL, true, 2, '2026-04-19 17:43:24.469', '2026-04-19 17:43:24.469');
INSERT INTO public."BannerPreset" VALUES ('gradient-purple-dream', 'Purple Dream', 'GRADIENT', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599169_gradients/purple-dream.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599310_gradients/thumbs/purple-dream.webp', NULL, true, 3, '2026-04-19 17:43:24.787', '2026-04-19 17:43:24.787');
INSERT INTO public."BannerPreset" VALUES ('gradient-forest', 'Forest Mist', 'GRADIENT', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599545_gradients/forest.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599766_gradients/thumbs/forest.webp', NULL, true, 4, '2026-04-19 17:43:25.102', '2026-04-19 17:43:25.102');
INSERT INTO public."BannerPreset" VALUES ('gradient-rose', 'Rose Garden', 'GRADIENT', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599965_gradients/rose.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620600170_gradients/thumbs/rose.webp', NULL, true, 5, '2026-04-19 17:43:25.419', '2026-04-19 17:43:25.419');
INSERT INTO public."BannerPreset" VALUES ('gradient-autumn', 'Autumn Leaves', 'GRADIENT', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620600709_gradients/autumn.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620600865_gradients/thumbs/autumn.webp', NULL, true, 7, '2026-04-19 17:43:26.067', '2026-04-19 17:43:26.067');
INSERT INTO public."BannerPreset" VALUES ('gradient-midnight', 'Midnight Sky', 'GRADIENT', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620600366_gradients/midnight.webp', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620600591_gradients/thumbs/midnight.webp', NULL, true, 6, '2026-04-19 17:43:25.68', '2026-04-22 11:24:10.188');


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."user" VALUES ('Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'admin@cameroonmemoria.com', 'b83e80f5bb9229d752daf4f1adbf12bb:9ff7da4de87e3e36e62227303eb14f1479ff9004aba14024a45e896bdba464a3c97777277ba25bbea328f8382de779806d6c75f860177bbec0a1123956528f79', 'Adminatreur', 'ADMIN', '2026-04-14 10:21:41.975', '2026-04-14 10:21:42.333', false, NULL, NULL, 'ACTIVE');
INSERT INTO public."user" VALUES ('G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'ngobiba1@yahoo.fr', NULL, 'NGO BIBA', 'USER', '2026-04-20 09:32:33.956', '2026-04-20 09:32:34.249', false, NULL, '+237698417607', 'ACTIVE');
INSERT INTO public."user" VALUES ('BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt', 'batoum5@gmail.com', NULL, 'thierry batoum', 'USER', '2026-04-20 17:25:42.227', '2026-04-20 17:25:42.227', false, NULL, NULL, 'ACTIVE');
INSERT INTO public."user" VALUES ('ZCO82yz7PBk6YZi8CBjh1tKVPQ3Rq4SS', 'test@user.com', NULL, 'Test User', 'USER', '2026-04-20 18:07:32.297', '2026-04-20 18:13:18.721', false, NULL, NULL, 'ACTIVE');
INSERT INTO public."user" VALUES ('YcbboQAWyQXYn6bWmo6KpljJXEqCsChD', 'n_fereol@yahoo.fr', NULL, 'Féréol NYOUNAI BOUMTJE', 'USER', '2026-04-21 17:09:59.118', '2026-04-21 17:09:59.327', false, NULL, '+237+33677049536', 'ACTIVE');


--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Announcement" VALUES ('cmo6coo9s0001p801evdjm5b7', 'Test Prod', 'Test Prod Test Prod Test Prod Test Prod', false, '2026-04-19 22:41:29.824', '2026-04-19 22:49:09.144', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', NULL, NULL, '1966-03-28 00:00:00', '2026-04-17 00:00:00', 'Test', 'FUNERAL', 'REJECTED', '"[{\"date\":{\"from\":\"2026-04-16\",\"to\":\"2026-05-21\"},\"name\":\"Test\",\"location\":\"Douala, Cameroon\"},{\"date\":{\"from\":\"2026-04-07\",\"to\":\"2026-04-26\"},\"name\":\"Test test\",\"location\":\"Yagoua, Cameroon\"}]"', 'Other', NULL, 'color-sky-blue', NULL, 'Douala, Cameroon', 'M.');
INSERT INTO public."Announcement" VALUES ('cmo6cxw340001o901u1ef23vr', 'Test test', 'Test Test Test Test Test', false, '2026-04-19 22:48:39.855', '2026-04-19 22:49:11.539', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', NULL, NULL, '1966-03-29 00:00:00', '2026-04-15 00:00:00', 'Test', 'THANKS', 'REJECTED', '"[{\"date\":{\"from\":\"2026-04-08\",\"to\":\"2026-04-19\"},\"name\":\"Teadaasd\",\"location\":\"Bafoussam, Cameroon\"}]"', 'Other', NULL, 'color-sunset-orange', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776638919319_file-y366gpr4n6', 'Dschang, Cameroon', 'M.');
INSERT INTO public."Announcement" VALUES ('cmo9ttq1f000vo901visxpw7o', 'En mémoire de Guy Adna', 'La grande Famille Adna à la douleur d''annoncer le de Guy Adna, Né à Douala le 01 janvier 1960
Décédé à  Yaoundé le 01 janvier 2000', false, '2026-04-22 09:04:37.39', '2026-04-22 11:06:27.308', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', NULL, NULL, '1960-01-01 00:00:00', '2026-04-22 00:00:00', 'Adna Guy', 'DEATH_NOTICE', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-04-23\",\"to\":\"2026-05-23\"},\"name\":\"Veillée \",\"location\":\"elicimOAu D\"}]"', 'Famille', NULL, NULL, NULL, 'Yaoundé, Cameroon', 'M.');
INSERT INTO public."Announcement" VALUES ('cmo91hw9c000ro901249opw35', 'En mémoire de NKEN Martin', 'Nous avons la douleur d''annoncer le décès de notre grand-père: Nken Martin décédé le 1 juin de suite de maladie', false, '2026-04-21 19:51:36.336', '2026-04-22 11:06:40.631', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', NULL, NULL, '1966-04-01 00:00:00', '2026-04-21 00:00:00', 'NKEN Martin', 'DEATH_NOTICE', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-04-28\",\"to\":\"\"},\"name\":\"Veillée sans corps\",\"location\":\"Douala, Cameroon\"}]"', 'Petite-fille', NULL, 'color-mint-green', NULL, NULL, 'M.');
INSERT INTO public."Announcement" VALUES ('cmo8x1i41000po901fro1yhm9', 'Remerciements', 'Une grand merci  a vous tous, profondément touché par les marques d''affection et d''amitié que vous nous avez témoignées lors du decès ', false, '2026-04-21 17:46:53.041', '2026-04-22 11:06:47.821', 'YcbboQAWyQXYn6bWmo6KpljJXEqCsChD', NULL, NULL, NULL, '2026-04-01 00:00:00', 'Jean-francois AMULET', 'THANKS', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-05-01\",\"to\":\"\"},\"name\":\"enterrement\",\"location\":\"Logan Village, Australia\"}]"', 'beau-frère', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public."Announcement" VALUES ('cmo8wrlmd000no901inlri13w', 'meilleur ami', 'notre cher ami, ton amour dans nos coeurs', false, '2026-04-21 17:39:11.025', '2026-04-22 11:06:58.125', 'YcbboQAWyQXYn6bWmo6KpljJXEqCsChD', NULL, NULL, '1966-04-30 00:00:00', '2026-04-07 00:00:00', 'Emile JACOB', 'FUNERAL', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-04-28\",\"to\":\"\"},\"name\":\"enterrement\",\"location\":\"Logan Village, Australia\"}]"', 'Ami', NULL, 'color-coral-red', NULL, NULL, NULL);
INSERT INTO public."Announcement" VALUES ('cmo70bnos0007o901d9becrmp', 'En memoire de Tjeka Madeleine', 'Ma chère Tante,
Tu nous manques 
', false, '2026-04-20 09:43:13.324', '2026-04-22 11:10:43.397', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', NULL, NULL, '1933-04-01 00:00:00', '1995-02-02 00:00:00', 'TJEKA MADELEINE', 'FUNERAL', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-04-25\",\"to\":\"\"},\"name\":\"Veillée \",\"location\":\"Douala\"}]"', 'Nièce ', NULL, 'gradient-sunset', NULL, NULL, NULL);
INSERT INTO public."Announcement" VALUES ('cmo8wjicc000lo901lvt8ybni', 'mon grand-frère', 'besoin d''honoré notre frère qui nous a quitté', false, '2026-04-21 17:32:53.532', '2026-04-22 11:10:49.913', 'YcbboQAWyQXYn6bWmo6KpljJXEqCsChD', NULL, NULL, NULL, '2008-04-25 00:00:00', 'Claude EITEL', 'ANNIVERSARY', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-04-25\",\"to\":\"\"},\"name\":\"Village\",\"location\":\"NJOCK\"}]"', 'Frere / Soeur', NULL, 'color-sunset-orange', NULL, NULL, NULL);
INSERT INTO public."Announcement" VALUES ('cmo8w8389000fo9019d7gxrcu', 'Decès du beau-frère', 'C’est avec une profonde tristesse que nous vous faisons part du décès de Henri BALSO survenu le 17 à l’âge de 75.

Ses obsèques auront lieu le 28 avril à Metz.', false, '2026-04-21 17:24:00.729', '2026-04-22 11:10:56.827', 'YcbboQAWyQXYn6bWmo6KpljJXEqCsChD', NULL, NULL, NULL, '2026-04-17 00:00:00', 'Henri BALSO', 'FUNERAL', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-04-27\",\"to\":\"\"},\"name\":\"Avis de décès\",\"location\":\"Matez\"}]"', 'beau-frère', NULL, NULL, NULL, NULL, 'M.');
INSERT INTO public."Announcement" VALUES ('cmoa9k46z000zo901mao7dhnc', 'Merci', 'Nous tenions à vous remercier du fond du cœur pour votre soutien lors du départ de Monsieur Elong Joseph.

Votre présence à nos côtés le 04 avril dernier ainsi que vos mots de réconfort nous ont été d''une aide précieuse pour traverser cette épreuve. Savoir Joseph si entouré et apprécié est une grande consolation pour nous tous.

Avec toute notre amitié et notre reconnaissance,
La famille Elong', false, '2026-04-22 16:25:03.034', '2026-04-22 16:25:29.936', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', NULL, NULL, '1966-04-04 00:00:00', '2026-03-02 00:00:00', 'Elong Joseph', 'THANKS', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-04-04\",\"to\":\"\"},\"name\":\"Inhumation\",\"location\":\"Kumba, Cameroon\"}]"', 'La famille', NULL, NULL, 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776875102102_file-29xbpik5ixt', 'Kumba, Cameroon', 'M.');
INSERT INTO public."Announcement" VALUES ('cmo7icagd0009o901ska3kxp2', 'Test Connexion', 'Test Test Connexion Test', false, '2026-04-20 18:07:35.916', '2026-04-22 16:52:48.319', 'ZCO82yz7PBk6YZi8CBjh1tKVPQ3Rq4SS', NULL, NULL, '1966-03-29 00:00:00', '2026-04-17 00:00:00', 'Test', 'ANNIVERSARY', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-03-31\",\"to\":\"2026-04-26\"},\"name\":\"Test\",\"location\":\"Fuentestrún, Spain\"}]"', 'Autre', NULL, NULL, 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776708449712_file-ha806etrcf', 'Douala, Cameroon', 'M.');
INSERT INTO public."Announcement" VALUES ('cmoab6rtq0019o901duzt3olt', 'Repose en paix', '« Celui qui croit en moi vivra, quand bien même il mourrait. »

La grande famille Kameni, les familles alliées et les proches ont la profonde douleur d''annoncer le décès de leur regrettée :

Madame Kameni Elisabeth
Survenu à Bafou.

En cette douloureuse circonstance, la famille vous convie à vous joindre à elle pour un moment de recueillement et d''hommage.', false, '2026-04-22 17:10:39.71', '2026-04-22 17:11:13.994', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', NULL, NULL, '1968-03-06 00:00:00', '2026-04-13 00:00:00', 'Kameni Elisabeth', 'DEATH_NOTICE', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-04-22\",\"to\":\"2026-05-14\"},\"name\":\"Veillée sans corps\",\"location\":\"Au domicile familliale à Bafoussam\"},{\"date\":{\"from\":\"2026-05-15\",\"to\":\"\"},\"name\":\"Levée de Corps\",\"location\":\"Hôpital de Bafoussam\"},{\"date\":{\"from\":\"2026-05-16\",\"to\":\"\"},\"name\":\"Inhumation\",\"location\":\"Bafoussam, Cameroon\"}]"', 'Parent', NULL, NULL, 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776877838677_file-w2ej27sxu5', 'Bafoussam, Cameroon', 'Mme');
INSERT INTO public."Announcement" VALUES ('cmoac3mxf001ho901hz7ip5h7', 'Doux repos', '« C’est à Dieu que nous appartenons et c’est à Lui que nous retournons. »

La communauté Souledé,
La grande famille Mohammadou,
Ses fils et filles,
Ses petits-fils et arrière-petits-fils,
Les familles alliées et amies,

Ont la profonde douleur d''annoncer à leurs parents, amis et connaissances, le rappel à Dieu de leur Patriarche :

MOHAMMADOU BILAL
Survenu le 21 avril à Souledé, à l’âge de 80 ans.

Le Patriarche Mohammadou Bilal laisse derrière lui le souvenir d''un homme de sagesse, pilier de sa communauté et guide pour sa descendance.', false, '2026-04-22 17:36:13.01', '2026-04-22 17:36:35.129', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', NULL, NULL, '1946-07-17 00:00:00', '2026-04-21 00:00:00', 'Mouhammadou Bilal', 'DEATH_NOTICE', 'PUBLISHED', '"[{\"date\":{\"from\":\"2026-04-23\",\"to\":\"\"},\"name\":\"Inhumation\",\"location\":\"Souledé\"}]"', 'Parent', NULL, NULL, 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776879371509_file-xzjamg3cr1', 'Souledé', 'M.');
INSERT INTO public."Announcement" VALUES ('cmob802j50001o9018ynifbug', 'In Memoriam', '"Le temps passe, mais le souvenir reste."

Déjà six ans que s''est endormie dans la paix du Seigneur, le [Date exacte du décès] 2020 à Edea, notre regrettée mère, grand-mère et sœur :

Madame ESSOMBA Marie-Lou
Décédée à l’âge de 70 ans

En ce jour anniversaire, ses enfants résidant à Yaoundé, Londres et Nairobi, ainsi que ses petits-enfants et les familles alliées, renouvellent leurs prières pour le repos éternel de son âme.

Maman Marie-Lou, ton départ a laissé un immense vide, mais la sagesse et l''amour que tu nous as transmis continuent de guider nos pas à travers le monde. Que ton sourire et ta bienveillance demeurent à jamais dans nos cœurs.

Que tous ceux qui l''ont connue et aimée aient une pensée pieuse pour elle en ce jour.

« Je ne suis pas loin, juste de l''autre côté du chemin. »', false, '2026-04-23 08:29:14.146', '2026-04-23 08:29:43.66', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', NULL, NULL, NULL, '2020-04-22 00:00:00', 'Essomba Marie-Lou', 'ANNIVERSARY', 'PUBLISHED', '"[{\"date\":{\"from\":\"2020-04-22\",\"to\":\"2026-04-22\"},\"name\":\"En souvenir\",\"location\":\"Yaoundé, Cameroon\"}]"', 'Les Enfants', NULL, NULL, 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776932952615_file-ddxxbtz9i0j', NULL, 'Mme');


--
-- Data for Name: Condolence; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Condolence" VALUES ('cmoac4tzk001po901un641t4o', 'Tu vas nous manquer ', false, false, '2026-04-22 17:37:08.73', '2026-04-22 17:37:08.73', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmoab6rtq0019o901duzt3olt');
INSERT INTO public."Condolence" VALUES ('cmoac78bt001ro901rikodxqq', 'Adieu mon ami !', false, false, '2026-04-22 17:39:00.713', '2026-04-22 17:39:00.713', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmo9ttq1f000vo901visxpw7o');
INSERT INTO public."Condolence" VALUES ('cmoac7jin001to901q1id8aet', 'Mes sincères condoléances à la famille. Avec toute ma compassion.
Thierry.', false, true, '2026-04-22 17:39:15.215', '2026-04-22 17:40:35.628', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmoac3mxf001ho901hz7ip5h7');
INSERT INTO public."Condolence" VALUES ('cmoach67b0023o901qc1k76vm', 'Tu vas nous manquer ! 
Tu as une grand-mère aimable', false, false, '2026-04-22 17:46:44.519', '2026-04-22 17:46:44.519', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmoab6rtq0019o901duzt3olt');
INSERT INTO public."Condolence" VALUES ('cmoaclwhp002bo901t43puncq', '
Cest avec beaucoup de tristesse que j''ai appris ton décès. Je suis affligée. 
Doux repos mon ami d''enfance. ', false, false, '2026-04-22 17:50:25.213', '2026-04-22 17:50:25.213', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmo8wrlmd000no901inlri13w');
INSERT INTO public."Condolence" VALUES ('cmoaiotfo002do901zlsxo33a', 'Mes sincères condoléances . Que la terre de nos ancêtres lui soit légère.
Thierry', false, true, '2026-04-22 20:40:38.916', '2026-04-22 20:41:15.922', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmoab6rtq0019o901duzt3olt');


--
-- Data for Name: Wallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Wallet" VALUES ('cmnyh21bz0001tll9u39dky4x', 0, 'XAF', '2026-04-14 10:21:42.333', '2026-04-14 10:21:42.333', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Donation; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Media" VALUES ('cmo6cxw4t0003o9011h8t24rz', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776638919347_file-7kf6w83zymn', 'IMAGE', '2026-04-19 22:48:39.918', 'cmo6cxw340001o901u1ef23vr');
INSERT INTO public."Media" VALUES ('cmo6cxw4y0005o901fgg2sk8q', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776638919361_file-fwt9n0yupxf', 'IMAGE', '2026-04-19 22:48:39.922', 'cmo6cxw340001o901u1ef23vr');
INSERT INTO public."Media" VALUES ('cmo7icaii000bo9012iqoh7pq', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776708449625_file-97w6qr8auej', 'IMAGE', '2026-04-20 18:07:35.995', 'cmo7icagd0009o901ska3kxp2');
INSERT INTO public."Media" VALUES ('cmo7icaip000do901jggnpz4t', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776708449732_file-aszs3hmzmu6', 'IMAGE', '2026-04-20 18:07:36.001', 'cmo7icagd0009o901ska3kxp2');
INSERT INTO public."Media" VALUES ('cmo8w83dd000ho901xua7odi9', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776792239023_file-w20j0tvdew', 'IMAGE', '2026-04-21 17:24:00.913', 'cmo8w8389000fo9019d7gxrcu');
INSERT INTO public."Media" VALUES ('cmo8w83di000jo901mrz0xnxv', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776792239148_file-fm7jqxeoshu', 'IMAGE', '2026-04-21 17:24:00.918', 'cmo8w8389000fo9019d7gxrcu');
INSERT INTO public."Media" VALUES ('cmo91hw9v000to90166nhkdp4', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776801095060_file-tn4o4l4tey', 'IMAGE', '2026-04-21 19:51:36.356', 'cmo91hw9c000ro901249opw35');
INSERT INTO public."Media" VALUES ('cmo9ttq4y000xo901mpofvydi', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776848676008_file-v2f4za0oh4l', 'IMAGE', '2026-04-22 09:04:37.521', 'cmo9ttq1f000vo901visxpw7o');
INSERT INTO public."Media" VALUES ('cmoa9k48x0011o901c1acgi2v', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776875101913_file-1omsg7czbdj', 'IMAGE', '2026-04-22 16:25:03.105', 'cmoa9k46z000zo901mao7dhnc');
INSERT INTO public."Media" VALUES ('cmoa9k4980013o901b13thvyb', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776875102122_file-d3vd03ntpna', 'IMAGE', '2026-04-22 16:25:03.116', 'cmoa9k46z000zo901mao7dhnc');
INSERT INTO public."Media" VALUES ('cmoab6ru6001bo901sq5v9ny2', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776877838586_file-l58e356pf2m', 'IMAGE', '2026-04-22 17:10:39.726', 'cmoab6rtq0019o901duzt3olt');
INSERT INTO public."Media" VALUES ('cmoac3mxx001jo901pzyrpwky', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776879371039_file-ojy82ggq97', 'IMAGE', '2026-04-22 17:36:13.03', 'cmoac3mxf001ho901hz7ip5h7');
INSERT INTO public."Media" VALUES ('cmoac3my4001lo901sws0ci1o', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776879371720_file-typ32ibn3sl', 'IMAGE', '2026-04-22 17:36:13.036', 'cmoac3mxf001ho901hz7ip5h7');
INSERT INTO public."Media" VALUES ('cmob802m00003o9010dwvom64', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776932952428_file-z5u362rzbkk', 'IMAGE', '2026-04-23 08:29:14.425', 'cmob802j50001o9018ynifbug');
INSERT INTO public."Media" VALUES ('cmob802md0005o901fcvlwpr3', 'https://s3.cameroonmemoria.com/cameroonmemoria-media/1776932952817_file-dp15156ucx9', 'IMAGE', '2026-04-23 08:29:14.437', 'cmob802j50001o9018ynifbug');


--
-- Data for Name: Offering; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Offering" VALUES ('cmoaaims40015o901ga0pts11', 'CANDLE', '2026-04-22 16:51:53.429', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmo9ttq1f000vo901visxpw7o');
INSERT INTO public."Offering" VALUES ('cmoaaivpv0017o901x0kt7shf', 'FLOWER', '2026-04-22 16:52:05.011', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmo9ttq1f000vo901visxpw7o');
INSERT INTO public."Offering" VALUES ('cmoabcmwz001do901x7dpffo8', 'FLOWER', '2026-04-22 17:15:13.283', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmoab6rtq0019o901duzt3olt');
INSERT INTO public."Offering" VALUES ('cmoabcnn0001fo9012otcu5ou', 'CANDLE', '2026-04-22 17:15:14.22', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmoab6rtq0019o901duzt3olt');
INSERT INTO public."Offering" VALUES ('cmoac4deh001no901me1gbi61', 'FLOWER', '2026-04-22 17:36:47.321', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmoab6rtq0019o901duzt3olt');
INSERT INTO public."Offering" VALUES ('cmoac7jod001vo901bp3fynug', 'FLOWER', '2026-04-22 17:39:15.421', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmo9ttq1f000vo901visxpw7o');
INSERT INTO public."Offering" VALUES ('cmoac7kfs001xo9014ek12cm1', 'CANDLE', '2026-04-22 17:39:16.409', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmo9ttq1f000vo901visxpw7o');
INSERT INTO public."Offering" VALUES ('cmoacc5vv001zo901ywr8jpq1', 'FLOWER', '2026-04-22 17:42:50.827', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmo8x1i41000po901fro1yhm9');
INSERT INTO public."Offering" VALUES ('cmoacc6tx0021o901kn2q9juv', 'CANDLE', '2026-04-22 17:42:52.053', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmo8x1i41000po901fro1yhm9');
INSERT INTO public."Offering" VALUES ('cmoacivq30025o9012zrqx8ss', 'CANDLE', '2026-04-22 17:48:04.251', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmoab6rtq0019o901duzt3olt');
INSERT INTO public."Offering" VALUES ('cmoacjval0027o9013ucvbo8a', 'CANDLE', '2026-04-22 17:48:50.349', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmo8wrlmd000no901inlri13w');
INSERT INTO public."Offering" VALUES ('cmoacjwf00029o901llzwkm3q', 'FLOWER', '2026-04-22 17:48:51.804', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'cmo8wrlmd000no901inlri13w');
INSERT INTO public."Offering" VALUES ('cmoais7tm002fo9013mp5ekdq', 'CANDLE', '2026-04-22 20:43:17.53', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmoab6rtq0019o901duzt3olt');
INSERT INTO public."Offering" VALUES ('cmoaitrfl002ho901elvicbxo', 'FLOWER', '2026-04-22 20:44:29.601', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmoab6rtq0019o901duzt3olt');
INSERT INTO public."Offering" VALUES ('cmoaitu55002jo901nfsapvdx', 'FLOWER', '2026-04-22 20:44:33.114', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmoab6rtq0019o901duzt3olt');
INSERT INTO public."Offering" VALUES ('cmob98boh0007o901v6ypagiu', 'FLOWER', '2026-04-23 09:03:39.027', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmob802j50001o9018ynifbug');
INSERT INTO public."Offering" VALUES ('cmob98cgd0009o901mbj0bqqx', 'CANDLE', '2026-04-23 09:03:40.045', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmob802j50001o9018ynifbug');
INSERT INTO public."Offering" VALUES ('cmobawtiz000bo901wkcw50z9', 'FLOWER', '2026-04-23 09:50:41.531', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmoac3mxf001ho901hz7ip5h7');
INSERT INTO public."Offering" VALUES ('cmobawuu1000do901w2gghxmp', 'CANDLE', '2026-04-23 09:50:43.226', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'cmoac3mxf001ho901hz7ip5h7');


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Profile" VALUES ('cmnyh21bx0000tll9jqc91sur', '+237123456789', '123 Rue de la Paix', 'Cameroun', 'Yaoundé', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.account VALUES ('hG0z3Dhi6ne9nWcvXW1nPXmFHbyLK8OR', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', 'credential', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv', NULL, NULL, NULL, NULL, NULL, NULL, 'c1443e355babcd1a7e5788cbd99e946b:f98ae35e310570027730503808264ac1079fd219dad3c1020289b54b95b710669c1c0f47dba09ee4d9a7b471cda4301c03759f5ea50d29af2523fa037e09c377', '2026-04-14 10:21:42.155', '2026-04-14 10:21:42.155');
INSERT INTO public.account VALUES ('g6ZrBnGDZ76upmlDkDfT1j2MfczwTc6a', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', 'credential', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF', NULL, NULL, NULL, NULL, NULL, NULL, 'fa8afab6e2e39890a1f1383d56776f10:97fe31325f89c0d72137de612c7e6d05c6ff28fe164f3d6d56790eddce5e9d7b515ddaa03be5c5700e75c12ef95ca287195b54969fd0ca3716598f1c780c10f6', '2026-04-20 09:32:34.23', '2026-04-20 09:32:34.23');
INSERT INTO public.account VALUES ('28XbeZquuhoBzRclEA0rxO7tQudpSMeN', 'BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt', 'credential', 'BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt', NULL, NULL, NULL, NULL, NULL, NULL, 'f6a148f5a64483a47ea9bc684945dae1:1204b627df20d3780b035d0b8c33888f226c5f9fd73343dd94bcd260f38aaaef977d4a3a8be886ace0f5f361d26d77178398d89d1ddc9b916a1196de75e1a657', '2026-04-20 17:25:42.257', '2026-04-20 17:25:42.257');
INSERT INTO public.account VALUES ('PWYWGf2x7tcXVuGqVNg11AvMuwh43IFh', 'ZCO82yz7PBk6YZi8CBjh1tKVPQ3Rq4SS', 'credential', 'ZCO82yz7PBk6YZi8CBjh1tKVPQ3Rq4SS', NULL, NULL, NULL, NULL, NULL, NULL, 'f6327d62fa854aa50dd820375631d005:1a2124cba87dd5da0fa721df0f005d10e4a5fb191316d48373684b33388da35a341b9fe50824be72443cc7295d7b53c322cfb6afff2a32d07c3d0aa7a53dc7f4', '2026-04-20 18:07:32.309', '2026-04-20 18:07:32.309');
INSERT INTO public.account VALUES ('tAEjoXm3WrtEteqE123tGmkBurGu7n7f', 'YcbboQAWyQXYn6bWmo6KpljJXEqCsChD', 'credential', 'YcbboQAWyQXYn6bWmo6KpljJXEqCsChD', NULL, NULL, NULL, NULL, NULL, NULL, 'c86550cd273f245ab72430684fd8a637:8680e569545688ffb996ae4a4e2535ee40b7da099e890188c0f5328b972e2c9db5360e29ac74f95bfba15255209724c8067754b10709e810ab41f89c5808e073', '2026-04-21 17:09:59.258', '2026-04-21 17:09:59.258');


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.session VALUES ('kXOi1DHOm7kIFVqdlzwSajQsOeNAerCX', '2026-04-21 17:02:03.748', 'HufBXEsJKjD8PnpkYCl6rjGksiRUQVGe', '2026-04-14 17:02:03.751', '2026-04-14 17:02:03.751', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('SoO30H696OtSoPZowJqVAm8dlsFMQOGr', '2026-04-23 16:33:55.21', 'utKyMaSH0LPb2GgPQ9AYeT9ZoXpFVupX', '2026-04-16 16:33:55.238', '2026-04-16 16:33:55.238', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('ikHMnUOdevofaLL28XBAq1MPuqvyPlth', '2026-04-26 15:50:30.404', 'GpkSMCMO9Gj0hToKEAoUHrB2WungAU0N', '2026-04-19 15:50:30.451', '2026-04-19 15:50:30.451', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('hbSAhIY2zqKAfGJHgxcJ2w4CIwvsxhhG', '2026-04-26 19:16:13.055', '0zkWJhmepsNJqg7qh7euCPJ5yrqPJQFN', '2026-04-19 19:16:13.056', '2026-04-19 19:16:13.056', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('LEimJDJUxJ69i3AmOCDZguGr9sHDiRA5', '2026-04-26 20:00:34.429', 'BnUbWf8XClvPrhn8SmHDvZAIqsioYWJs', '2026-04-19 20:00:34.433', '2026-04-19 20:00:34.433', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('XZbQi46o6BVmJd45MTwU3O4e7Bb01XdE', '2026-04-26 20:00:54.71', 'fJOgO6xPgpOuafhQyVtIRej82yKWUpQz', '2026-04-19 20:00:54.711', '2026-04-19 20:00:54.711', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('BWVGTToLqHWbdVDL1q1ASEpG52C1bYYj', '2026-04-26 22:17:29.045', 'wQ8XoMw16AqjcHZigx0eZ0egPUyIuWyA', '2026-04-19 22:17:29.047', '2026-04-19 22:17:29.047', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('Fg6BXytj3DXWDEmpgRIu9yv8qQO4eE6N', '2026-04-27 09:33:16.552', 'ssRfh8eXNtZLFMFfoNsmQscRiMHKIMrB', '2026-04-20 09:33:16.552', '2026-04-20 09:33:16.552', '', '', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF');
INSERT INTO public.session VALUES ('CaT4dzrbXJQYFEs0dWIYw0rXWXJY7nqt', '2026-04-27 17:21:59.423', 'zVdVpLPmOPUoZrPBt4JAnUswTrydfEP1', '2026-04-20 17:21:59.44', '2026-04-20 17:21:59.44', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('G1V8JuF07NX9PNo44Q914EQxc5evLI4A', '2026-04-27 17:26:59.457', 'ZgvlxQzHQzjSyXjKbOFhGtXhqK2ml1pF', '2026-04-20 17:26:59.457', '2026-04-20 17:26:59.457', '', '', 'BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt');
INSERT INTO public.session VALUES ('cNZMUqqjTnknvyVFcJOz0dElJAiaUubD', '2026-04-27 17:59:35.956', 'mxrOwE1B4t4FbWld7KwYXb86vYVhPjiE', '2026-04-20 17:59:35.956', '2026-04-20 17:59:35.956', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('bBy6qeZubWAHdgzH2e9aU5BQiMAmRJ6x', '2026-04-27 18:03:42.335', '8ZR1Dkd3BmBWkwjGNvJpyMAbKjY4ZJEH', '2026-04-20 18:03:42.335', '2026-04-20 18:03:42.335', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('G1JVwEjgMTRgvwxJm63GdisGn2PzMiL5', '2026-04-27 18:05:37.024', 'g9oqDvxmn6mshhm0OsJ9a6BPVJr0yUFQ', '2026-04-20 18:05:37.025', '2026-04-20 18:05:37.025', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('j1gI1gh07J6ErbHa9rttNkR8cCeaSrtq', '2026-04-27 18:08:42.999', 'AyHVyf3cBY0XbSnIV32a1IrxBXFpmF52', '2026-04-20 18:08:43', '2026-04-20 18:08:43', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('vkm4EIsOn9ou4C0Z7oYTDIDI0szKkNMM', '2026-04-27 18:22:51.508', 'jQB8kB3nye02NAPJdaLXmKiniOTQGcMT', '2026-04-20 18:22:51.508', '2026-04-20 18:22:51.508', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('ZE7kCUNRobEDYdyw0DYyNAntYV89HwGj', '2026-04-28 17:10:09.941', 'pn1Sk0HENX5Od7ym65Vsk7npkY28WBVP', '2026-04-21 17:10:09.941', '2026-04-21 17:10:09.941', '', '', 'YcbboQAWyQXYn6bWmo6KpljJXEqCsChD');
INSERT INTO public.session VALUES ('2jM0u3Iv7Ozn9vpW9GbY9HXPonoU75u7', '2026-04-29 08:45:06.601', 'lvQt4adchSZHKLf3SsEK7vdeVH7r3H4t', '2026-04-22 08:45:06.601', '2026-04-22 08:45:06.601', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('TUtLE4wGQfFIe2ZDFZe6jJs8ETrXhKw9', '2026-04-29 08:51:19.336', 'dKHzgwDoYMaDG2dwgX8wwbsbA6ju1pgQ', '2026-04-22 08:51:19.337', '2026-04-22 08:51:19.337', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('XyZnm9yP9EunVBiZgfuLUWoJl4nisCgx', '2026-04-29 17:13:56.696', 'T20sqTUn1OcGM5Dr32VVbaFzoqGE4rbd', '2026-04-20 20:56:51.156', '2026-04-22 17:13:56.696', '', '', 'G88hfGKKQyk1pSh0M6EjN85tynjyC9bF');
INSERT INTO public.session VALUES ('qnlf0QTbitYXW9ptjHN5h2YFlm4OXOTB', '2026-04-30 07:41:00.442', '3MMpgvzrSD9T0zaxgO5oRvbnoyWYd7Lx', '2026-04-20 18:13:04.895', '2026-04-23 07:41:00.442', '', '', 'ZCO82yz7PBk6YZi8CBjh1tKVPQ3Rq4SS');
INSERT INTO public.session VALUES ('ynmqSX8n1SpCNq1cXMK8eqG0YQu6QxAK', '2026-04-30 09:46:25.439', 'AAOBz9rEe22VH7bwo22FRQs3G9sSttDS', '2026-04-22 08:55:43.599', '2026-04-23 09:46:25.439', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('XWZenFCAEsbFTEKWTy2BuGLO6ZqYmjjb', '2026-05-05 07:31:05.853', 'UlqcsV0McivDGWXd5FfHf9KygjzEiCJt', '2026-04-20 18:11:01.292', '2026-04-28 07:31:05.853', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('ofvdNuNWwYE2YuRKh4CiHzCNtuMEhsBf', '2026-05-05 08:54:32.952', 'qdjF7zQRJgQKuNeaRRiFKioDBd30J4AO', '2026-04-28 08:54:32.964', '2026-04-28 08:54:32.965', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');
INSERT INTO public.session VALUES ('EFymvvxWjy1o2QaeBQSRb5bOgTttdOPo', '2026-05-05 08:56:09.447', 'AohIJZrjNyQkGmGzL8mz6PeBMHy9yBcd', '2026-04-28 08:56:09.448', '2026-04-28 08:56:09.448', '', '', 'Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv');


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.verification VALUES ('rhxtftAmNItY6CGDwdIUm87PmVdLAVaQ', 'reset-password:OlQntGh43LaFGjYmipmbEL4q', 'BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt', '2026-04-20 19:05:22.925', '2026-04-20 18:05:22.926', '2026-04-20 18:05:22.926');
INSERT INTO public.verification VALUES ('85i44mK5FIUVTIcIWB5axmDThcavrLa4', 'reset-password:jG2rMoFSuOQ3SjQeKrbhCVN6', 'BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt', '2026-04-20 19:14:27.718', '2026-04-20 18:14:27.718', '2026-04-20 18:14:27.718');
INSERT INTO public.verification VALUES ('37tgVd3UC3RzRKFdjs58joPJUuTptjx0', 'reset-password:9Q1BI5dA2shq3BvVQT11fzld', 'BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt', '2026-04-20 21:56:17.54', '2026-04-20 20:56:17.541', '2026-04-20 20:56:17.541');
INSERT INTO public.verification VALUES ('qZIBYoKZlzxWa0RDMfPhpShR2Op7gVWe', 'reset-password:DNFWLqEn02d8KGPvrhg3pJ7C', 'BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt', '2026-04-21 18:17:30.843', '2026-04-21 17:17:30.852', '2026-04-21 17:17:30.852');


--
-- PostgreSQL database dump complete
--

\unrestrict wrAvXkYAc16Ec2tcISrljoulUmVWnSgLTSCXAOxICo3qgj4h2PkwUNBTMK2uvtb

