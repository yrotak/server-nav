-- Table: server_nav.nav_items

-- DROP TABLE IF EXISTS server_nav.nav_items;

CREATE TABLE IF NOT EXISTS server_nav.nav_items
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 0 MINVALUE 0 MAXVALUE 99999 CACHE 1 ),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    url character varying COLLATE pg_catalog."default" NOT NULL,
    image character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT nav_items_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS server_nav.nav_items
    OWNER to postgres;

-- Table: server_nav.passwords

-- DROP TABLE IF EXISTS server_nav.passwords;

CREATE TABLE IF NOT EXISTS server_nav.passwords
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 0 MINVALUE 0 MAXVALUE 99999 CACHE 1 ),
    password character varying COLLATE pg_catalog."default" NOT NULL,
    owner integer NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT passwords_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS server_nav.passwords
    OWNER to postgres;

-- Table: server_nav.totps

-- DROP TABLE IF EXISTS server_nav.totps;

CREATE TABLE IF NOT EXISTS server_nav.totps
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 0 MINVALUE 0 MAXVALUE 99999 CACHE 1 ),
    owner integer NOT NULL,
    issuer character varying COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    secret character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT totps_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS server_nav.totps
    OWNER to postgres;

-- Table: server_nav.users

-- DROP TABLE IF EXISTS server_nav.users;

CREATE TABLE IF NOT EXISTS server_nav.users
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 0 MINVALUE 0 MAXVALUE 99999 CACHE 1 ),
    username character varying(16) COLLATE pg_catalog."default" NOT NULL,
    password character varying(128) COLLATE pg_catalog."default" NOT NULL,
    totp character varying(64) COLLATE pg_catalog."default" NOT NULL,
    date bigint NOT NULL,
    regsess character varying(16) COLLATE pg_catalog."default" NOT NULL,
    rank character varying COLLATE pg_catalog."default" NOT NULL,
    unique_id character varying COLLATE pg_catalog."default" NOT NULL,
    creditential character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS server_nav.users
    OWNER to postgres;