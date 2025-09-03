set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_postcode_sort_key(pc text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
pc_norm text;
    outward text;
    inward text;
    outward_letters text;
    outward_digits int;
    outward_suffix text;
    inward_digits int;
    inward_letters text;
BEGIN
    pc_norm := upper(trim(pc));

    outward := split_part(pc_norm, ' ', 1);
    inward  := split_part(pc_norm, ' ', 2);

    outward_letters := regexp_replace(outward, '[0-9].*', '', '');

    outward_digits := NULLIF(regexp_replace(outward, '[^0-9]', '', 'g'), '')::int;

    outward_suffix := regexp_replace(outward, '^[A-Z]+[0-9]+', '', '');

    inward_digits := NULLIF(regexp_replace(inward, '[^0-9]', '', 'g'), '')::int;

    inward_letters := regexp_replace(inward, '[0-9]', '', 'g');

RETURN outward_letters
    || lpad(coalesce(outward_digits::text, ''), 4, '0')
    || outward_suffix
    || lpad(coalesce(inward_digits::text, ''), 3, '0')
    || inward_letters;
END;
$function$;
