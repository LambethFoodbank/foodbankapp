-- DIETS

-- Insert Gluten Free diet for clients
INSERT INTO public.clients_diets (client_id, diet_id)
SELECT
    c.primary_key,
    d.primary_key
FROM
    public.clients c
        JOIN public.diets d ON d.name = 'Gluten Free'
WHERE
    'Gluten Free' = ANY(c.dietary_requirements);

-- Insert Dairy Free diet for clients
INSERT INTO public.clients_diets (client_id, diet_id)
SELECT
    c.primary_key,
    d.primary_key
FROM
    public.clients c
        JOIN public.diets d ON d.name = 'Dairy Free'
WHERE
    'Dairy Free' = ANY(c.dietary_requirements);

-- Insert Vegetarian diet for clients
INSERT INTO public.clients_diets (client_id, diet_id)
SELECT
    c.primary_key,
    d.primary_key
FROM
    public.clients c
        JOIN public.diets d ON d.name = 'Vegetarian'
WHERE
    'Vegetarian' = ANY(c.dietary_requirements);

-- Insert Vegan diet for clients
INSERT INTO public.clients_diets (client_id, diet_id)
SELECT
    c.primary_key,
    d.primary_key
FROM
    public.clients c
        JOIN public.diets d ON d.name = 'Vegan'
WHERE
    'Vegan' = ANY(c.dietary_requirements);

-- Insert Pescatarian diet for clients
INSERT INTO public.clients_diets (client_id, diet_id)
SELECT
    c.primary_key,
    d.primary_key
FROM
    public.clients c
        JOIN public.diets d ON d.name = 'Pescatarian'
WHERE
    'Pescatarian' = ANY(c.dietary_requirements);

-- Insert Pescatarian diet for clients
INSERT INTO public.clients_diets (client_id, diet_id)
SELECT
    c.primary_key,
    d.primary_key
FROM
    public.clients c
        JOIN public.diets d ON d.name = 'Pescatarian'
WHERE
    'Pescatarian' = ANY(c.dietary_requirements);

-- Insert Halal diet for clients
INSERT INTO public.clients_diets (client_id, diet_id)
SELECT
    c.primary_key,
    d.primary_key
FROM
    public.clients c
        JOIN public.diets d ON d.name = 'Halal'
WHERE
    'Halal' = ANY(c.dietary_requirements);

-- Insert Diabetic diet for clients
INSERT INTO public.clients_diets (client_id, diet_id)
SELECT
    c.primary_key,
    d.primary_key
FROM
    public.clients c
        JOIN public.diets d ON d.name = 'Diabetic'
WHERE
    'Diabetic' = ANY(c.dietary_requirements);

-- Insert Nut Allergy diet for clients
INSERT INTO public.clients_diets (client_id, diet_id)
SELECT
    c.primary_key,
    d.primary_key
FROM
    public.clients c
        JOIN public.diets d ON d.name = 'Nut Allergy'
WHERE
    'Nut Allergy' = ANY(c.dietary_requirements);

-- Insert Seafood Allergy diet for clients
INSERT INTO public.clients_diets (client_id, diet_id)
SELECT
    c.primary_key,
    d.primary_key
FROM
    public.clients c
        JOIN public.diets d ON d.name = 'Seafood Allergy'
WHERE
    'Seafood Allergy' = ANY(c.dietary_requirements);

-- ITEMS

INSERT INTO public.clients_preferred_items (client_id, item_id)
SELECT
    c.primary_key,
    l.primary_key
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Garlic'
WHERE
    'Garlic' = ANY(c.dietary_requirements);

INSERT INTO public.clients_preferred_items (client_id, item_id)
SELECT
    c.primary_key,
    l.primary_key
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Ginger'
WHERE
    'Ginger' = ANY(c.dietary_requirements);

INSERT INTO public.clients_preferred_items (client_id, item_id)
SELECT
    c.primary_key,
    l.primary_key
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Chillies'
WHERE
    'Chillies' = ANY(c.dietary_requirements);

INSERT INTO public.clients_preferred_items (client_id, item_id)
SELECT
    c.primary_key,
    l.primary_key
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Spices'
WHERE
    'Spices' = ANY(c.dietary_requirements);

-- CHOICE ITEMS

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    'prefers tea over coffee'
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Tea / Coffee'
WHERE
    'Tea' = ANY(c.dietary_requirements)
AND NOT
    'Coffee' = ANY(c.dietary_requirements);

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    'prefers coffee over tea'
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Tea / Coffee'
WHERE
    'Coffee' = ANY(c.dietary_requirements)
  AND NOT
    'Tea' = ANY(c.dietary_requirements);

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    'prefers pasta over rice'
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Pasta / Rice'
WHERE
    'Pasta' = ANY(c.dietary_requirements)
  AND NOT
    'Rice' = ANY(c.dietary_requirements);

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    'prefers pasta over rice'
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Pasta / Rice pouches'
WHERE
    'Pasta' = ANY(c.dietary_requirements)
  AND NOT
    'Rice' = ANY(c.dietary_requirements);

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    'prefers rice over pasta'
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Pasta / Rice'
WHERE
    'Rice' = ANY(c.dietary_requirements)
  AND NOT
    'Pasta' = ANY(c.dietary_requirements);

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    'prefers rice over pasta'
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Pasta / Rice pouches'
WHERE
    'Rice' = ANY(c.dietary_requirements)
  AND NOT
    'Pasta' = ANY(c.dietary_requirements);

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    'meats no pork'
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Meat & Pork / Meat (no pork)'
WHERE
    'Meat (No Pork)' = ANY(c.dietary_requirements)
  AND NOT
    'Meat & Pork' = ANY(c.dietary_requirements);

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    'meats with pork'
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Meat & Pork / Meat (no pork)'
WHERE
    'Meat & Pork' = ANY(c.dietary_requirements)
  AND NOT
    'Meat (No Pork)' = ANY(c.dietary_requirements);