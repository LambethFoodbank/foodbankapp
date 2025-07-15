create table "public"."agencies" (
    "id_agency" uuid not null default gen_random_uuid(),
    "name" text
);


alter table "public"."agencies" enable row level security;

create table "public"."referrers" (
    "id_referrer" uuid not null default gen_random_uuid(),
    "id_agency" uuid,
    "name" text,
    "email" text,
    "phone" text
);


alter table "public"."referrers" enable row level security;

alter table "public"."parcels" add column "id_agency" uuid;

alter table "public"."parcels" add column "id_referrer" uuid;

CREATE UNIQUE INDEX agencies_pkey ON public.agencies USING btree (id_agency);

CREATE UNIQUE INDEX referrers_pkey ON public.referrers USING btree (id_referrer);

alter table "public"."agencies" add constraint "agencies_pkey" PRIMARY KEY using index "agencies_pkey";

alter table "public"."referrers" add constraint "referrers_pkey" PRIMARY KEY using index "referrers_pkey";

alter table "public"."parcels" add constraint "parcels_id_agency_fkey" FOREIGN KEY (id_agency) REFERENCES agencies(id_agency) not valid;

alter table "public"."parcels" validate constraint "parcels_id_agency_fkey";

alter table "public"."parcels" add constraint "parcels_id_referrer_fkey" FOREIGN KEY (id_referrer) REFERENCES referrers(id_referrer) not valid;

alter table "public"."parcels" validate constraint "parcels_id_referrer_fkey";

alter table "public"."referrers" add constraint "referrers_id_agency_fkey" FOREIGN KEY (id_agency) REFERENCES agencies(id_agency) not valid;

alter table "public"."referrers" validate constraint "referrers_id_agency_fkey";

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
    parcels.list_type
   FROM (((((parcels
     LEFT JOIN collection_centres ON ((parcels.collection_centre = collection_centres.primary_key)))
     LEFT JOIN clients ON ((parcels.client_id = clients.primary_key)))
     LEFT JOIN packing_slots ON ((parcels.packing_slot = packing_slots.primary_key)))
     LEFT JOIN family_count ON ((family_count.family_id = clients.family_id)))
     LEFT JOIN parcels_events ON ((parcels_events.parcel_id = parcels.primary_key)))
  ORDER BY parcels.packing_date DESC;


grant delete on table "public"."agencies" to "anon";

grant insert on table "public"."agencies" to "anon";

grant references on table "public"."agencies" to "anon";

grant select on table "public"."agencies" to "anon";

grant trigger on table "public"."agencies" to "anon";

grant truncate on table "public"."agencies" to "anon";

grant update on table "public"."agencies" to "anon";

grant delete on table "public"."agencies" to "authenticated";

grant insert on table "public"."agencies" to "authenticated";

grant references on table "public"."agencies" to "authenticated";

grant select on table "public"."agencies" to "authenticated";

grant trigger on table "public"."agencies" to "authenticated";

grant truncate on table "public"."agencies" to "authenticated";

grant update on table "public"."agencies" to "authenticated";

grant delete on table "public"."agencies" to "service_role";

grant insert on table "public"."agencies" to "service_role";

grant references on table "public"."agencies" to "service_role";

grant select on table "public"."agencies" to "service_role";

grant trigger on table "public"."agencies" to "service_role";

grant truncate on table "public"."agencies" to "service_role";

grant update on table "public"."agencies" to "service_role";

grant delete on table "public"."referrers" to "anon";

grant insert on table "public"."referrers" to "anon";

grant references on table "public"."referrers" to "anon";

grant select on table "public"."referrers" to "anon";

grant trigger on table "public"."referrers" to "anon";

grant truncate on table "public"."referrers" to "anon";

grant update on table "public"."referrers" to "anon";

grant delete on table "public"."referrers" to "authenticated";

grant insert on table "public"."referrers" to "authenticated";

grant references on table "public"."referrers" to "authenticated";

grant select on table "public"."referrers" to "authenticated";

grant trigger on table "public"."referrers" to "authenticated";

grant truncate on table "public"."referrers" to "authenticated";

grant update on table "public"."referrers" to "authenticated";

grant delete on table "public"."referrers" to "service_role";

grant insert on table "public"."referrers" to "service_role";

grant references on table "public"."referrers" to "service_role";

grant select on table "public"."referrers" to "service_role";

grant trigger on table "public"."referrers" to "service_role";

grant truncate on table "public"."referrers" to "service_role";

grant update on table "public"."referrers" to "service_role";


