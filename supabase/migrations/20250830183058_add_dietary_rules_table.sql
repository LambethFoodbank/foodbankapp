create table "public"."dietary_rules" (
    "primary_key" uuid not null default gen_random_uuid(),
    "diet_id" uuid not null default gen_random_uuid(),
    "item_id" uuid not null default gen_random_uuid(),
    "status" item_dietary_status not null
);

alter table "public"."dietary_rules" enable row level security;

CREATE UNIQUE INDEX dietary_rules_pkey ON public.dietary_rules USING btree (primary_key);

alter table "public"."dietary_rules" add constraint "dietary_rules_pkey" PRIMARY KEY using index "dietary_rules_pkey";

alter table "public"."dietary_rules" add constraint "dietary_rules_diet_id_fkey" FOREIGN KEY (diet_id) REFERENCES diets(primary_key) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."dietary_rules" validate constraint "dietary_rules_diet_id_fkey";

alter table "public"."dietary_rules" add constraint "dietary_rules_item_id_fkey" FOREIGN KEY (item_id) REFERENCES lists(primary_key) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."dietary_rules" validate constraint "dietary_rules_item_id_fkey";

create policy "Enable access for admin user, select for authenticated"
on "public"."dietary_rules"
as permissive
for all
to authenticated
using (true)
with check (user_is_admin());
