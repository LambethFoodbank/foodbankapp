set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delivery_area_order_swap(id1 uuid, id2 uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
    row1order INT;
    row2order INT;
BEGIN
    SELECT "order" INTO row1order FROM delivery_areas WHERE id = id1;
    SELECT "order" INTO row2order FROM delivery_areas WHERE id = id2;

    UPDATE delivery_areas
    SET "order" = -1
    WHERE id = id1;

    UPDATE delivery_areas
    SET "order" = row1order
    WHERE id = id2;

    UPDATE delivery_areas
    SET "order" = row2order
    WHERE id = id1;
END;$function$
;


