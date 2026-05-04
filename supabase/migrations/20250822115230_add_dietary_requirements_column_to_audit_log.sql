alter table "public"."audit_log" add column "dietary_requirement" text;

create or replace view "public"."audit_log_plus" as  SELECT audit_log.action,
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
    concat(profiles.first_name, ' ', profiles.last_name) AS actor_name,
    profiles.user_id AS actor_user_id,
    profiles.role AS actor_role,
    audit_log.dietary_requirement
   FROM (audit_log
     LEFT JOIN profiles ON ((audit_log.actor_profile_id = profiles.primary_key)))
  ORDER BY audit_log.created_at;
