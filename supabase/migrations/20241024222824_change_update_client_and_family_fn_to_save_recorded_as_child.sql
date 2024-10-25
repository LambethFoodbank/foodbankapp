set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_client_and_family(clientrecord jsonb, clientid uuid, familymembers jsonb)
 RETURNS update_client_result
 LANGUAGE plpgsql
AS $function$DECLARE
    updated_family_id UUID;
    member JSONB;
    rows_updated INTEGER;
    return_values update_client_result;
BEGIN  
    UPDATE clients 
    SET 
        full_name = clientRecord->>'full_name',
        phone_number = clientRecord->>'phone_number',
        address_1 = clientRecord->>'address_1',
        address_2 = clientRecord->>'address_2',
        address_town = clientRecord->>'address_town',
        address_county = clientRecord->>'address_county',
        address_postcode = clientRecord->>'address_postcode',
        delivery_instructions = clientRecord->>'delivery_instructions',
        dietary_requirements = ARRAY(SELECT * FROM jsonb_array_elements_text(clientRecord->'dietary_requirements')),
        feminine_products = ARRAY(SELECT * FROM jsonb_array_elements_text(clientRecord->'feminine_products')),
        baby_food = CASE WHEN clientRecord->>'baby_food' = 'true' THEN TRUE
                         WHEN clientRecord->>'baby_food' = 'false' THEN FALSE
                         ELSE NULL END,
        pet_food = ARRAY(SELECT * FROM jsonb_array_elements_text(clientRecord->'pet_food')),
        other_items = ARRAY(SELECT * FROM jsonb_array_elements_text(clientRecord->'other_items')),
        extra_information = clientRecord->>'extra_information',
        flagged_for_attention = CASE WHEN clientRecord->>'flagged_for_attention' = 'true' THEN TRUE
                                     WHEN clientRecord->>'flagged_for_attention' = 'false' THEN FALSE
                                     ELSE NULL END,
        signposting_call_required = CASE WHEN clientRecord->>'signposting_call_required' = 'true' THEN TRUE
                                          WHEN clientRecord->>'signposting_call_required' = 'false' THEN FALSE
                                          ELSE NULL END,
        notes = clientRecord->>'notes',
        default_list = CAST(clientRecord->>'default_list' as list_type)
    WHERE 
        primary_key = clientId 
        AND last_updated = (clientRecord->>'last_updated')::timestamp with time zone;
     
    GET DIAGNOSTICS rows_updated = ROW_COUNT;

    SELECT family_id INTO updated_family_id
    FROM clients
    WHERE primary_key = clientId;

    DELETE FROM families WHERE family_id = updated_family_id;

    FOR member IN SELECT * FROM jsonb_array_elements(familyMembers)
    LOOP
        INSERT INTO families (
            family_id,
            birth_year,
            birth_month,
            recorded_as_child,
            gender
        )
        VALUES (
            updated_family_id,
            (member->>'birth_year')::numeric,
            (member->>'birth_month')::numeric,
            (member->>'recorded_as_child')::boolean,
            (member->>'gender')::gender
        );
    END LOOP;

    return_values := ROW(clientId, rows_updated);

    RETURN return_values;
END;$function$
;


