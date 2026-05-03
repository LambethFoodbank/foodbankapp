create policy "Enable access for admin user, select for authenticated"
on "public"."dietary_requirements"
as permissive
for all
to authenticated
using (true)
with check (user_is_admin());
