--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2
-- Dumped by pg_dump version 12.2

-- Started on 2020-12-23 15:44:03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 651 (class 1247 OID 57444)
-- Name: gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gender AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public.gender OWNER TO postgres;

--
-- TOC entry 637 (class 1247 OID 49254)
-- Name: perms; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.perms AS ENUM (
    'basic',
    'admin'
);


ALTER TYPE public.perms OWNER TO postgres;

--
-- TOC entry 644 (class 1247 OID 57428)
-- Name: report_reason; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.report_reason AS ENUM (
    'INAPPROPRIATE',
    'ADVERTISING',
    'EXPLIOTING',
    'OTHER',
    'STATUS'
);


ALTER TYPE public.report_reason OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 202 (class 1259 OID 49223)
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    display_name text NOT NULL,
    password text,
    account_creation bigint,
    email text NOT NULL,
    username text,
    user_id bigint,
    public boolean,
    description text,
    permiss public.perms,
    donor boolean,
    actual_name text,
    acc_gender public.gender
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 49235)
-- Name: donors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donors (
    pass text,
    children_info jsonb[],
    user_id bigint,
    "subscriptionID" text
);


ALTER TABLE public.donors OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 49241)
-- Name: mail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mail (
    username text,
    password text,
    user_id bigint
);


ALTER TABLE public.mail OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 57437)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    user_id bigint,
    descr text,
    reason public.report_reason,
    reporteeid bigint
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 49259)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    user_id bigint,
    content text,
    stars smallint,
    creation_time bigint
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 2843 (class 0 OID 49223)
-- Dependencies: 202
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (display_name, password, account_creation, email, username, user_id, public, description, permiss, donor, actual_name, acc_gender) FROM stdin;
\.


--
-- TOC entry 2844 (class 0 OID 49235)
-- Dependencies: 203
-- Data for Name: donors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.donors (pass, children_info, user_id, "subscriptionID") FROM stdin;
\.


--
-- TOC entry 2845 (class 0 OID 49241)
-- Dependencies: 204
-- Data for Name: mail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mail (username, password, user_id) FROM stdin;
\.


--
-- TOC entry 2847 (class 0 OID 57437)
-- Dependencies: 206
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (user_id, descr, reason, reporteeid) FROM stdin;
\.


--
-- TOC entry 2846 (class 0 OID 49259)
-- Dependencies: 205
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (user_id, content, stars, creation_time) FROM stdin;
\.


--
-- TOC entry 2716 (class 2606 OID 49234)
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (email);


-- Completed on 2020-12-23 15:44:04

--
-- PostgreSQL database dump complete
--

