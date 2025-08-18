create or replace view
  public.clients_plus as
select
    clients.primary_key as client_id,
    clients.full_name,
    clients.address_postcode,
    clients.phone_number,
    clients.is_active,
    family_count.family_count,
    clients.email,
    sort_address_postcode(clients.address_postcode) AS sorted_address_postcode
from
    clients
        left join family_count on clients.family_id = family_count.family_id
order by
    clients.full_name;
