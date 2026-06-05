--
-- PostgreSQL database dump
--

\restrict JP8A8DftBQzG6EperO05QBzaZZTSLO87Qr3Etnx79s605LXsgwxiSMGajCSoqCW

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1.pgdg13+1)

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
-- Name: AnnouncementStatus; Type: TYPE; Schema: public; Owner: agdi
--

CREATE TYPE public."AnnouncementStatus" AS ENUM (
    'PENDING',
    'PUBLISHED',
    'REJECTED'
);


ALTER TYPE public."AnnouncementStatus" OWNER TO agdi;

--
-- Name: AnnouncementType; Type: TYPE; Schema: public; Owner: agdi
--

CREATE TYPE public."AnnouncementType" AS ENUM (
    'FUNERAL',
    'ANNIVERSARY',
    'THANKS',
    'OTHER',
    'DEATH_NOTICE'
);


ALTER TYPE public."AnnouncementType" OWNER TO agdi;

--
-- Name: BannerType; Type: TYPE; Schema: public; Owner: agdi
--

CREATE TYPE public."BannerType" AS ENUM (
    'COLOR',
    'GRADIENT',
    'PHOTO'
);


ALTER TYPE public."BannerType" OWNER TO agdi;

--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: agdi
--

CREATE TYPE public."MediaType" AS ENUM (
    'IMAGE',
    'DOCUMENT',
    'OTHER'
);


ALTER TYPE public."MediaType" OWNER TO agdi;

--
-- Name: OfferingType; Type: TYPE; Schema: public; Owner: agdi
--

CREATE TYPE public."OfferingType" AS ENUM (
    'FLOWER',
    'CANDLE'
);


ALTER TYPE public."OfferingType" OWNER TO agdi;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: agdi
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'MODERATOR',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO agdi;

--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: agdi
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELED'
);


ALTER TYPE public."TransactionStatus" OWNER TO agdi;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: agdi
--

CREATE TYPE public."TransactionType" AS ENUM (
    'DONATION',
    'WITHDRAWAL',
    'REFUND'
);


ALTER TYPE public."TransactionType" OWNER TO agdi;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: agdi
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'BANNED'
);


ALTER TYPE public."UserStatus" OWNER TO agdi;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Announcement; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public."Announcement" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "isAnonymous" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text,
    "ceremonyDate" timestamp(3) without time zone,
    "ceremonyLocation" text,
    "deceasedBirthDate" timestamp(3) without time zone,
    "deceasedDeathDate" timestamp(3) without time zone NOT NULL,
    "deceasedName" text NOT NULL,
    type public."AnnouncementType" NOT NULL,
    status public."AnnouncementStatus" DEFAULT 'PENDING'::public."AnnouncementStatus" NOT NULL,
    events jsonb,
    relationship text,
    "bannerCustomUrl" text,
    "bannerPresetId" text,
    "deceasedPhotoUrl" text,
    "deceasedBirthPlace" text,
    "deceasedPronoun" text
);


ALTER TABLE public."Announcement" OWNER TO agdi;

