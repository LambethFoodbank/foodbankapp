UPDATE parcels p
SET flagged_for_attention = c.flagged_for_attention
                             FROM clients c
                             WHERE p.client_id = c.primary_key;
