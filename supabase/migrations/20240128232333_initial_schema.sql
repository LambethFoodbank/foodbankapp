

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

-- pgsodium schema removed from postgres 15.8
-- CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgaudit" WITH SCHEMA "public";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."gender" AS ENUM (
    'male',
    'female',
    'other'
);

ALTER TYPE "public"."gender" OWNER TO "postgres";

CREATE TYPE "public"."role" AS ENUM (
    'caller',
    'admin'
);

ALTER TYPE "public"."role" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE "public"."clients" (
    "primary_key" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" DEFAULT ''::"text" NOT NULL,
    "phone_number" "text" DEFAULT ''::"text" NOT NULL,
    "address_1" "text" DEFAULT ''::"text" NOT NULL,
    "address_2" "text" DEFAULT ''::"text" NOT NULL,
    "address_town" "text" DEFAULT ''::"text" NOT NULL,
    "address_county" "text" DEFAULT ''::"text" NOT NULL,
    "address_postcode" "text" DEFAULT ''::"text" NOT NULL,
    "delivery_instructions" "text" DEFAULT ''::"text" NOT NULL,
    "family_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dietary_requirements" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "feminine_products" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "baby_food" boolean,
    "pet_food" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "other_items" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "extra_information" "text" DEFAULT ''::"text" NOT NULL,
    "flagged_for_attention" boolean DEFAULT false NOT NULL,
    "signposting_call_required" boolean DEFAULT false NOT NULL,
    CONSTRAINT "clients_address_postcode_check" CHECK (("length"("address_postcode") > 0)),
    CONSTRAINT "clients_full_name_check" CHECK (("length"("full_name") > 0))
);

ALTER TABLE "public"."clients" OWNER TO "postgres";

CREATE TABLE "public"."collection_centres" (
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "acronym" "text" DEFAULT ''::"text" NOT NULL,
    "primary_key" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    CONSTRAINT "collection_centres_name_check" CHECK (("length"("name") > 0))
);

ALTER TABLE "public"."collection_centres" OWNER TO "postgres";

CREATE TABLE "public"."events" (
    "primary_key" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_name" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "parcel_id" "uuid" NOT NULL,
    "event_data" "text"
);

ALTER TABLE "public"."events" OWNER TO "postgres";

CREATE TABLE "public"."families" (
    "family_id" "uuid" NOT NULL,
    "primary_key" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "gender" "public"."gender" DEFAULT 'other'::"public"."gender" NOT NULL,
    "age" bigint
);

ALTER TABLE "public"."families" OWNER TO "postgres";

CREATE TABLE "public"."lists" (
    "primary_key" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_name" "text" DEFAULT ''::"text" NOT NULL,
    "1_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "1_notes" "text",
    "2_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "2_notes" "text",
    "3_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "3_notes" "text",
    "4_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "4_notes" "text",
    "5_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "5_notes" "text",
    "6_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "6_notes" "text",
    "7_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "7_notes" "text",
    "8_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "8_notes" "text",
    "9_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "9_notes" "text",
    "10_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "10_notes" "text",
    "row_order" bigint NOT NULL
);

ALTER TABLE "public"."lists" OWNER TO "postgres";

CREATE TABLE "public"."lists_hotel" (
    "primary_key" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_name" "text" DEFAULT ''::"text" NOT NULL,
    "1_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "1_notes" "text",
    "2_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "2_notes" "text",
    "3_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "3_notes" "text",
    "4_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "4_notes" "text",
    "5_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "5_notes" "text",
    "6_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "6_notes" "text",
    "7_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "7_notes" "text",
    "8_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "8_notes" "text",
    "9_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "9_notes" "text",
    "10_quantity" "text" DEFAULT ''::"text" NOT NULL,
    "10_notes" "text",
    "row_order" bigint NOT NULL
);

ALTER TABLE "public"."lists_hotel" OWNER TO "postgres";

ALTER TABLE "public"."lists_hotel" ALTER COLUMN "row_order" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."lists_hotel_row_order_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE "public"."lists" ALTER COLUMN "row_order" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."lists_row_order_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."parcels" (
    "primary_key" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "packing_datetime" timestamp with time zone,
    "collection_centre" "uuid",
    "collection_datetime" timestamp with time zone,
    "voucher_number" "text"
);

ALTER TABLE "public"."parcels" OWNER TO "postgres";

CREATE TABLE "public"."website_data" (
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "value" "text" DEFAULT ''::"text" NOT NULL
);

ALTER TABLE "public"."website_data" OWNER TO "postgres";

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "client_info_pkey" PRIMARY KEY ("primary_key");

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_family_id_key" UNIQUE ("family_id");

ALTER TABLE ONLY "public"."collection_centres"
    ADD CONSTRAINT "collection_centres_acronym_key" UNIQUE ("acronym");

ALTER TABLE ONLY "public"."collection_centres"
    ADD CONSTRAINT "collection_centres_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."collection_centres"
    ADD CONSTRAINT "collection_centres_pkey" PRIMARY KEY ("primary_key");

