create table "public"."clients_preferred_items" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null default gen_random_uuid(),
    "item_id" uuid not null default gen_random_uuid(),
    "notes" text
);


alter table "public"."clients_preferred_items" enable row level security;

CREATE UNIQUE INDEX clients_preferred_items_pkey ON public.clients_preferred_items USING btree (id);

alter table "public"."clients_preferred_items" add constraint "clients_preferred_items_pkey" PRIMARY KEY using index "clients_preferred_items_pkey";

alter table "public"."clients_preferred_items" add constraint "clients_preferred_items_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(primary_key) not valid;

alter table "public"."clients_preferred_items" validate constraint "clients_preferred_items_client_id_fkey";

alter table "public"."clients_preferred_items" add constraint "clients_preferred_items_item_id_fkey" FOREIGN KEY (item_id) REFERENCES lists(primary_key) not valid;

alter table "public"."clients_preferred_items" validate constraint "clients_preferred_items_item_id_fkey";

create policy "Enable access for admin user, select for authenticated"
on "public"."clients_preferred_items"
as permissive
for all
to authenticated
using (true)
with check (user_is_admin());
