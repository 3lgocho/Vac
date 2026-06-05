--
-- PostgreSQL database dump
--

\restrict KZRRd5H8k0codeBcBN35gid8a0JamdFclQJw3u10fIYKyaZoDqQ4n3kgUgHW3J5

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
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: catalogo_biologicos; Type: TABLE; Schema: public; Owner: vac_admin
--

CREATE TABLE public.catalogo_biologicos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true
);


ALTER TABLE public.catalogo_biologicos OWNER TO vac_admin;

--
-- Name: catalogo_biologicos_id_seq; Type: SEQUENCE; Schema: public; Owner: vac_admin
--

ALTER TABLE public.catalogo_biologicos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.catalogo_biologicos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: esquema_dosis; Type: TABLE; Schema: public; Owner: vac_admin
--

CREATE TABLE public.esquema_dosis (
    id integer NOT NULL,
    biologico_id integer,
    nombre_dosis character varying(20) NOT NULL,
    orden_aplicacion integer NOT NULL
);


ALTER TABLE public.esquema_dosis OWNER TO vac_admin;

--
-- Name: esquema_dosis_id_seq; Type: SEQUENCE; Schema: public; Owner: vac_admin
--

ALTER TABLE public.esquema_dosis ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.esquema_dosis_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: lotes_biologicos; Type: TABLE; Schema: public; Owner: vac_admin
--

CREATE TABLE public.lotes_biologicos (
    id integer NOT NULL,
    nombre_biologico character varying(100) NOT NULL,
    numero_lote character varying(50) NOT NULL,
    fecha_vencimiento date NOT NULL,
    dosis_disponibles integer DEFAULT 0 NOT NULL,
    estado character varying(20) DEFAULT 'Activo'::character varying
);


ALTER TABLE public.lotes_biologicos OWNER TO vac_admin;

--
-- Name: lotes_biologicos_id_seq; Type: SEQUENCE; Schema: public; Owner: vac_admin
--

ALTER TABLE public.lotes_biologicos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.lotes_biologicos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: paciente_alergias; Type: TABLE; Schema: public; Owner: vac_admin
--

