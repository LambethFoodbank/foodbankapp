create table "public"."delivery_areas" (
    "id" uuid not null default gen_random_uuid(),
    "postcode" text not null,
    "is_deliverable" boolean not null default false,
    "order" smallint not null
);


CREATE UNIQUE INDEX delivery_areas_order_key ON public.delivery_areas USING btree ("order");

CREATE UNIQUE INDEX delivery_areas_pkey ON public.delivery_areas USING btree (id);

alter table "public"."delivery_areas" add constraint "delivery_areas_pkey" PRIMARY KEY using index "delivery_areas_pkey";

alter table "public"."delivery_areas" add constraint "delivery_areas_order_key" UNIQUE using index "delivery_areas_order_key";

grant delete on table "public"."delivery_areas" to "anon";

grant insert on table "public"."delivery_areas" to "anon";

grant references on table "public"."delivery_areas" to "anon";

grant select on table "public"."delivery_areas" to "anon";

grant trigger on table "public"."delivery_areas" to "anon";

grant truncate on table "public"."delivery_areas" to "anon";

grant update on table "public"."delivery_areas" to "anon";

grant delete on table "public"."delivery_areas" to "authenticated";

grant insert on table "public"."delivery_areas" to "authenticated";

grant references on table "public"."delivery_areas" to "authenticated";

grant select on table "public"."delivery_areas" to "authenticated";

grant trigger on table "public"."delivery_areas" to "authenticated";

grant truncate on table "public"."delivery_areas" to "authenticated";

grant update on table "public"."delivery_areas" to "authenticated";

grant delete on table "public"."delivery_areas" to "service_role";

grant insert on table "public"."delivery_areas" to "service_role";

grant references on table "public"."delivery_areas" to "service_role";

grant select on table "public"."delivery_areas" to "service_role";

grant trigger on table "public"."delivery_areas" to "service_role";

grant truncate on table "public"."delivery_areas" to "service_role";

grant update on table "public"."delivery_areas" to "service_role";


