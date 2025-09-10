set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.insert_collection_centre_with_availability(
    centre_data jsonb,
    availability_data jsonb
) RETURNS uuid
LANGUAGE plpgsql
AS $function$
DECLARE
new_centre_id UUID;
    day_record JSONB;
    time_slots_array collection_timeslot_type[];
BEGIN
    -- Insert into collection_centres
INSERT INTO collection_centres (
    name,
    acronym,
    is_shown,
    is_delivery
)
VALUES (
           centre_data->>'name',
           centre_data->>'acronym',
           (centre_data->>'is_shown')::boolean,
           (centre_data->>'is_delivery')::boolean
       )
    RETURNING primary_key INTO new_centre_id;

RAISE LOG 'Inserted collection centre id: %', new_centre_id;

    IF new_centre_id IS NULL THEN
        RETURN NULL;
END IF;

FOR day_record IN
SELECT * FROM jsonb_array_elements(availability_data)
                  LOOP
SELECT array_agg(
               (NULLIF(ts->>'time','')::time, (ts->>'is_active')::boolean)::collection_timeslot_type
                ORDER BY NULLIF(ts->>'time','')::time
       )
INTO time_slots_array
FROM jsonb_array_elements(day_record->'time_slots') ts
WHERE NULLIF(ts->>'time','') IS NOT NULL;

time_slots_array := COALESCE(time_slots_array, '{}'::collection_timeslot_type[]);

INSERT INTO collection_centres_availability (
    collection_centre_id,
    day_index,
    time_slots,
    is_active
)
VALUES (
           new_centre_id,
           (day_record->>'day_index')::smallint,
           time_slots_array,
           (day_record->>'is_active')::boolean
       );
END LOOP;

RETURN new_centre_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_collection_centre_with_availability(
    centre_data jsonb,
    availability_data jsonb,
    original_last_updated timestamp
) RETURNS uuid
LANGUAGE plpgsql
AS $function$
DECLARE
updated_centre_id UUID;
    day_record JSONB;
    time_slots_array collection_timeslot_type[];
BEGIN
UPDATE collection_centres
SET
    name = centre_data->>'name',
    acronym = centre_data->>'acronym',
    is_shown = (centre_data->>'is_shown')::boolean,
    is_delivery = (centre_data->>'is_delivery')::boolean,
    last_updated = now()
WHERE primary_key = (centre_data->>'primary_key')::uuid
  AND last_updated = original_last_updated
    RETURNING primary_key INTO updated_centre_id;

RAISE LOG 'Updated collection centre id: %', updated_centre_id;

    IF updated_centre_id IS NULL THEN
        RETURN NULL;
END IF;

DELETE FROM collection_centres_availability
WHERE collection_centre_id = updated_centre_id;

FOR day_record IN
SELECT * FROM jsonb_array_elements(availability_data)
                  LOOP
SELECT array_agg(
               (NULLIF(ts->>'time','')::time, (ts->>'is_active')::boolean)::collection_timeslot_type
                ORDER BY NULLIF(ts->>'time','')::time
       )
INTO time_slots_array
FROM jsonb_array_elements(day_record->'time_slots') ts
WHERE NULLIF(ts->>'time','') IS NOT NULL;

time_slots_array := COALESCE(time_slots_array, '{}'::collection_timeslot_type[]);

INSERT INTO collection_centres_availability (
    collection_centre_id,
    day_index,
    time_slots,
    is_active
)
VALUES (
           updated_centre_id,
           (day_record->>'day_index')::smallint,
           time_slots_array,
           (day_record->>'is_active')::boolean
       );
END LOOP;

RETURN updated_centre_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_collection_centre(
    centre_id uuid
) RETURNS boolean
LANGUAGE plpgsql
AS $function$
DECLARE
deleted_count int;
BEGIN
DELETE FROM collection_centres_availability
WHERE collection_centre_id = centre_id;

DELETE FROM collection_centres
WHERE primary_key = centre_id
    RETURNING 1 INTO deleted_count;

RETURN deleted_count IS NOT NULL;
END;
$function$;
