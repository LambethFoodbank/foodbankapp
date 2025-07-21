CREATE UNIQUE INDEX delivery_areas_postcode_key ON public.delivery_areas USING btree (postcode);

alter table "public"."delivery_areas" add constraint "delivery_areas_postcode_key" UNIQUE using index "delivery_areas_postcode_key";


