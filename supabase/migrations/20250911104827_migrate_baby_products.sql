INSERT INTO public.clients_preferred_items (client_id, item_id)
SELECT
    c.primary_key,
    l.primary_key
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Baby Toiletries'
WHERE
    'Baby Toiletries' = ANY(c.baby_other_items);

INSERT INTO public.clients_preferred_items (client_id, item_id)
SELECT
    c.primary_key,
    l.primary_key
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Baby Wipes'
WHERE
    'Baby Wipes' = ANY(c.baby_other_items);

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    c.baby_food
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Baby Food'
WHERE
    c.baby_food IS NOT NULL;

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    c.baby_formula
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Baby Formula'
WHERE
    c.baby_formula IS NOT NULL;

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    c.baby_nappies
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Baby Nappies'
WHERE
    c.baby_nappies IS NOT NULL;
