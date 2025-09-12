alter table "public"."website_data" add column "last_updated" timestamp with time zone not null default CURRENT_TIMESTAMP;
