
alter table "public"."clients" alter column "cooking_facilities" drop not null;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public."deactivateClient"(clientid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
    updated_family_id UUID;
BEGIN  
    UPDATE clients 
    SET 
        full_name = null,
        phone_number = null,
        address_1 = null,
        address_2 = null,
        address_town = null,
        address_county = null,
        address_postcode = null,
        delivery_instructions = null,
        dietary_requirements = null,
        feminine_products = null,
        baby_food = null,
        pet_food = null,
        other_items = null,
        extra_information = null,
        flagged_for_attention = null,
        signposting_call_required = null,
        is_active = false,
        notes = null,
        cooking_facilities = null
    WHERE 
        primary_key = clientId;

    SELECT family_id INTO updated_family_id
    FROM clients
    WHERE primary_key = clientId;

    DELETE FROM families WHERE family_id = updated_family_id;

END;$function$
;