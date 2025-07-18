alter table "public"."delivery_areas" enable row level security;

create policy "Enable access to admins, select for authenticated"
on "public"."delivery_areas"
as permissive
for all
to authenticated
using (true)
with check (user_is_admin());



