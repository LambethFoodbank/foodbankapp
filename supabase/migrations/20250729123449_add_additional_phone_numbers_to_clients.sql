alter table "public"."clients" add column "additional_phone_numbers" "text"[] NOT NULL DEFAULT '{}'::"text"[];
