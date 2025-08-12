CREATE TYPE update_parcel_result AS (
    parcel_primary_key UUID,
    rows_updated INTEGER
    );

CREATE OR REPLACE FUNCTION update_parcel_with_delivery_instructions(
    parcel_record JSONB,
    delivery_instructions TEXT,
    parcel_primary_key UUID
) RETURNS update_parcel_result AS
$$
DECLARE
    rows_updated INTEGER;
    client_id UUID := (parcel_record->>'client_id')::UUID;
    return_values update_parcel_result;
BEGIN
UPDATE parcels
SET
    collection_centre = (parcel_record->>'collection_centre')::UUID,
    collection_datetime = (parcel_record->>'collection_datetime')::timestamp,
    last_updated = (parcel_record->>'last_updated')::timestamp,
    list_type = CAST(parcel_record->>'list_type' AS list_type),
    notes = parcel_record->>'notes',
    packing_date = (parcel_record->>'packing_date')::date,
    packing_slot = (parcel_record->>'packing_slot')::UUID,
    referral_agency = parcel_record->>'referral_agency',
    referrer_email = parcel_record->>'referrer_email',
    referrer_name = parcel_record->>'referrer_name',
    referrer_phone = parcel_record->>'referrer_phone',
    voucher_number = parcel_record->>'voucher_number'
WHERE
    primary_key = parcel_primary_key
  AND last_updated = (parcel_record->>'last_updated')::timestamp;

GET DIAGNOSTICS rows_updated = ROW_COUNT;

UPDATE clients
SET delivery_instructions = update_parcel_with_delivery_instructions.delivery_instructions
WHERE primary_key = client_id;

return_values := ROW(parcel_primary_key, rows_updated);

RETURN return_values;
END;
$$ LANGUAGE plpgsql;
