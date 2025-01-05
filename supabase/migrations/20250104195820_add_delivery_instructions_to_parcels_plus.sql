
create or replace view "public"."parcels_plus" WITH (security_invoker = true) as  
  SELECT parcels.primary_key AS parcel_id,
    parcels.collection_datetime,
    parcels.packing_date,
    parcels.created_at,
    packing_slots.name AS packing_slot_name,
    packing_slots."order" AS packing_slot_order,
    parcels.voucher_number,
    collection_centres.name AS collection_centre_name,
    collection_centres.acronym AS collection_centre_acronym,
    collection_centres.is_delivery,
    clients.primary_key AS client_id,
    clients.full_name AS client_full_name,
    clients.address_postcode AS client_address_postcode,
    clients.flagged_for_attention AS client_flagged_for_attention,
    clients.signposting_call_required AS client_signposting_call_required,
    clients.phone_number AS client_phone_number,
    clients.is_active AS client_is_active,
    family_count.family_count,
    parcels_events.last_event_name AS last_status_event_name,
    parcels_events.last_event_data AS last_status_event_data,
    parcels_events.last_event_timestamp AS last_status_timestamp,
    parcels_events.last_event_workflow_order AS last_status_workflow_order,
    parcels_events.all_events,
    clients.delivery_instructions AS client_delivery_instructions
   FROM (((((parcels
     LEFT JOIN collection_centres ON ((parcels.collection_centre = collection_centres.primary_key)))
     LEFT JOIN clients ON ((parcels.client_id = clients.primary_key)))
     LEFT JOIN packing_slots ON ((parcels.packing_slot = packing_slots.primary_key)))
     LEFT JOIN family_count ON ((family_count.family_id = clients.family_id)))
     LEFT JOIN parcels_events ON ((parcels_events.parcel_id = parcels.primary_key)))
  ORDER BY parcels.packing_date DESC;
