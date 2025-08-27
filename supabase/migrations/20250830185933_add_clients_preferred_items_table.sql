create table "public"."clients_preferred_items" (
                                                    "id" uuid not null default gen_random_uuid(),
                                                    "client_id" uuid not null default gen_random_uuid(),
                                                    "item_id" uuid default gen_random_uuid()
);


alter table "public"."clients_preferred_items" enable row level security;

CREATE UNIQUE INDEX clients_preferred_items_pkey ON public.clients_preferred_items USING btree (id);

alter table "public"."clients_preferred_items" add constraint "clients_preferred_items_pkey" PRIMARY KEY using index "clients_preferred_items_pkey";

alter table "public"."clients_preferred_items" add constraint "clients_preferred_items_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(primary_key) not valid;

alter table "public"."clients_preferred_items" validate constraint "clients_preferred_items_client_id_fkey";

alter table "public"."clients_preferred_items" add constraint "clients_preferred_items_item_id_fkey" FOREIGN KEY (item_id) REFERENCES lists(primary_key) not valid;

alter table "public"."clients_preferred_items" validate constraint "clients_preferred_items_item_id_fkey";

grant delete on table "public"."clients_preferred_items" to "anon";

grant insert on table "public"."clients_preferred_items" to "anon";

grant references on table "public"."clients_preferred_items" to "anon";

grant select on table "public"."clients_preferred_items" to "anon";

grant trigger on table "public"."clients_preferred_items" to "anon";

grant truncate on table "public"."clients_preferred_items" to "anon";

grant update on table "public"."clients_preferred_items" to "anon";

grant delete on table "public"."clients_preferred_items" to "authenticated";

grant insert on table "public"."clients_preferred_items" to "authenticated";

grant references on table "public"."clients_preferred_items" to "authenticated";

grant select on table "public"."clients_preferred_items" to "authenticated";

grant trigger on table "public"."clients_preferred_items" to "authenticated";

grant truncate on table "public"."clients_preferred_items" to "authenticated";

grant update on table "public"."clients_preferred_items" to "authenticated";

grant delete on table "public"."clients_preferred_items" to "service_role";

grant insert on table "public"."clients_preferred_items" to "service_role";

grant references on table "public"."clients_preferred_items" to "service_role";

grant select on table "public"."clients_preferred_items" to "service_role";

grant trigger on table "public"."clients_preferred_items" to "service_role";

grant truncate on table "public"."clients_preferred_items" to "service_role";

grant update on table "public"."clients_preferred_items" to "service_role";
