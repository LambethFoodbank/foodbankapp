create type "public"."item_dietary_status" as enum ('included', 'excluded', 'not_specified');

create table "public"."dietary_requirements" (
    "id" uuid not null default gen_random_uuid(),
    "halal" item_dietary_status,
    "vegetarian" item_dietary_status,
    "vegan" item_dietary_status,
    "meat" item_dietary_status,
    "gluten_free" item_dietary_status,
    "pescatarian" item_dietary_status,
    "dairy_free" item_dietary_status,
    "seafood_allergy" item_dietary_status,
    "pet_food" item_dietary_status
);


alter table "public"."dietary_requirements" enable row level security;

CREATE UNIQUE INDEX dietary_requirements_pkey ON public.dietary_requirements USING btree (id);

alter table "public"."dietary_requirements" add constraint "dietary_requirements_pkey" PRIMARY KEY using index "dietary_requirements_pkey";

alter table "public"."dietary_requirements" add constraint "dietary_requirements_id_fkey" FOREIGN KEY (id) REFERENCES lists(primary_key) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."dietary_requirements" validate constraint "dietary_requirements_id_fkey";

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
    parcels.notes AS parcel_notes
   FROM (((((parcels
     LEFT JOIN collection_centres ON ((parcels.collection_centre = collection_centres.primary_key)))
     LEFT JOIN clients ON ((parcels.client_id = clients.primary_key)))
     LEFT JOIN packing_slots ON ((parcels.packing_slot = packing_slots.primary_key)))
     LEFT JOIN family_count ON ((family_count.family_id = clients.family_id)))
     LEFT JOIN parcels_events ON ((parcels_events.parcel_id = parcels.primary_key)))
  ORDER BY parcels.packing_date DESC;


grant delete on table "public"."dietary_requirements" to "anon";

grant insert on table "public"."dietary_requirements" to "anon";

grant references on table "public"."dietary_requirements" to "anon";

grant select on table "public"."dietary_requirements" to "anon";

grant trigger on table "public"."dietary_requirements" to "anon";

grant truncate on table "public"."dietary_requirements" to "anon";

grant update on table "public"."dietary_requirements" to "anon";

grant delete on table "public"."dietary_requirements" to "authenticated";

grant insert on table "public"."dietary_requirements" to "authenticated";

grant references on table "public"."dietary_requirements" to "authenticated";

grant select on table "public"."dietary_requirements" to "authenticated";

grant trigger on table "public"."dietary_requirements" to "authenticated";

grant truncate on table "public"."dietary_requirements" to "authenticated";

grant update on table "public"."dietary_requirements" to "authenticated";

grant delete on table "public"."dietary_requirements" to "service_role";

grant insert on table "public"."dietary_requirements" to "service_role";

grant references on table "public"."dietary_requirements" to "service_role";

grant select on table "public"."dietary_requirements" to "service_role";

grant trigger on table "public"."dietary_requirements" to "service_role";

grant truncate on table "public"."dietary_requirements" to "service_role";

grant update on table "public"."dietary_requirements" to "service_role";