--
-- Name: BannerPreset; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public."BannerPreset" (
    id text NOT NULL,
    name text NOT NULL,
    type public."BannerType" NOT NULL,
    "imageUrl" text NOT NULL,
    "thumbnailUrl" text,
    category text,
    "isActive" boolean DEFAULT true NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BannerPreset" OWNER TO agdi;

--
-- Name: Condolence; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public."Condolence" (
    id text NOT NULL,
    message text NOT NULL,
    "isAnonymous" boolean DEFAULT false NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "announcementId" text NOT NULL
);


ALTER TABLE public."Condolence" OWNER TO agdi;

--
-- Name: Donation; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public."Donation" (
    id text NOT NULL,
    amount double precision NOT NULL,
    message text,
    "isAnonymous" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "announcementId" text NOT NULL,
    "transactionId" text NOT NULL
);


ALTER TABLE public."Donation" OWNER TO agdi;

--
-- Name: Media; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public."Media" (
    id text NOT NULL,
    url text NOT NULL,
    type public."MediaType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "announcementId" text NOT NULL
);


ALTER TABLE public."Media" OWNER TO agdi;

--
-- Name: Offering; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public."Offering" (
    id text NOT NULL,
    type public."OfferingType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "announcementId" text NOT NULL
);


ALTER TABLE public."Offering" OWNER TO agdi;

--
-- Name: Profile; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public."Profile" (
    id text NOT NULL,
    "phoneNumber" text,
    address text,
    country text,
    city text,
    "userId" text NOT NULL
);


ALTER TABLE public."Profile" OWNER TO agdi;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    type public."TransactionType" NOT NULL,
    amount double precision NOT NULL,
    currency text DEFAULT 'XAF'::text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "walletId" text,
    status public."TransactionStatus" DEFAULT 'PENDING'::public."TransactionStatus" NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO agdi;

--
-- Name: Wallet; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public."Wallet" (
    id text NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    currency text DEFAULT 'XAF'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Wallet" OWNER TO agdi;

--
-- Name: account; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public.account (
    id text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp(3) without time zone,
    "refreshTokenExpiresAt" timestamp(3) without time zone,
    scope text,
    password text,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.account OWNER TO agdi;

--
-- Name: session; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public.session (
    id text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL
);


ALTER TABLE public.session OWNER TO agdi;

--
-- Name: user; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public."user" (
    id text NOT NULL,
    email text NOT NULL,
    password text,
    name text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "phoneNumber" text,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL
);


ALTER TABLE public."user" OWNER TO agdi;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: agdi
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone
);


ALTER TABLE public.verification OWNER TO agdi;

--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public."Announcement" (id, title, description, "isAnonymous", "createdAt", "updatedAt", "userId", "ceremonyDate", "ceremonyLocation", "deceasedBirthDate", "deceasedDeathDate", "deceasedName", type, status, events, relationship, "bannerCustomUrl", "bannerPresetId", "deceasedPhotoUrl", "deceasedBirthPlace", "deceasedPronoun") FROM stdin;
cmo6coo9s0001p801evdjm5b7	Test Prod	Test Prod Test Prod Test Prod Test Prod	f	2026-04-19 22:41:29.824	2026-04-19 22:49:09.144	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	\N	\N	1966-03-28 00:00:00	2026-04-17 00:00:00	Test	FUNERAL	REJECTED	"[{\\"date\\":{\\"from\\":\\"2026-04-16\\",\\"to\\":\\"2026-05-21\\"},\\"name\\":\\"Test\\",\\"location\\":\\"Douala, Cameroon\\"},{\\"date\\":{\\"from\\":\\"2026-04-07\\",\\"to\\":\\"2026-04-26\\"},\\"name\\":\\"Test test\\",\\"location\\":\\"Yagoua, Cameroon\\"}]"	Other	\N	color-sky-blue	\N	Douala, Cameroon	M.
cmo6cxw340001o901u1ef23vr	Test test	Test Test Test Test Test	f	2026-04-19 22:48:39.855	2026-04-19 22:49:11.539	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	\N	\N	1966-03-29 00:00:00	2026-04-15 00:00:00	Test	THANKS	REJECTED	"[{\\"date\\":{\\"from\\":\\"2026-04-08\\",\\"to\\":\\"2026-04-19\\"},\\"name\\":\\"Teadaasd\\",\\"location\\":\\"Bafoussam, Cameroon\\"}]"	Other	\N	color-sunset-orange	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776638919319_file-y366gpr4n6	Dschang, Cameroon	M.
cmo9ttq1f000vo901visxpw7o	En mémoire de Guy Adna	La grande Famille Adna à la douleur d'annoncer le de Guy Adna, Né à Douala le 01 janvier 1960\r\nDécédé à  Yaoundé le 01 janvier 2000	f	2026-04-22 09:04:37.39	2026-04-22 11:06:27.308	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	\N	\N	1960-01-01 00:00:00	2026-04-22 00:00:00	Adna Guy	DEATH_NOTICE	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-04-23\\",\\"to\\":\\"2026-05-23\\"},\\"name\\":\\"Veillée \\",\\"location\\":\\"elicimOAu D\\"}]"	Famille	\N	\N	\N	Yaoundé, Cameroon	M.
cmo91hw9c000ro901249opw35	En mémoire de NKEN Martin	Nous avons la douleur d'annoncer le décès de notre grand-père: Nken Martin décédé le 1 juin de suite de maladie	f	2026-04-21 19:51:36.336	2026-04-22 11:06:40.631	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	\N	\N	1966-04-01 00:00:00	2026-04-21 00:00:00	NKEN Martin	DEATH_NOTICE	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-04-28\\",\\"to\\":\\"\\"},\\"name\\":\\"Veillée sans corps\\",\\"location\\":\\"Douala, Cameroon\\"}]"	Petite-fille	\N	color-mint-green	\N	\N	M.
cmo8x1i41000po901fro1yhm9	Remerciements	Une grand merci  a vous tous, profondément touché par les marques d'affection et d'amitié que vous nous avez témoignées lors du decès 	f	2026-04-21 17:46:53.041	2026-04-22 11:06:47.821	YcbboQAWyQXYn6bWmo6KpljJXEqCsChD	\N	\N	\N	2026-04-01 00:00:00	Jean-francois AMULET	THANKS	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-05-01\\",\\"to\\":\\"\\"},\\"name\\":\\"enterrement\\",\\"location\\":\\"Logan Village, Australia\\"}]"	beau-frère	\N	\N	\N	\N	\N
cmo8wrlmd000no901inlri13w	meilleur ami	notre cher ami, ton amour dans nos coeurs	f	2026-04-21 17:39:11.025	2026-04-22 11:06:58.125	YcbboQAWyQXYn6bWmo6KpljJXEqCsChD	\N	\N	1966-04-30 00:00:00	2026-04-07 00:00:00	Emile JACOB	FUNERAL	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-04-28\\",\\"to\\":\\"\\"},\\"name\\":\\"enterrement\\",\\"location\\":\\"Logan Village, Australia\\"}]"	Ami	\N	color-coral-red	\N	\N	\N
cmo70bnos0007o901d9becrmp	En memoire de Tjeka Madeleine	Ma chère Tante,\nTu nous manques \n	f	2026-04-20 09:43:13.324	2026-04-22 11:10:43.397	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	\N	\N	1933-04-01 00:00:00	1995-02-02 00:00:00	TJEKA MADELEINE	FUNERAL	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-04-25\\",\\"to\\":\\"\\"},\\"name\\":\\"Veillée \\",\\"location\\":\\"Douala\\"}]"	Nièce 	\N	gradient-sunset	\N	\N	\N
cmo8wjicc000lo901lvt8ybni	mon grand-frère	besoin d'honoré notre frère qui nous a quitté	f	2026-04-21 17:32:53.532	2026-04-22 11:10:49.913	YcbboQAWyQXYn6bWmo6KpljJXEqCsChD	\N	\N	\N	2008-04-25 00:00:00	Claude EITEL	ANNIVERSARY	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-04-25\\",\\"to\\":\\"\\"},\\"name\\":\\"Village\\",\\"location\\":\\"NJOCK\\"}]"	Frere / Soeur	\N	color-sunset-orange	\N	\N	\N
cmo8w8389000fo9019d7gxrcu	Decès du beau-frère	C’est avec une profonde tristesse que nous vous faisons part du décès de Henri BALSO survenu le 17 à l’âge de 75.\r\n\r\nSes obsèques auront lieu le 28 avril à Metz.	f	2026-04-21 17:24:00.729	2026-04-22 11:10:56.827	YcbboQAWyQXYn6bWmo6KpljJXEqCsChD	\N	\N	\N	2026-04-17 00:00:00	Henri BALSO	FUNERAL	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-04-27\\",\\"to\\":\\"\\"},\\"name\\":\\"Avis de décès\\",\\"location\\":\\"Matez\\"}]"	beau-frère	\N	\N	\N	\N	M.
cmoa9k46z000zo901mao7dhnc	Merci	Nous tenions à vous remercier du fond du cœur pour votre soutien lors du départ de Monsieur Elong Joseph.\r\n\r\nVotre présence à nos côtés le 04 avril dernier ainsi que vos mots de réconfort nous ont été d'une aide précieuse pour traverser cette épreuve. Savoir Joseph si entouré et apprécié est une grande consolation pour nous tous.\r\n\r\nAvec toute notre amitié et notre reconnaissance,\r\nLa famille Elong	f	2026-04-22 16:25:03.034	2026-04-22 16:25:29.936	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	\N	\N	1966-04-04 00:00:00	2026-03-02 00:00:00	Elong Joseph	THANKS	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-04-04\\",\\"to\\":\\"\\"},\\"name\\":\\"Inhumation\\",\\"location\\":\\"Kumba, Cameroon\\"}]"	La famille	\N	\N	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776875102102_file-29xbpik5ixt	Kumba, Cameroon	M.
cmo7icagd0009o901ska3kxp2	Test Connexion	Test Test Connexion Test	f	2026-04-20 18:07:35.916	2026-04-22 16:52:48.319	ZCO82yz7PBk6YZi8CBjh1tKVPQ3Rq4SS	\N	\N	1966-03-29 00:00:00	2026-04-17 00:00:00	Test	ANNIVERSARY	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-03-31\\",\\"to\\":\\"2026-04-26\\"},\\"name\\":\\"Test\\",\\"location\\":\\"Fuentestrún, Spain\\"}]"	Autre	\N	\N	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776708449712_file-ha806etrcf	Douala, Cameroon	M.
cmoab6rtq0019o901duzt3olt	Repose en paix	« Celui qui croit en moi vivra, quand bien même il mourrait. »\r\n\r\nLa grande famille Kameni, les familles alliées et les proches ont la profonde douleur d'annoncer le décès de leur regrettée :\r\n\r\nMadame Kameni Elisabeth\r\nSurvenu à Bafou.\r\n\r\nEn cette douloureuse circonstance, la famille vous convie à vous joindre à elle pour un moment de recueillement et d'hommage.	f	2026-04-22 17:10:39.71	2026-04-22 17:11:13.994	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	\N	\N	1968-03-06 00:00:00	2026-04-13 00:00:00	Kameni Elisabeth	DEATH_NOTICE	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-04-22\\",\\"to\\":\\"2026-05-14\\"},\\"name\\":\\"Veillée sans corps\\",\\"location\\":\\"Au domicile familliale à Bafoussam\\"},{\\"date\\":{\\"from\\":\\"2026-05-15\\",\\"to\\":\\"\\"},\\"name\\":\\"Levée de Corps\\",\\"location\\":\\"Hôpital de Bafoussam\\"},{\\"date\\":{\\"from\\":\\"2026-05-16\\",\\"to\\":\\"\\"},\\"name\\":\\"Inhumation\\",\\"location\\":\\"Bafoussam, Cameroon\\"}]"	Parent	\N	\N	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776877838677_file-w2ej27sxu5	Bafoussam, Cameroon	Mme
cmoac3mxf001ho901hz7ip5h7	Doux repos	« C’est à Dieu que nous appartenons et c’est à Lui que nous retournons. »\r\n\r\nLa communauté Souledé,\r\nLa grande famille Mohammadou,\r\nSes fils et filles,\r\nSes petits-fils et arrière-petits-fils,\r\nLes familles alliées et amies,\r\n\r\nOnt la profonde douleur d'annoncer à leurs parents, amis et connaissances, le rappel à Dieu de leur Patriarche :\r\n\r\nMOHAMMADOU BILAL\r\nSurvenu le 21 avril à Souledé, à l’âge de 80 ans.\r\n\r\nLe Patriarche Mohammadou Bilal laisse derrière lui le souvenir d'un homme de sagesse, pilier de sa communauté et guide pour sa descendance.	f	2026-04-22 17:36:13.01	2026-04-22 17:36:35.129	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	\N	\N	1946-07-17 00:00:00	2026-04-21 00:00:00	Mouhammadou Bilal	DEATH_NOTICE	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2026-04-23\\",\\"to\\":\\"\\"},\\"name\\":\\"Inhumation\\",\\"location\\":\\"Souledé\\"}]"	Parent	\N	\N	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776879371509_file-xzjamg3cr1	Souledé	M.
cmob802j50001o9018ynifbug	In Memoriam	"Le temps passe, mais le souvenir reste."\r\n\r\nDéjà six ans que s'est endormie dans la paix du Seigneur, le [Date exacte du décès] 2020 à Edea, notre regrettée mère, grand-mère et sœur :\r\n\r\nMadame ESSOMBA Marie-Lou\r\nDécédée à l’âge de 70 ans\r\n\r\nEn ce jour anniversaire, ses enfants résidant à Yaoundé, Londres et Nairobi, ainsi que ses petits-enfants et les familles alliées, renouvellent leurs prières pour le repos éternel de son âme.\r\n\r\nMaman Marie-Lou, ton départ a laissé un immense vide, mais la sagesse et l'amour que tu nous as transmis continuent de guider nos pas à travers le monde. Que ton sourire et ta bienveillance demeurent à jamais dans nos cœurs.\r\n\r\nQue tous ceux qui l'ont connue et aimée aient une pensée pieuse pour elle en ce jour.\r\n\r\n« Je ne suis pas loin, juste de l'autre côté du chemin. »	f	2026-04-23 08:29:14.146	2026-04-23 08:29:43.66	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	\N	\N	\N	2020-04-22 00:00:00	Essomba Marie-Lou	ANNIVERSARY	PUBLISHED	"[{\\"date\\":{\\"from\\":\\"2020-04-22\\",\\"to\\":\\"2026-04-22\\"},\\"name\\":\\"En souvenir\\",\\"location\\":\\"Yaoundé, Cameroon\\"}]"	Les Enfants	\N	\N	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776932952615_file-ddxxbtz9i0j	\N	Mme
\.


--
-- Data for Name: BannerPreset; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public."BannerPreset" (id, name, type, "imageUrl", "thumbnailUrl", category, "isActive", "displayOrder", "createdAt", "updatedAt") FROM stdin;
color-coral-red	Coral Red	COLOR	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620595564_colors/coral-red.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620595711_colors/thumbs/coral-red.webp	Warm	t	1	2026-04-19 17:43:21.378	2026-04-19 17:43:21.378
color-sunset-orange	Sunset Orange	COLOR	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620595875_colors/sunset-orange.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596025_colors/thumbs/sunset-orange.webp	Warm	t	2	2026-04-19 17:43:21.969	2026-04-19 17:43:21.969
color-soft-pink	Soft Pink	COLOR	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596166_colors/soft-pink.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596264_colors/thumbs/soft-pink.webp	Warm	t	3	2026-04-19 17:43:22.301	2026-04-19 17:43:22.301
color-warm-beige	Warm Beige	COLOR	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596465_colors/warm-beige.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596680_colors/thumbs/warm-beige.webp	Neutral	t	4	2026-04-19 17:43:22.581	2026-04-19 17:43:22.581
color-ocean-blue	Ocean Blue	COLOR	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620596923_colors/ocean-blue.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620597069_colors/thumbs/ocean-blue.webp	Cool	t	5	2026-04-19 17:43:22.904	2026-04-19 17:43:22.904
color-sky-blue	Sky Blue	COLOR	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620597214_colors/sky-blue.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620597450_colors/thumbs/sky-blue.webp	Cool	t	6	2026-04-19 17:43:23.217	2026-04-19 17:43:23.217
color-mint-green	Mint Green	COLOR	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620597666_colors/mint-green.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620597866_colors/thumbs/mint-green.webp	Cool	t	7	2026-04-19 17:43:23.504	2026-04-19 17:43:23.504
color-lavender	Lavender	COLOR	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620598095_colors/lavender.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620598266_colors/thumbs/lavender.webp	Cool	t	8	2026-04-19 17:43:23.866	2026-04-19 17:43:23.866
gradient-ocean	Ocean Depths	GRADIENT	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620598495_gradients/ocean.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620598665_gradients/thumbs/ocean.webp	\N	t	1	2026-04-19 17:43:24.104	2026-04-19 17:43:24.104
gradient-sunset	Sunset Glow	GRADIENT	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620598809_gradients/sunset.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599021_gradients/thumbs/sunset.webp	\N	t	2	2026-04-19 17:43:24.469	2026-04-19 17:43:24.469
gradient-purple-dream	Purple Dream	GRADIENT	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599169_gradients/purple-dream.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599310_gradients/thumbs/purple-dream.webp	\N	t	3	2026-04-19 17:43:24.787	2026-04-19 17:43:24.787
gradient-forest	Forest Mist	GRADIENT	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599545_gradients/forest.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599766_gradients/thumbs/forest.webp	\N	t	4	2026-04-19 17:43:25.102	2026-04-19 17:43:25.102
gradient-rose	Rose Garden	GRADIENT	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620599965_gradients/rose.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620600170_gradients/thumbs/rose.webp	\N	t	5	2026-04-19 17:43:25.419	2026-04-19 17:43:25.419
gradient-autumn	Autumn Leaves	GRADIENT	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620600709_gradients/autumn.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620600865_gradients/thumbs/autumn.webp	\N	t	7	2026-04-19 17:43:26.067	2026-04-19 17:43:26.067
gradient-midnight	Midnight Sky	GRADIENT	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620600366_gradients/midnight.webp	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776620600591_gradients/thumbs/midnight.webp	\N	t	6	2026-04-19 17:43:25.68	2026-04-22 11:24:10.188
\.


--
-- Data for Name: Condolence; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public."Condolence" (id, message, "isAnonymous", "isApproved", "createdAt", "updatedAt", "userId", "announcementId") FROM stdin;
cmoac4tzk001po901un641t4o	Tu vas nous manquer 	f	f	2026-04-22 17:37:08.73	2026-04-22 17:37:08.73	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmoab6rtq0019o901duzt3olt
cmoac78bt001ro901rikodxqq	Adieu mon ami !	f	f	2026-04-22 17:39:00.713	2026-04-22 17:39:00.713	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmo9ttq1f000vo901visxpw7o
cmoac7jin001to901q1id8aet	Mes sincères condoléances à la famille. Avec toute ma compassion.\nThierry.	f	t	2026-04-22 17:39:15.215	2026-04-22 17:40:35.628	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmoac3mxf001ho901hz7ip5h7
cmoach67b0023o901qc1k76vm	Tu vas nous manquer ! \nTu as une grand-mère aimable	f	f	2026-04-22 17:46:44.519	2026-04-22 17:46:44.519	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmoab6rtq0019o901duzt3olt
cmoaclwhp002bo901t43puncq	\nCest avec beaucoup de tristesse que j'ai appris ton décès. Je suis affligée. \nDoux repos mon ami d'enfance. 	f	f	2026-04-22 17:50:25.213	2026-04-22 17:50:25.213	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmo8wrlmd000no901inlri13w
cmoaiotfo002do901zlsxo33a	Mes sincères condoléances . Que la terre de nos ancêtres lui soit légère.\nThierry	f	t	2026-04-22 20:40:38.916	2026-04-22 20:41:15.922	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmoab6rtq0019o901duzt3olt
\.


--
-- Data for Name: Donation; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public."Donation" (id, amount, message, "isAnonymous", "createdAt", "userId", "announcementId", "transactionId") FROM stdin;
\.


--
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public."Media" (id, url, type, "createdAt", "announcementId") FROM stdin;
cmo6cxw4t0003o9011h8t24rz	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776638919347_file-7kf6w83zymn	IMAGE	2026-04-19 22:48:39.918	cmo6cxw340001o901u1ef23vr
cmo6cxw4y0005o901fgg2sk8q	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776638919361_file-fwt9n0yupxf	IMAGE	2026-04-19 22:48:39.922	cmo6cxw340001o901u1ef23vr
cmo7icaii000bo9012iqoh7pq	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776708449625_file-97w6qr8auej	IMAGE	2026-04-20 18:07:35.995	cmo7icagd0009o901ska3kxp2
cmo7icaip000do901jggnpz4t	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776708449732_file-aszs3hmzmu6	IMAGE	2026-04-20 18:07:36.001	cmo7icagd0009o901ska3kxp2
cmo8w83dd000ho901xua7odi9	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776792239023_file-w20j0tvdew	IMAGE	2026-04-21 17:24:00.913	cmo8w8389000fo9019d7gxrcu
cmo8w83di000jo901mrz0xnxv	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776792239148_file-fm7jqxeoshu	IMAGE	2026-04-21 17:24:00.918	cmo8w8389000fo9019d7gxrcu
cmo91hw9v000to90166nhkdp4	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776801095060_file-tn4o4l4tey	IMAGE	2026-04-21 19:51:36.356	cmo91hw9c000ro901249opw35
cmo9ttq4y000xo901mpofvydi	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776848676008_file-v2f4za0oh4l	IMAGE	2026-04-22 09:04:37.521	cmo9ttq1f000vo901visxpw7o
cmoa9k48x0011o901c1acgi2v	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776875101913_file-1omsg7czbdj	IMAGE	2026-04-22 16:25:03.105	cmoa9k46z000zo901mao7dhnc
cmoa9k4980013o901b13thvyb	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776875102122_file-d3vd03ntpna	IMAGE	2026-04-22 16:25:03.116	cmoa9k46z000zo901mao7dhnc
cmoab6ru6001bo901sq5v9ny2	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776877838586_file-l58e356pf2m	IMAGE	2026-04-22 17:10:39.726	cmoab6rtq0019o901duzt3olt
cmoac3mxx001jo901pzyrpwky	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776879371039_file-ojy82ggq97	IMAGE	2026-04-22 17:36:13.03	cmoac3mxf001ho901hz7ip5h7
cmoac3my4001lo901sws0ci1o	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776879371720_file-typ32ibn3sl	IMAGE	2026-04-22 17:36:13.036	cmoac3mxf001ho901hz7ip5h7
cmob802m00003o9010dwvom64	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776932952428_file-z5u362rzbkk	IMAGE	2026-04-23 08:29:14.425	cmob802j50001o9018ynifbug
cmob802md0005o901fcvlwpr3	https://s3.cameroonmemoria.com/cameroonmemoria-media/1776932952817_file-dp15156ucx9	IMAGE	2026-04-23 08:29:14.437	cmob802j50001o9018ynifbug
\.


--
-- Data for Name: Offering; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public."Offering" (id, type, "createdAt", "userId", "announcementId") FROM stdin;
cmoaaims40015o901ga0pts11	CANDLE	2026-04-22 16:51:53.429	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmo9ttq1f000vo901visxpw7o
cmoaaivpv0017o901x0kt7shf	FLOWER	2026-04-22 16:52:05.011	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmo9ttq1f000vo901visxpw7o
cmoabcmwz001do901x7dpffo8	FLOWER	2026-04-22 17:15:13.283	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmoab6rtq0019o901duzt3olt
cmoabcnn0001fo9012otcu5ou	CANDLE	2026-04-22 17:15:14.22	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmoab6rtq0019o901duzt3olt
cmoac4deh001no901me1gbi61	FLOWER	2026-04-22 17:36:47.321	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmoab6rtq0019o901duzt3olt
cmoac7jod001vo901bp3fynug	FLOWER	2026-04-22 17:39:15.421	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmo9ttq1f000vo901visxpw7o
cmoac7kfs001xo9014ek12cm1	CANDLE	2026-04-22 17:39:16.409	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmo9ttq1f000vo901visxpw7o
cmoacc5vv001zo901ywr8jpq1	FLOWER	2026-04-22 17:42:50.827	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmo8x1i41000po901fro1yhm9
cmoacc6tx0021o901kn2q9juv	CANDLE	2026-04-22 17:42:52.053	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmo8x1i41000po901fro1yhm9
cmoacivq30025o9012zrqx8ss	CANDLE	2026-04-22 17:48:04.251	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmoab6rtq0019o901duzt3olt
cmoacjval0027o9013ucvbo8a	CANDLE	2026-04-22 17:48:50.349	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmo8wrlmd000no901inlri13w
cmoacjwf00029o901llzwkm3q	FLOWER	2026-04-22 17:48:51.804	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	cmo8wrlmd000no901inlri13w
cmoais7tm002fo9013mp5ekdq	CANDLE	2026-04-22 20:43:17.53	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmoab6rtq0019o901duzt3olt
cmoaitrfl002ho901elvicbxo	FLOWER	2026-04-22 20:44:29.601	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmoab6rtq0019o901duzt3olt
cmoaitu55002jo901nfsapvdx	FLOWER	2026-04-22 20:44:33.114	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmoab6rtq0019o901duzt3olt
cmob98boh0007o901v6ypagiu	FLOWER	2026-04-23 09:03:39.027	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmob802j50001o9018ynifbug
cmob98cgd0009o901mbj0bqqx	CANDLE	2026-04-23 09:03:40.045	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmob802j50001o9018ynifbug
cmobawtiz000bo901wkcw50z9	FLOWER	2026-04-23 09:50:41.531	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmoac3mxf001ho901hz7ip5h7
cmobawuu1000do901w2gghxmp	CANDLE	2026-04-23 09:50:43.226	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	cmoac3mxf001ho901hz7ip5h7
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public."Profile" (id, "phoneNumber", address, country, city, "userId") FROM stdin;
cmnyh21bx0000tll9jqc91sur	+237123456789	123 Rue de la Paix	Cameroun	Yaoundé	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public."Transaction" (id, type, amount, currency, description, "createdAt", "updatedAt", "userId", "walletId", status) FROM stdin;
\.


--
-- Data for Name: Wallet; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public."Wallet" (id, balance, currency, "createdAt", "updatedAt", "userId") FROM stdin;
cmnyh21bz0001tll9u39dky4x	0	XAF	2026-04-14 10:21:42.333	2026-04-14 10:21:42.333	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
hG0z3Dhi6ne9nWcvXW1nPXmFHbyLK8OR	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	credential	Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	\N	\N	\N	\N	\N	\N	c1443e355babcd1a7e5788cbd99e946b:f98ae35e310570027730503808264ac1079fd219dad3c1020289b54b95b710669c1c0f47dba09ee4d9a7b471cda4301c03759f5ea50d29af2523fa037e09c377	2026-04-14 10:21:42.155	2026-04-14 10:21:42.155
g6ZrBnGDZ76upmlDkDfT1j2MfczwTc6a	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	credential	G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	\N	\N	\N	\N	\N	\N	fa8afab6e2e39890a1f1383d56776f10:97fe31325f89c0d72137de612c7e6d05c6ff28fe164f3d6d56790eddce5e9d7b515ddaa03be5c5700e75c12ef95ca287195b54969fd0ca3716598f1c780c10f6	2026-04-20 09:32:34.23	2026-04-20 09:32:34.23
28XbeZquuhoBzRclEA0rxO7tQudpSMeN	BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt	credential	BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt	\N	\N	\N	\N	\N	\N	f6a148f5a64483a47ea9bc684945dae1:1204b627df20d3780b035d0b8c33888f226c5f9fd73343dd94bcd260f38aaaef977d4a3a8be886ace0f5f361d26d77178398d89d1ddc9b916a1196de75e1a657	2026-04-20 17:25:42.257	2026-04-20 17:25:42.257
PWYWGf2x7tcXVuGqVNg11AvMuwh43IFh	ZCO82yz7PBk6YZi8CBjh1tKVPQ3Rq4SS	credential	ZCO82yz7PBk6YZi8CBjh1tKVPQ3Rq4SS	\N	\N	\N	\N	\N	\N	f6327d62fa854aa50dd820375631d005:1a2124cba87dd5da0fa721df0f005d10e4a5fb191316d48373684b33388da35a341b9fe50824be72443cc7295d7b53c322cfb6afff2a32d07c3d0aa7a53dc7f4	2026-04-20 18:07:32.309	2026-04-20 18:07:32.309
tAEjoXm3WrtEteqE123tGmkBurGu7n7f	YcbboQAWyQXYn6bWmo6KpljJXEqCsChD	credential	YcbboQAWyQXYn6bWmo6KpljJXEqCsChD	\N	\N	\N	\N	\N	\N	c86550cd273f245ab72430684fd8a637:8680e569545688ffb996ae4a4e2535ee40b7da099e890188c0f5328b972e2c9db5360e29ac74f95bfba15255209724c8067754b10709e810ab41f89c5808e073	2026-04-21 17:09:59.258	2026-04-21 17:09:59.258
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") FROM stdin;
kXOi1DHOm7kIFVqdlzwSajQsOeNAerCX	2026-04-21 17:02:03.748	HufBXEsJKjD8PnpkYCl6rjGksiRUQVGe	2026-04-14 17:02:03.751	2026-04-14 17:02:03.751			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
SoO30H696OtSoPZowJqVAm8dlsFMQOGr	2026-04-23 16:33:55.21	utKyMaSH0LPb2GgPQ9AYeT9ZoXpFVupX	2026-04-16 16:33:55.238	2026-04-16 16:33:55.238			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
ikHMnUOdevofaLL28XBAq1MPuqvyPlth	2026-04-26 15:50:30.404	GpkSMCMO9Gj0hToKEAoUHrB2WungAU0N	2026-04-19 15:50:30.451	2026-04-19 15:50:30.451			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
hbSAhIY2zqKAfGJHgxcJ2w4CIwvsxhhG	2026-04-26 19:16:13.055	0zkWJhmepsNJqg7qh7euCPJ5yrqPJQFN	2026-04-19 19:16:13.056	2026-04-19 19:16:13.056			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
LEimJDJUxJ69i3AmOCDZguGr9sHDiRA5	2026-04-26 20:00:34.429	BnUbWf8XClvPrhn8SmHDvZAIqsioYWJs	2026-04-19 20:00:34.433	2026-04-19 20:00:34.433			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
XZbQi46o6BVmJd45MTwU3O4e7Bb01XdE	2026-04-26 20:00:54.71	fJOgO6xPgpOuafhQyVtIRej82yKWUpQz	2026-04-19 20:00:54.711	2026-04-19 20:00:54.711			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
BWVGTToLqHWbdVDL1q1ASEpG52C1bYYj	2026-04-26 22:17:29.045	wQ8XoMw16AqjcHZigx0eZ0egPUyIuWyA	2026-04-19 22:17:29.047	2026-04-19 22:17:29.047			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
Fg6BXytj3DXWDEmpgRIu9yv8qQO4eE6N	2026-04-27 09:33:16.552	ssRfh8eXNtZLFMFfoNsmQscRiMHKIMrB	2026-04-20 09:33:16.552	2026-04-20 09:33:16.552			G88hfGKKQyk1pSh0M6EjN85tynjyC9bF
CaT4dzrbXJQYFEs0dWIYw0rXWXJY7nqt	2026-04-27 17:21:59.423	zVdVpLPmOPUoZrPBt4JAnUswTrydfEP1	2026-04-20 17:21:59.44	2026-04-20 17:21:59.44			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
G1V8JuF07NX9PNo44Q914EQxc5evLI4A	2026-04-27 17:26:59.457	ZgvlxQzHQzjSyXjKbOFhGtXhqK2ml1pF	2026-04-20 17:26:59.457	2026-04-20 17:26:59.457			BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt
cNZMUqqjTnknvyVFcJOz0dElJAiaUubD	2026-04-27 17:59:35.956	mxrOwE1B4t4FbWld7KwYXb86vYVhPjiE	2026-04-20 17:59:35.956	2026-04-20 17:59:35.956			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
bBy6qeZubWAHdgzH2e9aU5BQiMAmRJ6x	2026-04-27 18:03:42.335	8ZR1Dkd3BmBWkwjGNvJpyMAbKjY4ZJEH	2026-04-20 18:03:42.335	2026-04-20 18:03:42.335			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
G1JVwEjgMTRgvwxJm63GdisGn2PzMiL5	2026-04-27 18:05:37.024	g9oqDvxmn6mshhm0OsJ9a6BPVJr0yUFQ	2026-04-20 18:05:37.025	2026-04-20 18:05:37.025			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
j1gI1gh07J6ErbHa9rttNkR8cCeaSrtq	2026-04-27 18:08:42.999	AyHVyf3cBY0XbSnIV32a1IrxBXFpmF52	2026-04-20 18:08:43	2026-04-20 18:08:43			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
vkm4EIsOn9ou4C0Z7oYTDIDI0szKkNMM	2026-04-27 18:22:51.508	jQB8kB3nye02NAPJdaLXmKiniOTQGcMT	2026-04-20 18:22:51.508	2026-04-20 18:22:51.508			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
ZE7kCUNRobEDYdyw0DYyNAntYV89HwGj	2026-04-28 17:10:09.941	pn1Sk0HENX5Od7ym65Vsk7npkY28WBVP	2026-04-21 17:10:09.941	2026-04-21 17:10:09.941			YcbboQAWyQXYn6bWmo6KpljJXEqCsChD
2jM0u3Iv7Ozn9vpW9GbY9HXPonoU75u7	2026-04-29 08:45:06.601	lvQt4adchSZHKLf3SsEK7vdeVH7r3H4t	2026-04-22 08:45:06.601	2026-04-22 08:45:06.601			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
TUtLE4wGQfFIe2ZDFZe6jJs8ETrXhKw9	2026-04-29 08:51:19.336	dKHzgwDoYMaDG2dwgX8wwbsbA6ju1pgQ	2026-04-22 08:51:19.337	2026-04-22 08:51:19.337			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
XyZnm9yP9EunVBiZgfuLUWoJl4nisCgx	2026-04-29 17:13:56.696	T20sqTUn1OcGM5Dr32VVbaFzoqGE4rbd	2026-04-20 20:56:51.156	2026-04-22 17:13:56.696			G88hfGKKQyk1pSh0M6EjN85tynjyC9bF
qnlf0QTbitYXW9ptjHN5h2YFlm4OXOTB	2026-04-30 07:41:00.442	3MMpgvzrSD9T0zaxgO5oRvbnoyWYd7Lx	2026-04-20 18:13:04.895	2026-04-23 07:41:00.442			ZCO82yz7PBk6YZi8CBjh1tKVPQ3Rq4SS
ynmqSX8n1SpCNq1cXMK8eqG0YQu6QxAK	2026-04-30 09:46:25.439	AAOBz9rEe22VH7bwo22FRQs3G9sSttDS	2026-04-22 08:55:43.599	2026-04-23 09:46:25.439			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
XWZenFCAEsbFTEKWTy2BuGLO6ZqYmjjb	2026-05-05 07:31:05.853	UlqcsV0McivDGWXd5FfHf9KygjzEiCJt	2026-04-20 18:11:01.292	2026-04-28 07:31:05.853			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
ofvdNuNWwYE2YuRKh4CiHzCNtuMEhsBf	2026-05-05 08:54:32.952	qdjF7zQRJgQKuNeaRRiFKioDBd30J4AO	2026-04-28 08:54:32.964	2026-04-28 08:54:32.965			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
EFymvvxWjy1o2QaeBQSRb5bOgTttdOPo	2026-05-05 08:56:09.447	AohIJZrjNyQkGmGzL8mz6PeBMHy9yBcd	2026-04-28 08:56:09.448	2026-04-28 08:56:09.448			Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public."user" (id, email, password, name, role, "createdAt", "updatedAt", "emailVerified", image, "phoneNumber", status) FROM stdin;
Nzlt7CMpx2elvPGBrwG5tJNd3aMxiXcv	admin@cameroonmemoria.com	b83e80f5bb9229d752daf4f1adbf12bb:9ff7da4de87e3e36e62227303eb14f1479ff9004aba14024a45e896bdba464a3c97777277ba25bbea328f8382de779806d6c75f860177bbec0a1123956528f79	Adminatreur	ADMIN	2026-04-14 10:21:41.975	2026-04-14 10:21:42.333	f	\N	\N	ACTIVE
G88hfGKKQyk1pSh0M6EjN85tynjyC9bF	ngobiba1@yahoo.fr	\N	NGO BIBA	USER	2026-04-20 09:32:33.956	2026-04-20 09:32:34.249	f	\N	+237698417607	ACTIVE
BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt	batoum5@gmail.com	\N	thierry batoum	USER	2026-04-20 17:25:42.227	2026-04-20 17:25:42.227	f	\N	\N	ACTIVE
ZCO82yz7PBk6YZi8CBjh1tKVPQ3Rq4SS	test@user.com	\N	Test User	USER	2026-04-20 18:07:32.297	2026-04-20 18:13:18.721	f	\N	\N	ACTIVE
YcbboQAWyQXYn6bWmo6KpljJXEqCsChD	n_fereol@yahoo.fr	\N	Féréol NYOUNAI BOUMTJE	USER	2026-04-21 17:09:59.118	2026-04-21 17:09:59.327	f	\N	+237+33677049536	ACTIVE
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: agdi
--

COPY public.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
rhxtftAmNItY6CGDwdIUm87PmVdLAVaQ	reset-password:OlQntGh43LaFGjYmipmbEL4q	BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt	2026-04-20 19:05:22.925	2026-04-20 18:05:22.926	2026-04-20 18:05:22.926
85i44mK5FIUVTIcIWB5axmDThcavrLa4	reset-password:jG2rMoFSuOQ3SjQeKrbhCVN6	BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt	2026-04-20 19:14:27.718	2026-04-20 18:14:27.718	2026-04-20 18:14:27.718
37tgVd3UC3RzRKFdjs58joPJUuTptjx0	reset-password:9Q1BI5dA2shq3BvVQT11fzld	BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt	2026-04-20 21:56:17.54	2026-04-20 20:56:17.541	2026-04-20 20:56:17.541
qZIBYoKZlzxWa0RDMfPhpShR2Op7gVWe	reset-password:DNFWLqEn02d8KGPvrhg3pJ7C	BCZkr1soNHEXLlOqcVvzDtdqnNaC7rNt	2026-04-21 18:17:30.843	2026-04-21 17:17:30.852	2026-04-21 17:17:30.852
\.


--
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- Name: BannerPreset BannerPreset_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."BannerPreset"
    ADD CONSTRAINT "BannerPreset_pkey" PRIMARY KEY (id);


--
-- Name: Condolence Condolence_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Condolence"
    ADD CONSTRAINT "Condolence_pkey" PRIMARY KEY (id);


--
-- Name: Donation Donation_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_pkey" PRIMARY KEY (id);


--
-- Name: Media Media_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_pkey" PRIMARY KEY (id);


--
-- Name: Offering Offering_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Offering"
    ADD CONSTRAINT "Offering_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: Wallet Wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_pkey" PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: BannerPreset_isActive_category_displayOrder_idx; Type: INDEX; Schema: public; Owner: agdi
--

CREATE INDEX "BannerPreset_isActive_category_displayOrder_idx" ON public."BannerPreset" USING btree ("isActive", category, "displayOrder");


--
-- Name: BannerPreset_isActive_type_displayOrder_idx; Type: INDEX; Schema: public; Owner: agdi
--

CREATE INDEX "BannerPreset_isActive_type_displayOrder_idx" ON public."BannerPreset" USING btree ("isActive", type, "displayOrder");


--
-- Name: Donation_transactionId_key; Type: INDEX; Schema: public; Owner: agdi
--

CREATE UNIQUE INDEX "Donation_transactionId_key" ON public."Donation" USING btree ("transactionId");


--
-- Name: Profile_userId_key; Type: INDEX; Schema: public; Owner: agdi
--

CREATE UNIQUE INDEX "Profile_userId_key" ON public."Profile" USING btree ("userId");


--
-- Name: Wallet_userId_key; Type: INDEX; Schema: public; Owner: agdi
--

CREATE UNIQUE INDEX "Wallet_userId_key" ON public."Wallet" USING btree ("userId");


--
-- Name: session_token_key; Type: INDEX; Schema: public; Owner: agdi
--

CREATE UNIQUE INDEX session_token_key ON public.session USING btree (token);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: agdi
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: user_phoneNumber_key; Type: INDEX; Schema: public; Owner: agdi
--

CREATE UNIQUE INDEX "user_phoneNumber_key" ON public."user" USING btree ("phoneNumber");


--
-- Name: Announcement Announcement_bannerPresetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_bannerPresetId_fkey" FOREIGN KEY ("bannerPresetId") REFERENCES public."BannerPreset"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Announcement Announcement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Condolence Condolence_announcementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Condolence"
    ADD CONSTRAINT "Condolence_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES public."Announcement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Condolence Condolence_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Condolence"
    ADD CONSTRAINT "Condolence_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Donation Donation_announcementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES public."Announcement"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Donation Donation_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public."Transaction"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Donation Donation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Media Media_announcementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES public."Announcement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Offering Offering_announcementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Offering"
    ADD CONSTRAINT "Offering_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES public."Announcement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Offering Offering_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Offering"
    ADD CONSTRAINT "Offering_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Profile Profile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transaction Transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Wallet"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Wallet Wallet_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agdi
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict JP8A8DftBQzG6EperO05QBzaZZTSLO87Qr3Etnx79s605LXsgwxiSMGajCSoqCW

