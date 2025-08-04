create type "public"."item_dietary_status" as enum ('included', 'excluded', 'not_specified');

create table "public"."dietary_requirements" (
    "id" uuid not null default gen_random_uuid(),
    "halal" item_dietary_status,
    "vegetarian" item_dietary_status,
    "vegan" item_dietary_status,
    "meat" item_dietary_status,
    "gluten_free" item_dietary_status,
    "pescatarian" item_dietary_status,
    "dairy_free" item_dietary_status,
    "seafood_allergy" item_dietary_status,
    "pet_food" item_dietary_status
);

alter table "public"."dietary_requirements" enable row level security;

CREATE UNIQUE INDEX dietary_requirements_pkey ON public.dietary_requirements USING btree (id);

alter table "public"."dietary_requirements" add constraint "dietary_requirements_pkey" PRIMARY KEY using index "dietary_requirements_pkey";

alter table "public"."dietary_requirements" add constraint "dietary_requirements_id_fkey" FOREIGN KEY (id) REFERENCES lists(primary_key) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."dietary_requirements" validate constraint "dietary_requirements_id_fkey";
