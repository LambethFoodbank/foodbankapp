CREATE TYPE insert_parcel_result AS (
    parcel_primary_key UUID,
    rows_inserted INTEGER
    );

CREATE OR REPLACE FUNCTION insert_parcel_with_delivery_instructions(
    parcel_record JSONB,
    delivery_instructions TEXT
) RETURNS insert_parcel_result AS
$$
DECLARE
rows_inserted INTEGER;
    client_id UUID := (parcel_record->>'client_id')::UUID;
    parcel_primary_key UUID;
    return_values insert_parcel_result;
BEGIN
INSERT INTO parcels (
    client_id,
    collection_centre,
    collection_datetime,
    list_type,
    notes,
    packing_date,
    packing_slot,
    referral_agency,
    referrer_email,
    referrer_name,
    referrer_phone,
    voucher_number
)
VALUES (
           client_id,
           (parcel_record->>'collection_centre')::UUID,
           (parcel_record->>'collection_datetime')::timestamp,
           CAST(parcel_record->>'list_type' AS list_type),
           parcel_record->>'notes',
           (parcel_record->>'packing_date')::date,
           (parcel_record->>'packing_slot')::UUID,
           parcel_record->>'referral_agency',
           parcel_record->>'referrer_email',
           parcel_record->>'referrer_name',
           parcel_record->>'referrer_phone',
           parcel_record->>'voucher_number'
       )
    RETURNING primary_key INTO parcel_primary_key;

GET DIAGNOSTICS rows_inserted = ROW_COUNT;

UPDATE clients
SET delivery_instructions = insert_parcel_with_delivery_instructions.delivery_instructions
WHERE primary_key = client_id;

return_values := ROW(parcel_primary_key, rows_inserted);
RETURN return_values;
END;
$$ LANGUAGE plpgsql;
