create or replace view
  public.clients_plus as
select
    clients.primary_key as client_id,
    clients.full_name,
    clients.address_postcode,
    clients.phone_number,
    clients.is_active,
    family_count.family_count,
    clients.additional_phone_numbers,
    array_to_string(clients.additional_phone_numbers, ' ') as additional_phone_numbers_text

from
    clients
        left join family_count on clients.family_id = family_count.family_id
order by
    clients.full_name;
