create or replace view "public"."dietary_rules_plus" as
select
    dr.primary_key,
    dr.diet_id,
    d.name as diet_name,
    dr.item_id,
    l.item_name,
    l.item_type,
    dr.status
from
    dietary_rules dr
        join diets d on dr.diet_id = d.primary_key
        join lists l on dr.item_id = l.primary_key;
