create table "public"."emergency_bags" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "collection_centre" uuid not null,
    "packing_date" date not null,
    "type" text not null,
    "amount" numeric not null
);


alter table "public"."emergency_bags" enable row level security;

CREATE UNIQUE INDEX emergency_bags_pkey ON public.emergency_bags USING btree (id);

alter table "public"."emergency_bags" add constraint "emergency_bags_pkey" PRIMARY KEY using index "emergency_bags_pkey";

alter table "public"."emergency_bags" add constraint "emergency_bags_collection_centre_fkey" FOREIGN KEY (collection_centre) REFERENCES collection_centres(primary_key) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."emergency_bags" validate constraint "emergency_bags_collection_centre_fkey";

grant delete on table "public"."emergency_bags" to "anon";

grant insert on table "public"."emergency_bags" to "anon";

grant references on table "public"."emergency_bags" to "anon";

grant select on table "public"."emergency_bags" to "anon";

grant trigger on table "public"."emergency_bags" to "anon";

grant truncate on table "public"."emergency_bags" to "anon";

grant update on table "public"."emergency_bags" to "anon";

grant delete on table "public"."emergency_bags" to "authenticated";

grant insert on table "public"."emergency_bags" to "authenticated";

grant references on table "public"."emergency_bags" to "authenticated";

grant select on table "public"."emergency_bags" to "authenticated";

grant trigger on table "public"."emergency_bags" to "authenticated";

grant truncate on table "public"."emergency_bags" to "authenticated";

grant update on table "public"."emergency_bags" to "authenticated";

grant delete on table "public"."emergency_bags" to "service_role";

grant insert on table "public"."emergency_bags" to "service_role";

grant references on table "public"."emergency_bags" to "service_role";

grant select on table "public"."emergency_bags" to "service_role";

grant trigger on table "public"."emergency_bags" to "service_role";

grant truncate on table "public"."emergency_bags" to "service_role";

grant update on table "public"."emergency_bags" to "service_role";

create policy "Logged in roles"
on "public"."emergency_bags"
as permissive
for all
to authenticated
using (true);



