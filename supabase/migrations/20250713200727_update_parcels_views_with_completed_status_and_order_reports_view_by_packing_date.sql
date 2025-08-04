drop view if exists "public"."reports";

drop view if exists "public"."completed_parcels";

drop view if exists "public"."parcels_plus";

drop view if exists "public"."parcels_events";


create or replace view "public"."parcels_events" WITH (security_invoker = true) as
    WITH latest_events AS (
        SELECT
            e.parcel_id,
            e.new_parcel_status AS last_event_name,
            e."timestamp" AS last_event_timestamp,
            e.event_data AS last_event_data,
            o.workflow_order AS last_event_workflow_order,
            o.is_successfully_completed_event as last_event_is_successfully_completed,
            row_number() OVER (PARTITION BY e.parcel_id ORDER BY e."timestamp" DESC, e.parcel_id) AS row_num
        FROM
            events e
            LEFT JOIN status_order o ON o.event_name = e.new_parcel_status
    ),
    aggregated_events AS (
        SELECT
            e.parcel_id,
            array_agg(e.new_parcel_status ORDER BY o.workflow_order DESC) AS all_events
        FROM
            events e
            LEFT JOIN status_order o ON o.event_name = e.new_parcel_status
        GROUP BY e.parcel_id
    )
    SELECT
        p.primary_key AS parcel_id,
        le.last_event_name,
        le.last_event_timestamp,
        le.last_event_data,
        le.last_event_workflow_order,
        le.last_event_is_successfully_completed,
        ae.all_events
    FROM
        parcels p
        LEFT JOIN latest_events le ON p.primary_key = le.parcel_id AND le.row_num = 1
        LEFT JOIN aggregated_events ae ON p.primary_key = ae.parcel_id
    ORDER BY p.primary_key;


create or replace view "public"."parcels_plus" WITH (security_invoker = true) as  
    SELECT
        parcels.primary_key AS parcel_id,
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
        parcels_events.last_event_is_successfully_completed AS last_status_is_successfully_completed,
        parcels_events.all_events,
        clients.delivery_instructions AS client_delivery_instructions
    FROM
        parcels
        LEFT JOIN collection_centres ON parcels.collection_centre = collection_centres.primary_key
        LEFT JOIN clients ON parcels.client_id = clients.primary_key
        LEFT JOIN packing_slots ON parcels.packing_slot = packing_slots.primary_key
        LEFT JOIN family_count ON family_count.family_id = clients.family_id
        LEFT JOIN parcels_events ON parcels_events.parcel_id = parcels.primary_key
    ORDER BY parcels.packing_date DESC;


create or replace view "public"."reports" WITH (security_invoker = true) as
    WITH
        completed_parcels AS (
            SELECT
                parcels_plus.parcel_id,
                parcels_plus.packing_date,
                parcels_plus.family_count,
                clients.pet_food
            FROM
                parcels_plus
                LEFT JOIN clients ON parcels_plus.client_id = clients.primary_key
            WHERE
                parcels_plus.last_status_is_successfully_completed
        ),
        first_completed_parcel AS (
            SELECT min(packing_date) AS start_date
            FROM completed_parcels
        ),
        list_of_weeks AS (
            SELECT generate_series(
                (0)::numeric, 
                ceil(
                    (
                        EXTRACT(epoch FROM date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone)) 
                        - 
                        EXTRACT(epoch FROM first_completed_parcel.start_date)
                    ) 
                    / 
                    ((((60 * 60) * 24) * 7))::numeric
                )
            ) AS number_of_weeks_ago
            FROM first_completed_parcel
        )
    SELECT
        to_char(
            date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) - ((list_of_weeks.number_of_weeks_ago)::double precision * '7 days'::interval),
            'YYYY-MM-DD'::text
        ) AS week_commencing,
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
    FROM (
        list_of_weeks
        LEFT JOIN completed_parcels ON ((
                (date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) - ((list_of_weeks.number_of_weeks_ago)::double precision * '7 days'::interval))
                    <= 
                    completed_parcels.packing_date
            ) 
            AND (
                completed_parcels.packing_date 
                    < 
                    ((date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) - ((list_of_weeks.number_of_weeks_ago)::double precision * '7 days'::interval)) + '7 days'::interval)
            )
        )
    )
    GROUP BY (
        to_char(
            date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) - ((list_of_weeks.number_of_weeks_ago)::double precision * '7 days'::interval), 
            'YYYY-MM-DD'::text
        )
    )
    ORDER BY (
        to_char(
            date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) - ((list_of_weeks.number_of_weeks_ago)::double precision * '7 days'::interval),
            'YYYY-MM-DD'::text
        )
    ) DESC;
