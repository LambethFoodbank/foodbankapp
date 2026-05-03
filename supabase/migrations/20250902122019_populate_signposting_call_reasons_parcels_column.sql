UPDATE parcels p
SET signposting_call_reasons = c.signposting_call_reasons
    FROM clients c
WHERE p.client_id = c.primary_key;
