create or replace view
    "public"."clients_plus" with (security_invoker = true) as
select
    clients.primary_key as client_id,
    clients.full_name,
    clients.address_postcode,
    clients.phone_number,
    clients.is_active,
    family_count.family_count,
    delivery_areas.is_deliverable
from
    ((clients
    left join family_count on ((clients.family_id = family_count.family_id)))
    left join delivery_areas on ((split_part(clients.address_postcode, ' ', 1) = delivery_areas.postcode)))
order by
    clients.full_name;