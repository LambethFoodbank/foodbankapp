create or replace view
  public.delivery_areas_plus with (security_invoker = true) as
select
    delivery_areas.id as delivery_area_id,
    delivery_areas.postcode,
    create_postcode_sort_key(delivery_areas.postcode) as postcode_sort_key
from
    delivery_areas
order by
    postcode_sort_key;
