create or replace view "public"."dietary_requirements_plus" as  SELECT d.id,
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
   FROM (dietary_requirements d
     JOIN lists l ON ((d.id = l.primary_key)));
