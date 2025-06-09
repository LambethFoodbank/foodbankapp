drop policy "Enable all for admins/managers" on "public"."wiki";

create policy "Enable all for admins/managers/staff"
on "public"."wiki"
as permissive
for all
to authenticated
using (true)
with check (user_is_admin_or_manager_or_staff());



