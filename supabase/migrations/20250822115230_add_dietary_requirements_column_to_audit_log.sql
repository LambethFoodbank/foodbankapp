alter table "public"."audit_log" add column "dietary_requirement" text;

create or replace view
    "public"."audit_log_plus" with (security_invoker = true) as
select audit_log.action,
    audit_log.actor_profile_id,
    audit_log.client_id,
    audit_log.collection_centre_id,
    audit_log.content,
    audit_log.created_at,
    audit_log.event_id,
    audit_log.list_id,
    audit_log.log_id,
    audit_log.packing_slot_id,
    audit_log.parcel_id,
    audit_log.primary_key,
    audit_log.profile_id,
    audit_log.status_order,
    audit_log."wasSuccess",
    audit_log.website_data,
    concat(profiles.first_name, ' ', profiles.last_name) as actor_name,
    profiles.user_id as actor_user_id,
    profiles.role as actor_role,
    audit_log.dietary_requirement
from (audit_log
left join profiles on ((audit_log.actor_profile_id = profiles.primary_key)))
order by audit_log.created_at;
