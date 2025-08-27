create policy "Enable access to organisational roles"
on "public"."drivers"
as permissive
for all
to authenticated
using (true)
with check (user_is_admin_or_manager_or_staff());

alter publication supabase_realtime add table drivers;
