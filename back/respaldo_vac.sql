--
-- PostgreSQL database dump
--

\restrict dKp1f01tp5ixtobCTDEU5ktbQykeyJtcpF6L4jbFyeZ1W5KTMj1HOyaZd3alVsi

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
    sexo character varying(1) NOT NULL,
    orden_hijo integer,
    direccion_comunidad character varying(150),
    direccion_calle character varying(100),
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
-- Data for Name: catalogo_biologicos; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.catalogo_biologicos (id, nombre, descripcion, activo) FROM stdin;
1	BCG	Prevención de Tuberculosis (Recién nacidos)	t
2	Hepatitis B (Pediátrica)	Prevención de Hepatitis B (Recién nacidos)	t
3	Rotavirus	Prevención de diarreas severas	t
4	Pentavalente	Difteria, Tétanos, Tos ferina, Hep B, Haemophilus influenzae b	t
5	Polio (IPV/bOPV)	Prevención de la Poliomielitis	t
6	Fiebre Amarilla	Prevención Antiamarílica	t
7	SRP	Sarampión, Rubeola, Parotiditis (Triple Viral)	t
8	Toxoide Tetánico Diftérico (TTD)	Prevención de Tétanos y Difteria (Embarazadas/Adultos)	t
\.


--
-- Data for Name: esquema_dosis; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.esquema_dosis (id, biologico_id, nombre_dosis, orden_aplicacion) FROM stdin;
1	1	DU	1
2	2	DU	1
3	3	1D	1
4	3	2D	2
5	4	1D	1
6	4	2D	2
7	4	3D	3
8	5	1D	1
9	5	2D	2
10	5	3D	3
11	5	1REF	4
12	5	2REF	5
13	7	1D	1
14	7	1REF	2
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
\.


--
-- Data for Name: paciente_vacunas; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.paciente_vacunas (id, paciente_id, biologico_id, dosis_id, fecha_aplicacion) FROM stdin;
\.


--
-- Data for Name: pacientes; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.pacientes (id, cedula, nacionalidad, nombre, apellido, fecha_nacimiento, sexo, orden_hijo, direccion_comunidad, direccion_calle, direccion_casa, etnia, grupos_especiales, creado_en, telefono, correo) FROM stdin;
\.


--
-- Data for Name: registro_vacunacion; Type: TABLE DATA; Schema: public; Owner: vac_admin
--

COPY public.registro_vacunacion (id, paciente_id, lote_id, dosis_aplicada, responsable_vacunacion, fecha_aplicacion) FROM stdin;
\.


--
-- Name: catalogo_biologicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.catalogo_biologicos_id_seq', 8, true);


--
-- Name: esquema_dosis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.esquema_dosis_id_seq', 14, true);


--
-- Name: lotes_biologicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.lotes_biologicos_id_seq', 1, false);


--
-- Name: paciente_alergias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.paciente_alergias_id_seq', 1, false);


--
-- Name: paciente_vacunas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.paciente_vacunas_id_seq', 1, false);


--
-- Name: pacientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vac_admin
--

SELECT pg_catalog.setval('public.pacientes_id_seq', 1, false);


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
-- Name: registro_vacunacion registro_vacunacion_pkey; Type: CONSTRAINT; Schema: public; Owner: vac_admin
--

ALTER TABLE ONLY public.registro_vacunacion
    ADD CONSTRAINT registro_vacunacion_pkey PRIMARY KEY (id);


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

\unrestrict dKp1f01tp5ixtobCTDEU5ktbQykeyJtcpF6L4jbFyeZ1W5KTMj1HOyaZd3alVsi

