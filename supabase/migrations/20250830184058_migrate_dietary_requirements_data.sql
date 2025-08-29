insert into "public"."dietary_rules" ("diet_id", "item_id", "status")
select
    d.primary_key as diet_id,
    dr.id as item_id,
    dr.vegetarian as status
from "public"."dietary_requirements" dr
         join "public"."diets" d on d.name = 'vegetarian'
where dr.vegetarian != 'not_specified'

union all

select
    d.primary_key as diet_id,
    dr.id as item_id,
    dr.vegan as status
from "public"."dietary_requirements" dr
         join "public"."diets" d on d.name = 'vegan'
where dr.vegan != 'not_specified'

union all

select
    d.primary_key as diet_id,
    dr.id as item_id,
    dr.halal as status
from "public"."dietary_requirements" dr
         join "public"."diets" d on d.name = 'halal'
where dr.halal != 'not_specified'

union all

select
    d.primary_key as diet_id,
    dr.id as item_id,
    dr.meat as status
from "public"."dietary_requirements" dr
         join "public"."diets" d on d.name = 'meat'
where dr.meat != 'not_specified'

union all

select
    d.primary_key as diet_id,
    dr.id as item_id,
    dr.gluten_free as status
from "public"."dietary_requirements" dr
         join "public"."diets" d on d.name = 'gluten_free'
where dr.gluten_free != 'not_specified'

union all

select
    d.primary_key as diet_id,
    dr.id as item_id,
    dr.pescatarian as status
from "public"."dietary_requirements" dr
         join "public"."diets" d on d.name = 'pescatarian'
where dr.pescatarian != 'not_specified'

union all

select
    d.primary_key as diet_id,
    dr.id as item_id,
    dr.dairy_free as status
from "public"."dietary_requirements" dr
         join "public"."diets" d on d.name = 'dairy_free'
where dr.dairy_free != 'not_specified'

union all

select
    d.primary_key as diet_id,
    dr.id as item_id,
    dr.seafood_allergy as status
from "public"."dietary_requirements" dr
         join "public"."diets" d on d.name = 'seafood_allergy'
where dr.seafood_allergy != 'not_specified';

update "public"."lists" l
set item_type = 'pet_food'
    from "public"."dietary_requirements" dr
where l.primary_key = dr.id
  and dr.pet_food = 'included';
