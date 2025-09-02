CREATE OR REPLACE FUNCTION insert_parcel_with_delivery_instructions(
    parcel_record JSONB,
    delivery_instructions TEXT
)
RETURNS TABLE (
    parcel_primary_key uuid,
    rows_inserted integer
)
LANGUAGE plpgsql AS
$$
DECLARE
client_id uuid := (parcel_record->>'client_id')::uuid;
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
    voucher_number,
    flagged_for_attention,
    signposting_call_required,
    signposting_call_reasons,
    extra_information
)
VALUES (
           client_id,
           (parcel_record->>'collection_centre')::uuid,
           (parcel_record->>'collection_datetime')::timestamp,
           CAST(parcel_record->>'list_type' AS list_type),
           parcel_record->>'notes',
           (parcel_record->>'packing_date')::date,
           (parcel_record->>'packing_slot')::uuid,
           parcel_record->>'referral_agency',
           parcel_record->>'referrer_email',
           parcel_record->>'referrer_name',
           parcel_record->>'referrer_phone',
           parcel_record->>'voucher_number',
            (parcel_record->>'flagged_for_attention')::boolean,
            (parcel_record->>'signposting_call_required')::boolean,
           (
               SELECT array_agg(value)
               FROM jsonb_array_elements_text(parcel_record->'signposting_call_reasons') AS t(value)
           ),
            parcel_record->>'extra_information'
       )
    RETURNING primary_key INTO STRICT parcel_primary_key;

GET DIAGNOSTICS rows_inserted = ROW_COUNT;

UPDATE clients
SET delivery_instructions = insert_parcel_with_delivery_instructions.delivery_instructions
WHERE primary_key = client_id;

RETURN NEXT;
END;
$$;
