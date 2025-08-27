CREATE OR REPLACE FUNCTION update_collection_centre_with_availability(
    centre_data jsonb,
    availability_data jsonb,
    original_last_updated timestamp
) RETURNS collection_centres AS $$
DECLARE
updated_centre collection_centres%rowtype;
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
    RETURNING * INTO updated_centre;

IF updated_centre IS NULL THEN
        RETURN NULL;
END IF;

DELETE FROM collection_centres_availability
WHERE collection_centre_id = updated_centre.primary_key;

FOR day_record IN
SELECT * FROM jsonb_array_elements(availability_data) AS d
    LOOP
SELECT array_agg(
               (NULLIF(ts->>'time','')::time, (ts->>'is_active')::boolean)::collection_timeslot_type
                ORDER BY NULLIF(ts->>'time','')::time
       ) INTO time_slots_array
FROM jsonb_array_elements(day_record->'time_slots') ts
WHERE NULLIF(ts->>'time','') IS NOT NULL;

time_slots_array := COALESCE(time_slots_array, '{}'::collection_timeslot_type[]);

INSERT INTO collection_centres_availability (
    collection_centre_id,
    day_index,
    time_slots,
    is_active
) VALUES (
             updated_centre.primary_key,
             (day_record->>'day_index')::smallint,
             time_slots_array,
             (day_record->>'is_active')::boolean
         );
END LOOP;

RETURN updated_centre;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_collection_centre_with_availability(
    centre_data jsonb,
    availability_data jsonb
) RETURNS collection_centres AS $$
DECLARE
new_centre collection_centres%rowtype;
    time_slots_array collection_timeslot_type[];
BEGIN
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
    RETURNING * INTO new_centre;

FOR day_record IN
SELECT * FROM jsonb_array_elements(availability_data) AS d
    LOOP
SELECT array_agg(
               (NULLIF(ts->>'time','')::time, (ts->>'is_active')::boolean)::collection_timeslot_type
                ORDER BY NULLIF(ts->>'time','')::time
       ) INTO time_slots_array
FROM jsonb_array_elements(day_record->'time_slots') ts
WHERE NULLIF(ts->>'time','') IS NOT NULL;

time_slots_array := COALESCE(time_slots_array, '{}'::collection_timeslot_type[]);

INSERT INTO collection_centres_availability (
    collection_centre_id,
    day_index,
    time_slots,
    is_active
) VALUES (
             new_centre.primary_key,
             (day_record->>'day_index')::smallint,
             time_slots_array,
             (day_record->>'is_active')::boolean
         );
END LOOP;

RETURN new_centre;
END;
$$ LANGUAGE plpgsql;