alter table "public"."delivery_areas" add constraint "delivery_areas_postcode_check" CHECK ((length(postcode) > 2)) not valid;

alter table "public"."delivery_areas" validate constraint "delivery_areas_postcode_check";
