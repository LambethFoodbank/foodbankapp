CREATE OR REPLACE FUNCTION update_parcel_with_delivery_instructions(
    parcel_record JSONB,
    delivery_instructions TEXT,
    parcel_primary_key UUID
)
RETURNS TABLE (
    returned_parcel_primary_key uuid,
    rows_updated integer
)
LANGUAGE plpgsql AS
$$
DECLARE
client_id uuid := (parcel_record->>'client_id')::uuid;
BEGIN
UPDATE parcels
SET
    collection_centre   = (parcel_record->>'collection_centre')::uuid,
        collection_datetime = (parcel_record->>'collection_datetime')::timestamp,
        last_updated        = (parcel_record->>'last_updated')::timestamp,
        list_type           = CAST(parcel_record->>'list_type' AS list_type),
        notes               = parcel_record->>'notes',
        packing_date        = (parcel_record->>'packing_date')::date,
        packing_slot        = (parcel_record->>'packing_slot')::uuid,
        referral_agency     = parcel_record->>'referral_agency',
        referrer_email      = parcel_record->>'referrer_email',
        referrer_name       = parcel_record->>'referrer_name',
        referrer_phone      = parcel_record->>'referrer_phone',
        voucher_number      = parcel_record->>'voucher_number',
        flagged_for_attention      = (parcel_record->>'flagged_for_attention')::boolean,
        signposting_call_required      = (parcel_record->>'signposting_call_required')::boolean,
        signposting_call_reasons      =
        (
            SELECT array_agg(value)
            FROM jsonb_array_elements_text(parcel_record->'signposting_call_reasons') AS t(value)
        ),
        extra_information      = parcel_record->>'extra_information'
WHERE
    primary_key = parcel_primary_key
  AND last_updated = (parcel_record->>'last_updated')::timestamp;

GET DIAGNOSTICS rows_updated = ROW_COUNT;

UPDATE clients
SET delivery_instructions = update_parcel_with_delivery_instructions.delivery_instructions
WHERE primary_key = client_id;

RETURN QUERY SELECT parcel_primary_key, rows_updated;
END;
$$;
