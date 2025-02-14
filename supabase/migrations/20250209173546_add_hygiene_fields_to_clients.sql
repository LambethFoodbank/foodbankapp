alter table "public"."clients" add column "hygiene_female_incontinence" boolean default false;

alter table "public"."clients" add column "hygiene_male_incontinence" boolean default false;

alter table "public"."clients" add column "hygiene_pads" text;

alter table "public"."clients" add column "hygiene_tampons" text;


