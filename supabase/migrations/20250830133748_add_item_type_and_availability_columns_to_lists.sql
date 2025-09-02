create type "public"."item_type" as enum ('regular_food', 'alternative_food', 'pet_food', 'hygiene_product', 'baby_product', 'seasonal_product', 'others');

alter table "public"."lists" add column "is_available" boolean default true;

alter table "public"."lists" add column "item_type" item_type;
