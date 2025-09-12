UPDATE parcels p
SET extra_information = c.extra_information
    FROM clients c
WHERE p.client_id = c.primary_key;
