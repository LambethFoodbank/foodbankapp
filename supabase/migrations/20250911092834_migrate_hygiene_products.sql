INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    'female'
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Bladder Control Pads'
WHERE
    'Female Incontinence Pads' = ANY(c.hygiene_other_items);

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    'male'
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Bladder Control Pads'
WHERE
    'Male Incontinence Pads' = ANY(c.hygiene_other_items);

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    c.hygiene_pads
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Pads'
WHERE
    c.hygiene_pads IS NOT NULL;

INSERT INTO public.clients_preferred_items (client_id, item_id, notes)
SELECT
    c.primary_key,
    l.primary_key,
    c.hygiene_tampons
FROM
    public.clients c
        JOIN public.lists l ON l.item_name = 'Tampons'
WHERE
    c.hygiene_tampons IS NOT NULL;
