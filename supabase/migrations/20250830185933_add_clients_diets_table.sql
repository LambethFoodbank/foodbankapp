create table "public"."clients_diets" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null default gen_random_uuid(),
    "diet_id" uuid default gen_random_uuid()
);

alter table "public"."clients_diets" enable row level security;

CREATE UNIQUE INDEX clients_diets_pkey ON public.clients_diets USING btree (id);

alter table "public"."clients_diets" add constraint "clients_diets_pkey" PRIMARY KEY using index "clients_diets_pkey";

alter table "public"."clients_diets" add constraint "clients_diets_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(primary_key) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients_diets" validate constraint "clients_diets_client_id_fkey";

alter table "public"."clients_diets" add constraint "clients_diets_diet_id_fkey" FOREIGN KEY (diet_id) REFERENCES diets(primary_key) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients_diets" validate constraint "clients_diets_diet_id_fkey";

grant delete on table "public"."clients_diets" to "anon";

grant insert on table "public"."clients_diets" to "anon";

grant references on table "public"."clients_diets" to "anon";

grant select on table "public"."clients_diets" to "anon";

grant trigger on table "public"."clients_diets" to "anon";

grant truncate on table "public"."clients_diets" to "anon";

grant update on table "public"."clients_diets" to "anon";

grant delete on table "public"."clients_diets" to "authenticated";

grant insert on table "public"."clients_diets" to "authenticated";

grant references on table "public"."clients_diets" to "authenticated";

grant select on table "public"."clients_diets" to "authenticated";

grant trigger on table "public"."clients_diets" to "authenticated";

grant truncate on table "public"."clients_diets" to "authenticated";

grant update on table "public"."clients_diets" to "authenticated";

grant delete on table "public"."clients_diets" to "service_role";

grant insert on table "public"."clients_diets" to "service_role";

grant references on table "public"."clients_diets" to "service_role";

grant select on table "public"."clients_diets" to "service_role";

grant trigger on table "public"."clients_diets" to "service_role";

grant truncate on table "public"."clients_diets" to "service_role";

grant update on table "public"."clients_diets" to "service_role";
