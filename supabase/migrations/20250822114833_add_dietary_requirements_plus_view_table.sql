create or replace view
    "public"."dietary_requirements_plus" as
select
    l.primary_key AS id,
    l.item_name,
    d.halal,
    d.vegetarian,
    d.vegan,
    d.meat,
    d.gluten_free,
    d.pescatarian,
    d.dairy_free,
    d.seafood_allergy,
    d.pet_food
from
    lists l
        left join dietary_requirements d on d.id = l.primary_key;
