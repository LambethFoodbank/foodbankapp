create or replace view
  "public"."parcels_plus" with (security_invoker = true) as
select
  parcels.primary_key as parcel_id,
  parcels.collection_datetime,
  parcels.packing_date,
  parcels.created_at,
  packing_slots.name as packing_slot_name,
  packing_slots."order" as packing_slot_order,
  parcels.voucher_number,
  collection_centres.name as collection_centre_name,
  collection_centres.acronym as collection_centre_acronym,
  collection_centres.is_delivery,
  clients.primary_key as client_id,
  clients.full_name as client_full_name,
  clients.address_postcode as client_address_postcode,
  clients.flagged_for_attention as client_flagged_for_attention,
  clients.signposting_call_required as client_signposting_call_required,
  clients.phone_number as client_phone_number,
  clients.is_active as client_is_active,
  family_count.family_count,
  parcels_events.last_event_name as last_status_event_name,
  parcels_events.last_event_data as last_status_event_data,
  parcels_events.last_event_timestamp as last_status_timestamp,
  parcels_events.last_event_workflow_order as last_status_workflow_order,
  parcels_events.all_events,
  clients.delivery_instructions as client_delivery_instructions,
  parcels.list_type,
  (delivery_areas.postcode is not null) as is_deliverable
from
   ((((((parcels
  left join collection_centres on ((parcels.collection_centre = collection_centres.primary_key)))
  left join clients on ((parcels.client_id = clients.primary_key)))
  left join packing_slots on ((parcels.packing_slot = packing_slots.primary_key)))
  left join family_count on ((family_count.family_id = clients.family_id)))
  left join parcels_events on ((parcels_events.parcel_id = parcels.primary_key)))
  left join delivery_areas on ((split_part(clients.address_postcode, ' ', 1) = delivery_areas.postcode)))
order by
  parcels.packing_date desc;
