UPDATE parcels p
SET signposting_call_required = c.signposting_call_required
    FROM clients c
WHERE p.client_id = c.primary_key;
