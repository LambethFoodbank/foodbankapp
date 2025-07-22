alter table "public"."delivery_areas" drop constraint "delivery_areas_order_key";

drop index if exists "public"."delivery_areas_order_key";

alter table "public"."delivery_areas" drop column "order";