CREATE TABLE public.paciente_alergias (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    biologico_id integer NOT NULL,
    fecha_registro date DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE public.paciente_alergias OWNER TO vac_admin;

--
-- Name: paciente_alergias_id_seq; Type: SEQUENCE; Schema: public; Owner: vac_admin
--

CREATE SEQUENCE public.paciente_alergias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paciente_alergias_id_seq OWNER TO vac_admin;

--
-- Name: paciente_alergias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vac_admin
--

ALTER SEQUENCE public.paciente_alergias_id_seq OWNED BY public.paciente_alergias.id;


--
-- Name: paciente_vacunas; Type: TABLE; Schema: public; Owner: vac_admin
--

CREATE TABLE public.paciente_vacunas (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    biologico_id integer NOT NULL,
    dosis_id integer NOT NULL,
    fecha_aplicacion date DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE public.paciente_vacunas OWNER TO vac_admin;

--
-- Name: paciente_vacunas_id_seq; Type: SEQUENCE; Schema: public; Owner: vac_admin
--

CREATE SEQUENCE public.paciente_vacunas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paciente_vacunas_id_seq OWNER TO vac_admin;

--
-- Name: paciente_vacunas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vac_admin
--

ALTER SEQUENCE public.paciente_vacunas_id_seq OWNED BY public.paciente_vacunas.id;


--
-- Name: pacientes; Type: TABLE; Schema: public; Owner: vac_admin
--

CREATE TABLE public.pacientes (
    id integer NOT NULL,
    cedula character varying(20) NOT NULL,
    nacionalidad character varying(2) DEFAULT 'V'::character varying NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    fecha_nacimiento date NOT NULL,
    genero character varying(20) CONSTRAINT pacientes_sexo_not_null NOT NULL,
    orden_hijo integer,
    direccion_comunidad character varying(150),
    direccion_calle character varying(150),
    direccion_casa character varying(50),
    etnia character varying(100),
    grupos_especiales jsonb DEFAULT '[]'::jsonb,
    creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    telefono character varying(20),
    correo character varying(150)
);


ALTER TABLE public.pacientes OWNER TO vac_admin;

--
-- Name: pacientes_id_seq; Type: SEQUENCE; Schema: public; Owner: vac_admin
--

ALTER TABLE public.pacientes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pacientes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: personal_salud; Type: TABLE; Schema: public; Owner: vac_admin
--

CREATE TABLE public.personal_salud (
    id integer NOT NULL,
    cedula character varying(15) NOT NULL,
    pin_hash character varying(255) NOT NULL,
    nombre_completo character varying(100) NOT NULL,
    rol character varying(50) DEFAULT 'enfermeria'::character varying,
    activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.personal_salud OWNER TO vac_admin;

--
-- Name: personal_salud_id_seq; Type: SEQUENCE; Schema: public; Owner: vac_admin
--

CREATE SEQUENCE public.personal_salud_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_salud_id_seq OWNER TO vac_admin;

--
-- Name: personal_salud_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vac_admin
--

ALTER SEQUENCE public.personal_salud_id_seq OWNED BY public.personal_salud.id;


--
-- Name: registro_vacunacion; Type: TABLE; Schema: public; Owner: vac_admin
--

CREATE TABLE public.registro_vacunacion (
    id bigint NOT NULL,
    paciente_id integer,
    lote_id integer,
    dosis_aplicada character varying(10) NOT NULL,
    responsable_vacunacion character varying(150),
    fecha_aplicacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.registro_vacunacion OWNER TO vac_admin;

--
-- Name: registro_vacunacion_id_seq; Type: SEQUENCE; Schema: public; Owner: vac_admin
--

ALTER TABLE public.registro_vacunacion ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.registro_vacunacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: paciente_alergias id; Type: DEFAULT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.paciente_alergias ALTER COLUMN id SET DEFAULT nextval('public.paciente_alergias_id_seq'::regclass);


--
-- Name: paciente_vacunas id; Type: DEFAULT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.paciente_vacunas ALTER COLUMN id SET DEFAULT nextval('public.paciente_vacunas_id_seq'::regclass);


--
-- Name: personal_salud id; Type: DEFAULT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.personal_salud ALTER COLUMN id SET DEFAULT nextval('public.personal_salud_id_seq'::regclass);


--
-- Data for Name: catalogo_biologicos; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.catalogo_biologicos (id, nombre, descripcion, activo) FROM stdin;
1	BCG	Prevención de Tuberculosis (Recién nacidos)	t
3	Rotavirus	Prevención de diarreas severas	t
4	Pentavalente	Difteria, Tétanos, Tos ferina, Hep B, Haemophilus influenzae b	t
6	Fiebre Amarilla	Prevención Antiamarílica	t
7	SRP	Sarampión, Rubeola, Parotiditis (Triple Viral)	t
8	Toxoide Tetánico Diftérico (TTD)	Prevención de Tétanos y Difteria (Embarazadas/Adultos)	t
2	Hepatitis B	Prevención de Hepatitis B (3 dosis: recién nacidos, 1 y 6 meses)	t
5	Polio Inyectable	Prevención de la Poliomielitis (Vacuna Inactivada)	t
9	Neumococo 13 Valente	Prevención de enfermedades neumocócicas (13 serotipos)	t
10	Polio Oral	Prevención de la Poliomielitis (Vacuna Oral)	t
11	Influenza Estacional	Prevención de la Influenza Estacional	t
12	Neumococo 23 Valente	Prevención de enfermedades neumocócicas (23 serotipos)	t
13	Meningocócica B-C	Prevención de enfermedad meningocócica	t
14	Rabia Humana (Pre-exposición)	Prevención de la Rabia (Pre-exposición)	t
15	Rabia Humana (Post-exposición)	Prevención de la Rabia (Post-exposición)	t
\.


--
-- Data for Name: esquema_dosis; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.esquema_dosis (id, biologico_id, nombre_dosis, orden_aplicacion) FROM stdin;
1	1	DU	1
3	3	1D	1
4	3	2D	2
5	4	1D	1
6	4	2D	2
7	4	3D	3
13	7	1D	1
14	7	1REF	2
15	6	DU	1
17	2	1D	1
18	2	2D	2
19	2	3D	3
20	4	1REF	4
21	4	2REF	5
22	4	DA	6
23	5	1D	1
24	5	2D	2
25	5	3D	3
26	7	2D	3
27	7	DA	4
28	8	1D	1
29	8	2D	2
30	8	3D	3
31	8	1REF	4
32	8	2REF	5
33	8	3REF	6
34	8	DA	7
35	9	1D	1
36	9	2D	2
37	9	3D	3
38	9	1REF	4
39	9	2REF	5
40	9	DA	6
41	10	1D	1
42	10	2D	2
43	10	3D	3
44	10	1REF	4
45	10	2REF	5
46	10	DA	6
47	11	1D	1
48	11	2D	2
49	11	1REF	3
50	11	DA	4
51	12	1D	1
52	12	1REF	2
53	13	1D	1
54	13	2D	2
55	14	1D	1
56	14	2D	2
57	14	3D	3
58	15	1D	1
59	15	2D	2
60	15	3D	3
61	15	4D	4
62	15	5D	5
63	15	6D	6
64	15	7D	7
\.


--
-- Data for Name: lotes_biologicos; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.lotes_biologicos (id, nombre_biologico, numero_lote, fecha_vencimiento, dosis_disponibles, estado) FROM stdin;
\.


--
-- Data for Name: paciente_alergias; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.paciente_alergias (id, paciente_id, biologico_id, fecha_registro) FROM stdin;
2	25	6	2026-05-22
3	26	4	2026-05-22
4	27	7	2026-05-22
5	28	7	2026-05-22
6	29	5	2026-05-22
7	30	6	2026-05-22
8	32	6	2026-05-22
70	34	12	2026-05-24
71	34	11	2026-05-24
\.


--
-- Data for Name: paciente_vacunas; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.paciente_vacunas (id, paciente_id, biologico_id, dosis_id, fecha_aplicacion) FROM stdin;
1	1	1	1	1998-05-20
2	1	4	5	1998-07-15
3	25	1	1	2026-05-22
4	26	5	11	2026-05-22
5	27	2	2	2026-05-22
6	28	4	7	2026-05-22
7	29	4	7	2026-05-22
8	30	2	2	2026-05-22
9	32	3	4	2026-05-22
10	34	2	2	2026-05-22
11	34	7	26	2026-05-24
12	34	6	15	2026-05-24
13	35	14	55	2026-05-26
14	36	9	37	2026-05-26
15	37	10	42	2026-05-26
16	37	2	17	2026-05-28
17	36	14	55	2026-05-28
18	37	5	25	2026-05-30
\.


--
-- Data for Name: pacientes; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.pacientes (id, cedula, nacionalidad, nombre, apellido, fecha_nacimiento, genero, orden_hijo, direccion_comunidad, direccion_calle, direccion_casa, etnia, grupos_especiales, creado_en, telefono, correo) FROM stdin;
2	16985625	V	Luisa	Fernandez	1990-10-23	Femenino	4	San Jose	Calle 9	Nro 22	\N	[]	2026-05-21 15:45:30.21316-04	0414-8406403	luisa.fernandez86@gmail.com
3	14724683	V	Maria	Gomez	2012-05-20	Femenino	3	Centro	Calle 9	Nro 59	\N	[]	2026-05-21 15:45:30.21316-04	0414-9205364	maria.gomez68@gmail.com
4	10788336	V	Carmen	Martinez	1993-01-22	Femenino	1	Barrio Obrero	Calle 4	Nro 51	\N	[]	2026-05-21 15:45:30.21316-04	0414-3453631	carmen.martinez53@gmail.com
5	18463568	V	Maria	Rojas	2001-09-02	Femenino	3	San Jose	Calle 1	Nro 100	\N	[]	2026-05-21 15:45:30.21316-04	0414-6397886	maria.rojas33@gmail.com
6	19279060	V	Camila	Blanco	2000-06-06	Femenino	3	San Francisco	Calle 4	Nro 7	\N	[]	2026-05-21 15:45:30.21316-04	0414-3347015	camila.blanco57@gmail.com
7	19994473	V	Valeria	Mendoza	1995-04-13	Femenino	2	San Jose	Calle 1	Nro 20	\N	[]	2026-05-21 15:45:30.21316-04	0414-8340968	valeria.mendoza91@gmail.com
8	25653210	V	Miguel	Castillo	2021-02-08	Masculino	1	Centro	Calle 10	Nro 90	\N	[]	2026-05-21 15:45:30.21316-04	0414-8164871	miguel.castillo22@gmail.com
9	11423381	E	Carlos	Suarez	1980-09-25	Masculino	3	San Francisco	Calle 8	Nro 87	\N	[]	2026-05-21 15:45:30.21316-04	0414-7616088	carlos.suarez14@gmail.com
10	24810758	E	Camila	Salazar	2001-06-03	Femenino	4	Bolivar	Calle 6	Nro 23	\N	[]	2026-05-21 15:45:30.21316-04	0414-9453445	camila.salazar92@gmail.com
11	26687342	V	Luisa	Gonzalez	1983-10-25	Femenino	4	Sucre	Calle 11	Nro 57	\N	[]	2026-05-21 15:45:30.21316-04	0414-6777043	luisa.gonzalez24@gmail.com
12	13393522	V	Ana	Diaz	1981-12-21	Femenino	2	El Valle	Calle 6	Nro 73	\N	[]	2026-05-21 15:45:30.21316-04	0414-1958466	ana.diaz2@gmail.com
13	11038858	V	Carlos	Lopez	2005-01-15	Masculino	3	Sucre	Calle 10	Nro 95	\N	[]	2026-05-21 15:45:30.21316-04	0414-7998727	carlos.lopez15@gmail.com
14	23417928	E	Pedro	Sanchez	2018-11-02	Masculino	1	Barrio Obrero	Calle 11	Nro 84	\N	[]	2026-05-21 15:45:30.21316-04	0414-1001178	pedro.sanchez70@gmail.com
15	23878913	V	Jose	Hernandez	2019-09-13	Masculino	1	Barrio Obrero	Calle 5	Nro 7	\N	[]	2026-05-21 15:45:30.21316-04	0414-7305572	jose.hernandez31@gmail.com
16	26454554	V	Miguel	Sanchez	1995-06-10	Masculino	1	Centro	Calle 1	Nro 53	\N	[]	2026-05-21 15:45:30.21316-04	0414-7043997	miguel.sanchez32@gmail.com
17	18305092	V	Miguel	Martinez	1982-12-11	Masculino	1	Sucre	Calle 3	Nro 38	\N	[]	2026-05-21 15:45:30.21316-04	0414-9141770	miguel.martinez61@gmail.com
18	28203636	E	Miguel	Rodriguez	2014-10-02	Masculino	4	Barrio Obrero	Calle 14	Nro 43	\N	[]	2026-05-21 15:45:30.21316-04	0414-2784845	miguel.rodriguez19@gmail.com
19	23220602	V	Camila	Hernandez	1999-08-28	Femenino	3	Bolivar	Calle 15	Nro 35	\N	[]	2026-05-21 15:45:30.21316-04	0414-7848897	camila.hernandez25@gmail.com
20	20338459	V	Jesus	Castillo	1999-07-28	Masculino	1	Barrio Obrero	Calle 15	Nro 44	\N	[]	2026-05-21 15:45:30.21316-04	0414-5294587	jesus.castillo30@gmail.com
21	19056371	E	Jesus	Mendoza	2002-03-18	Masculino	1	Bolivar	Calle 10	Nro 60	\N	[]	2026-05-21 15:45:30.21316-04	0414-6178733	jesus.mendoza68@gmail.com
22	12345678	V	Andrés	Giménez	1998-05-15	Masculino	\N	Centro	Calle Sucre	Nro 45	\N	[]	2026-05-21 19:31:08.485805-04	0414-1234567	andres@email.com
23	111111111	V	prueba	prueba	1111-11-11	Masculino	1	a	a	a	\N	["personal_de_salud"]	2026-05-22 11:15:06.954377-04	\N	\N
24	22222222222	V	prueba	prueba	1112-11-11	Masculino	1	a	a	a	\N	["enfermos_cronicos"]	2026-05-22 13:51:29.098498-04	\N	\N
25	22333333	V	asdsada	asdasda	1112-11-11	Masculino	2	a	a	a	\N	["enfermos_cronicos"]	2026-05-22 14:04:35.408267-04	\N	\N
26	44444444444	V	prueba2	prueba2	1111-11-11	Femenino	2	a	a	a	\N	["viajeros_internacionales"]	2026-05-22 14:09:41.204893-04	\N	\N
27	22222222	V	telefono	telefono	2011-11-22	Masculino	1	a	a	a	\N	["enfermos_cronicos", "viajeros_internacionales"]	2026-05-22 14:22:22.807867-04	\N	\N
28	444444444	V	as	as	1111-11-22	Femenino	4	a	a	a	\N	["trabajadores_avicolas"]	2026-05-22 14:29:47.726117-04	\N	\N
29	1222222	V	asdad	adsdas	1111-11-11	Masculino	1	a	aa	a	\N	["contingentes_militares"]	2026-05-22 14:31:38.079558-04	\N	\N
30	312323	V	sasss	ssaasdasd	1111-11-11	Femenino	1	a	a	a	\N	["personal_de_salud"]	2026-05-22 14:32:58.048906-04	\N	\N
32	1122222	V	aaaa	aaa	1111-11-11	Femenino	4	a	a	a	\N	["embarazadas"]	2026-05-22 14:41:00.351704-04	04121112222	\N
33	11111111123	V	aaaa	aaa	1111-11-11	Femenino	2	a	a	a	afrodescendiente	["personal_de_salud"]	2026-05-22 15:02:39.917116-04	02333211111	\N
1	22222	V	Test	User	2000-01-15	Masculino	1					\N	2026-05-19 17:10:33.073605-04	04141234567	\N
34	1111111	V	Prueba	Edicion	2000-11-11	Masculino	1	cambio	cambio	cambio	mestizo	["personal_de_salud", "pacientes_en_dialisis", "enfermos_cronicos", "embarazadas"]	2026-05-22 15:04:08.460069-04	04148299090	\N
35	1234	V	test	test	2000-11-22	Femenino	1	asdasd	dasdasd	asdasd	otro	["otro"]	2026-05-26 16:50:57.493862-04	04122222222	\N
36	213213	V	and	aand	2000-12-12	Masculino	1	a	a	a	blanco_o_criollo	["otro"]	2026-05-26 17:09:05.844256-04	02111112	\N
37	123	V	asd	a	2000-03-03	Masculino	\N	a	a	a	afrodescendiente	["pacientes_en_dialisis"]	2026-05-26 17:13:11.655932-04	02312312312	\N
\.


--
-- Data for Name: personal_salud; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.personal_salud (id, cedula, pin_hash, nombre_completo, rol, activo, creado_en) FROM stdin;
1	admin	$2b$12$Ok9.T4r6rs0/MQQLAbh.iuv0tja5efceUdgEbJWa4PukaSVtRNIGq	Administrador	coordinador	t	2026-05-29 17:55:39.430286
2	30911147	$2b$12$5gulRHhN4qsYLbSTlwrap.lNjbyHktB4oUotl5JgF4fOZejajkgNG	Andrés	enfermero	t	2026-05-29 17:55:41.251988
3	123213	$2b$12$/t/XeicwbR/QwQtev1CJuOUTucvFbajpBUR83mzD8bkh83IOwc11G	acho pr	coordinador	t	2026-05-30 19:04:35.703361
15	123456	$2b$12$LgFP4PhFr791UbbgI4fBN.gDwYoV577WYCR8lQ3BgleGN0fWfB2c2	Editado	enfermero	t	2026-05-30 19:06:06.495236
16	67890	$2b$12$oeyWHn2TNqx9aXU5wqR5u.cWBhv9JmuLxg4pXsLgiich1WeNTaFaW	modal edicion	enfermero	t	2026-05-30 19:18:10.885913
\.


--
-- Data for Name: registro_vacunacion; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.registro_vacunacion (id, paciente_id, lote_id, dosis_aplicada, responsable_vacunacion, fecha_aplicacion) FROM stdin;
\.


--
-- Name: catalogo_biologicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.catalogo_biologicos_id_seq', 15, true);


--
-- Name: esquema_dosis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.esquema_dosis_id_seq', 64, true);


--
-- Name: lotes_biologicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.lotes_biologicos_id_seq', 1, false);


--
-- Name: paciente_alergias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.paciente_alergias_id_seq', 71, true);


--
-- Name: paciente_vacunas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.paciente_vacunas_id_seq', 18, true);


--
-- Name: pacientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.pacientes_id_seq', 37, true);


--
-- Name: personal_salud_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.personal_salud_id_seq', 16, true);


--
-- Name: registro_vacunacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.registro_vacunacion_id_seq', 1, false);


--
-- Name: catalogo_biologicos catalogo_biologicos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.catalogo_biologicos
    ADD CONSTRAINT catalogo_biologicos_nombre_key UNIQUE (nombre);


--
-- Name: catalogo_biologicos catalogo_biologicos_pkey; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.catalogo_biologicos
    ADD CONSTRAINT catalogo_biologicos_pkey PRIMARY KEY (id);


--
-- Name: esquema_dosis esquema_dosis_biologico_id_nombre_dosis_key; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.esquema_dosis
    ADD CONSTRAINT esquema_dosis_biologico_id_nombre_dosis_key UNIQUE (biologico_id, nombre_dosis);


--
-- Name: esquema_dosis esquema_dosis_pkey; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.esquema_dosis
    ADD CONSTRAINT esquema_dosis_pkey PRIMARY KEY (id);


--
-- Name: lotes_biologicos lotes_biologicos_numero_lote_key; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.lotes_biologicos
    ADD CONSTRAINT lotes_biologicos_numero_lote_key UNIQUE (numero_lote);


--
-- Name: lotes_biologicos lotes_biologicos_pkey; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.lotes_biologicos
    ADD CONSTRAINT lotes_biologicos_pkey PRIMARY KEY (id);


--
-- Name: paciente_alergias paciente_alergias_pkey; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.paciente_alergias
    ADD CONSTRAINT paciente_alergias_pkey PRIMARY KEY (id);


--
-- Name: paciente_vacunas paciente_vacunas_pkey; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.paciente_vacunas
    ADD CONSTRAINT paciente_vacunas_pkey PRIMARY KEY (id);


--
-- Name: pacientes pacientes_cedula_key; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_cedula_key UNIQUE (cedula);


--
-- Name: pacientes pacientes_pkey; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_pkey PRIMARY KEY (id);


--
-- Name: personal_salud personal_salud_cedula_key; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.personal_salud
    ADD CONSTRAINT personal_salud_cedula_key UNIQUE (cedula);


--
-- Name: personal_salud personal_salud_pkey; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.personal_salud
    ADD CONSTRAINT personal_salud_pkey PRIMARY KEY (id);


--
-- Name: registro_vacunacion registro_vacunacion_pkey; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.registro_vacunacion
    ADD CONSTRAINT registro_vacunacion_pkey PRIMARY KEY (id);


--
-- Name: idx_pacientes_busqueda_trgm; Type: INDEX; Schema: public; Owner: vac_admin
--

CREATE INDEX idx_pacientes_busqueda_trgm ON public.pacientes USING gin (nombre public.gin_trgm_ops, apellido public.gin_trgm_ops, cedula public.gin_trgm_ops);


--
-- Name: idx_pacientes_cedula; Type: INDEX; Schema: public; Owner: vac_admin
--

CREATE INDEX idx_pacientes_cedula ON public.pacientes USING btree (cedula);


--
-- Name: esquema_dosis esquema_dosis_biologico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.esquema_dosis
    ADD CONSTRAINT esquema_dosis_biologico_id_fkey FOREIGN KEY (biologico_id) REFERENCES public.catalogo_biologicos(id) ON DELETE CASCADE;


--
-- Name: paciente_alergias paciente_alergias_biologico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.paciente_alergias
    ADD CONSTRAINT paciente_alergias_biologico_id_fkey FOREIGN KEY (biologico_id) REFERENCES public.catalogo_biologicos(id) ON DELETE CASCADE;


--
-- Name: paciente_alergias paciente_alergias_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.paciente_alergias
    ADD CONSTRAINT paciente_alergias_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: paciente_vacunas paciente_vacunas_biologico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.paciente_vacunas
    ADD CONSTRAINT paciente_vacunas_biologico_id_fkey FOREIGN KEY (biologico_id) REFERENCES public.catalogo_biologicos(id) ON DELETE CASCADE;


--
-- Name: paciente_vacunas paciente_vacunas_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.paciente_vacunas
    ADD CONSTRAINT paciente_vacunas_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: registro_vacunacion registro_vacunacion_lote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.registro_vacunacion
    ADD CONSTRAINT registro_vacunacion_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lotes_biologicos(id);


--
-- Name: registro_vacunacion registro_vacunacion_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.registro_vacunacion
    ADD CONSTRAINT registro_vacunacion_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO vac_admin;


--
-- PostgreSQL database dump complete
--

\unrestrict KZRRd5H8k0codeBcBN35gid8a0JamdFclQJw3u10fIYKyaZoDqQ4n3kgUgHW3J5

