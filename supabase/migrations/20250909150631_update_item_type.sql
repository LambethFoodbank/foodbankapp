drop view if exists "public"."dietary_rules_plus";

alter type "public"."item_type" rename to "item_type__old_version_to_be_dropped";

create type "public"."item_type" as enum ('regular_food', 'alternative_food', 'choice_food', 'pet_food', 'hygiene_product', 'baby_product', 'seasonal_product', 'others');

alter table "public"."lists" alter column item_type type "public"."item_type" using item_type::text::"public"."item_type";

drop type "public"."item_type__old_version_to_be_dropped";

create or replace view "public"."dietary_rules_plus" as  SELECT dr.primary_key,
    dr.diet_id,
    d.name AS diet_name,
    dr.item_id,
    l.item_name,
    l.item_type,
    dr.status
   FROM ((dietary_rules dr
     JOIN diets d ON ((dr.diet_id = d.primary_key)))
     JOIN lists l ON ((dr.item_id = l.primary_key)));
