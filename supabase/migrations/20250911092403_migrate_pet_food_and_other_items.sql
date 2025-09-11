INSERT INTO public.clients_preferred_items (client_id, item_id)
SELECT
    c.primary_key,
    l.primary_key
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Cat Food'
WHERE
    'Cat' = ANY(c.pet_food);

INSERT INTO public.clients_preferred_items (client_id, item_id)
SELECT
    c.primary_key,
    l.primary_key
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Dog Food'
WHERE
    'Dog' = ANY(c.pet_food);

INSERT INTO public.clients_preferred_items (client_id, item_id)
SELECT
    c.primary_key,
    l.primary_key
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Blanket'
WHERE
    'Blanket' = ANY(c.other_items);

INSERT INTO public.clients_preferred_items (client_id, item_id)
SELECT
    c.primary_key,
    l.primary_key
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Hot Water Bottle'
WHERE
    'Hot Water Bottle' = ANY(c.other_items);