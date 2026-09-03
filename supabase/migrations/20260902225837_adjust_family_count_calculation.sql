drop view if exists "public"."reports";

drop view if exists "public"."parcels_plus";

drop view if exists "public"."clients_plus";

drop view if exists "public"."family_count";


-- new family_count view excludes children under 1 year old from the count

create or replace view
    "public"."family_count" with (security_invoker = true) as
select
    family_id,
    count(*) as family_count
from public.families
where
    birth_year is null
    or birth_year < extract(year from current_date) - 1
    or (
        birth_year = extract(year from current_date) - 1
        and (
            birth_month is null
            or birth_month < extract(month from current_date)
        )
    )
group by family_id;


-- unchanged clients_plus view

create or replace view
  public.clients_plus with (security_invoker = true) as
select
    clients.primary_key as client_id,
    clients.full_name,
    clients.address_postcode,
    clients.phone_number,
    clients.is_active,
    family_count.family_count,
    clients.email,
    array_to_string(clients.additional_phone_numbers, ', ') as additional_phone_numbers_text,
    ((delivery_areas.postcode is not null and clients.is_active is true) or clients.address_postcode is null) as is_deliverable,
    create_postcode_sort_key(clients.address_postcode) as sorted_address_postcode
from
    clients
        left join family_count on clients.family_id = family_count.family_id
        left join delivery_areas on split_part(clients.address_postcode, ' ', 1) = delivery_areas.postcode
order by
    clients.full_name;


-- unchanged parcels_plus & reports views

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
    clients.phone_number as client_phone_number,
    clients.is_active as client_is_active,
    family_count.family_count,
    parcels_events.last_event_name as last_status_event_name,
    parcels_events.last_event_data as last_status_event_data,
    parcels_events.last_event_timestamp as last_status_timestamp,
    parcels_events.last_event_workflow_order as last_status_workflow_order,
    parcels_events.last_event_is_successfully_completed as last_status_is_successfully_completed,
    parcels_events.all_events,
    clients.delivery_instructions as client_delivery_instructions,
    parcels.list_type,
    parcels.referral_agency,
    parcels.referrer_name,
    parcels.referrer_email,
    parcels.referrer_phone,
    clients.email as client_email,
    parcels.flagged_for_attention,
    parcels.signposting_call_required,
    array_to_string(clients.additional_phone_numbers, ', ') as client_additional_phone_numbers_text,
    clients_plus.is_deliverable,
    clients_plus.sorted_address_postcode as sorted_client_address_postcode
from parcels
    left join collection_centres on parcels.collection_centre = collection_centres.primary_key
    left join clients on parcels.client_id = clients.primary_key
    left join clients_plus on clients_plus.client_id = clients.primary_key
    left join packing_slots on parcels.packing_slot = packing_slots.primary_key
    left join family_count on family_count.family_id = clients.family_id
    left join parcels_events on parcels_events.parcel_id = parcels.primary_key
order by parcels.packing_date desc;


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
