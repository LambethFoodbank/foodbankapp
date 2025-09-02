create table "public"."clients_diets" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null default gen_random_uuid(),
    "diet_id" uuid not null default gen_random_uuid()
);

alter table "public"."clients_diets" enable row level security;

CREATE UNIQUE INDEX clients_diets_pkey ON public.clients_diets USING btree (id);

alter table "public"."clients_diets" add constraint "clients_diets_pkey" PRIMARY KEY using index "clients_diets_pkey";

alter table "public"."clients_diets" add constraint "clients_diets_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(primary_key) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients_diets" validate constraint "clients_diets_client_id_fkey";

alter table "public"."clients_diets" add constraint "clients_diets_diet_id_fkey" FOREIGN KEY (diet_id) REFERENCES diets(primary_key) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients_diets" validate constraint "clients_diets_diet_id_fkey";

create policy "Enable access for admin user, select for authenticated"
on "public"."clients_diets"
as permissive
for all
to authenticated
using (true)
with check (user_is_admin());
