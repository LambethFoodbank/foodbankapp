drop view if exists "public"."clients_plus";

drop view if exists "public"."reports";

drop view if exists "public"."completed_parcels";

drop view if exists "public"."parcels_plus";

alter table "public"."delivery_areas" drop column "is_deliverable";

create or replace view "public"."clients_plus" as  SELECT clients.primary_key AS client_id,
    clients.full_name,
    clients.address_postcode,
    clients.phone_number,
    clients.is_active,
    family_count.family_count,
    (delivery_areas.postcode IS NOT NULL) AS is_deliverable
   FROM ((clients
     LEFT JOIN family_count ON ((clients.family_id = family_count.family_id)))
     LEFT JOIN delivery_areas ON ((split_part(clients.address_postcode, ' '::text, 1) = delivery_areas.postcode)))
  ORDER BY clients.full_name;


create or replace view "public"."parcels_plus" as  SELECT parcels.primary_key AS parcel_id,
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
    clients.delivery_instructions AS client_delivery_instructions,
    parcels.list_type,
    (delivery_areas.postcode IS NOT NULL) AS is_deliverable
   FROM ((((((parcels
     LEFT JOIN collection_centres ON ((parcels.collection_centre = collection_centres.primary_key)))
     LEFT JOIN clients ON ((parcels.client_id = clients.primary_key)))
     LEFT JOIN packing_slots ON ((parcels.packing_slot = packing_slots.primary_key)))
     LEFT JOIN family_count ON ((family_count.family_id = clients.family_id)))
     LEFT JOIN parcels_events ON ((parcels_events.parcel_id = parcels.primary_key)))
     LEFT JOIN delivery_areas ON ((split_part(clients.address_postcode, ' '::text, 1) = delivery_areas.postcode)))
  ORDER BY parcels.packing_date DESC;


create or replace view "public"."completed_parcels" as  WITH completed_events AS (
         SELECT events.parcel_id,
            max(events."timestamp") AS completed_timestamp
           FROM events
          WHERE (events.new_parcel_status IN ( SELECT status_order.event_name
                   FROM status_order
                  WHERE status_order.is_successfully_completed_event))
          GROUP BY events.parcel_id
        )
 SELECT completed_events.parcel_id,
    completed_events.completed_timestamp,
    parcels_plus.family_count,
    clients.pet_food
   FROM ((completed_events
     JOIN parcels_plus ON ((parcels_plus.parcel_id = completed_events.parcel_id)))
     LEFT JOIN clients ON ((parcels_plus.client_id = clients.primary_key)));


create or replace view "public"."reports" as  WITH first_completed_parcel AS (
         SELECT min(completed_parcels_1.completed_timestamp) AS start_date
           FROM completed_parcels completed_parcels_1
        ), list_of_weeks AS (
         SELECT generate_series((0)::numeric, ceil(((EXTRACT(epoch FROM date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone)) - EXTRACT(epoch FROM first_completed_parcel.start_date)) / ((((60 * 60) * 24) * 7))::numeric))) AS number_of_weeks_ago
           FROM first_completed_parcel
        )
 SELECT to_char((date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) - ((list_of_weeks.number_of_weeks_ago)::double precision * '7 days'::interval)), 'YYYY-MM-DD'::text) AS week_commencing,
    count(
        CASE
            WHEN (completed_parcels.family_count = 1) THEN 1
            ELSE NULL::integer
        END) AS family_size_1,
    count(
        CASE
            WHEN (completed_parcels.family_count = 2) THEN 1
            ELSE NULL::integer
        END) AS family_size_2,
    count(
        CASE
            WHEN (completed_parcels.family_count = 3) THEN 1
            ELSE NULL::integer
        END) AS family_size_3,
    count(
        CASE
            WHEN (completed_parcels.family_count = 4) THEN 1
            ELSE NULL::integer
        END) AS family_size_4,
    count(
        CASE
            WHEN (completed_parcels.family_count = 5) THEN 1
            ELSE NULL::integer
        END) AS family_size_5,
    count(
        CASE
            WHEN (completed_parcels.family_count = 6) THEN 1
            ELSE NULL::integer
        END) AS family_size_6,
    count(
        CASE
            WHEN (completed_parcels.family_count = 7) THEN 1
            ELSE NULL::integer
        END) AS family_size_7,
    count(
        CASE
            WHEN (completed_parcels.family_count = 8) THEN 1
            ELSE NULL::integer
        END) AS family_size_8,
    count(
        CASE
            WHEN (completed_parcels.family_count = 9) THEN 1
            ELSE NULL::integer
        END) AS family_size_9,
    count(
        CASE
            WHEN (completed_parcels.family_count >= 10) THEN 1
            ELSE NULL::integer
        END) AS family_size_10_plus,
    count(completed_parcels.parcel_id) AS total_parcels,
    count(
        CASE
            WHEN (completed_parcels.pet_food = ARRAY['Cat'::text]) THEN 1
            ELSE NULL::integer
        END) AS cat,
    count(
        CASE
            WHEN (completed_parcels.pet_food = ARRAY['Dog'::text]) THEN 1
            ELSE NULL::integer
        END) AS dog,
    count(
        CASE
            WHEN (completed_parcels.pet_food @> ARRAY['Cat'::text, 'Dog'::text]) THEN 1
            ELSE NULL::integer
        END) AS cat_and_dog,
    count(
        CASE
            WHEN (NOT (completed_parcels.pet_food = ARRAY[]::text[])) THEN 1
            ELSE NULL::integer
        END) AS total_with_pets
   FROM (list_of_weeks
     LEFT JOIN completed_parcels ON ((((date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) - ((list_of_weeks.number_of_weeks_ago)::double precision * '7 days'::interval)) <= completed_parcels.completed_timestamp) AND (completed_parcels.completed_timestamp < ((date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) - ((list_of_weeks.number_of_weeks_ago)::double precision * '7 days'::interval)) + '7 days'::interval)))))
  GROUP BY (to_char((date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) - ((list_of_weeks.number_of_weeks_ago)::double precision * '7 days'::interval)), 'YYYY-MM-DD'::text))
  ORDER BY (to_char((date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) - ((list_of_weeks.number_of_weeks_ago)::double precision * '7 days'::interval)), 'YYYY-MM-DD'::text)) DESC;