ALTER TABLE ONLY "public"."collection_centres"
    ADD CONSTRAINT "collection_centres_primary_key_key" UNIQUE ("primary_key");

ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("primary_key");

ALTER TABLE ONLY "public"."families"
    ADD CONSTRAINT "families_pkey" PRIMARY KEY ("primary_key");

ALTER TABLE ONLY "public"."lists_hotel"
    ADD CONSTRAINT "lists_hotel_item_name_key" UNIQUE ("item_name");

ALTER TABLE ONLY "public"."lists_hotel"
    ADD CONSTRAINT "lists_hotel_pkey" PRIMARY KEY ("primary_key");

ALTER TABLE ONLY "public"."lists"
    ADD CONSTRAINT "lists_item_name_key" UNIQUE ("item_name");

ALTER TABLE ONLY "public"."lists"
    ADD CONSTRAINT "lists_pkey" PRIMARY KEY ("primary_key");

ALTER TABLE ONLY "public"."parcels"
    ADD CONSTRAINT "parcels_pkey" PRIMARY KEY ("primary_key");

ALTER TABLE ONLY "public"."website_data"
    ADD CONSTRAINT "website_data_pkey" PRIMARY KEY ("name");

ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_parcel_id_fkey" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("primary_key") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."families"
    ADD CONSTRAINT "families_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."clients"("family_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."parcels"
    ADD CONSTRAINT "parcels_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("primary_key") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."parcels"
    ADD CONSTRAINT "parcels_collection_centre_fkey" FOREIGN KEY ("collection_centre") REFERENCES "public"."collection_centres"("primary_key") ON DELETE SET NULL;

CREATE POLICY "Admin roles" ON "public"."lists" TO "authenticated" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));

CREATE POLICY "Admin roles" ON "public"."lists_hotel" TO "authenticated" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));

CREATE POLICY "Admin roles" ON "public"."website_data" TO "authenticated" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (true);

CREATE POLICY "Admin roles can edit" ON "public"."collection_centres" TO "authenticated" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));

CREATE POLICY "Logged in roles" ON "public"."clients" TO "authenticated" USING (true);

CREATE POLICY "Logged in roles" ON "public"."events" TO "authenticated" USING (true);

CREATE POLICY "Logged in roles" ON "public"."families" TO "authenticated" USING (true);

CREATE POLICY "Logged in roles" ON "public"."parcels" TO "authenticated" USING (true);

CREATE POLICY "Logged in roles can select" ON "public"."collection_centres" FOR SELECT TO "authenticated" USING (true);

ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."collection_centres" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."families" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."lists" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."lists_hotel" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."parcels" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."website_data" ENABLE ROW LEVEL SECURITY;

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."pgaudit_ddl_command_end"() TO "postgres";
GRANT ALL ON FUNCTION "public"."pgaudit_ddl_command_end"() TO "anon";
GRANT ALL ON FUNCTION "public"."pgaudit_ddl_command_end"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgaudit_ddl_command_end"() TO "service_role";

GRANT ALL ON FUNCTION "public"."pgaudit_sql_drop"() TO "postgres";
GRANT ALL ON FUNCTION "public"."pgaudit_sql_drop"() TO "anon";
GRANT ALL ON FUNCTION "public"."pgaudit_sql_drop"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgaudit_sql_drop"() TO "service_role";

GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";

GRANT ALL ON TABLE "public"."collection_centres" TO "anon";
GRANT ALL ON TABLE "public"."collection_centres" TO "authenticated";
GRANT ALL ON TABLE "public"."collection_centres" TO "service_role";

GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";

GRANT ALL ON TABLE "public"."families" TO "anon";
GRANT ALL ON TABLE "public"."families" TO "authenticated";
GRANT ALL ON TABLE "public"."families" TO "service_role";

GRANT ALL ON TABLE "public"."lists" TO "anon";
GRANT ALL ON TABLE "public"."lists" TO "authenticated";
GRANT ALL ON TABLE "public"."lists" TO "service_role";

GRANT ALL ON TABLE "public"."lists_hotel" TO "anon";
GRANT ALL ON TABLE "public"."lists_hotel" TO "authenticated";
GRANT ALL ON TABLE "public"."lists_hotel" TO "service_role";

GRANT ALL ON SEQUENCE "public"."lists_hotel_row_order_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lists_hotel_row_order_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lists_hotel_row_order_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."lists_row_order_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lists_row_order_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lists_row_order_seq" TO "service_role";

GRANT ALL ON TABLE "public"."parcels" TO "anon";
GRANT ALL ON TABLE "public"."parcels" TO "authenticated";
GRANT ALL ON TABLE "public"."parcels" TO "service_role";

GRANT ALL ON TABLE "public"."website_data" TO "anon";
GRANT ALL ON TABLE "public"."website_data" TO "authenticated";
GRANT ALL ON TABLE "public"."website_data" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
