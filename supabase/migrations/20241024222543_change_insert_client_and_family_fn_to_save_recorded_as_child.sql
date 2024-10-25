set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.insert_client_and_family(clientrecord jsonb, familymembers jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$DECLARE
    created_family_id UUID;
    member JSONB;
    inserted_client_id UUID;
BEGIN 
    INSERT INTO clients (
        full_name,
        phone_number,
        address_1,
        address_2,
        address_town,
        address_county,
        address_postcode,
        delivery_instructions,
        dietary_requirements,
        feminine_products,
        baby_food,
        pet_food,
        other_items,
        extra_information,
        flagged_for_attention,
        signposting_call_required,
        notes,
        default_list
    )
    VALUES (
        clientRecord->>'full_name',
        clientRecord->>'phone_number',
        clientRecord->>'address_1',
        clientRecord->>'address_2',
        clientRecord->>'address_town',
        clientRecord->>'address_county',
        clientRecord->>'address_postcode',
        clientRecord->>'delivery_instructions',
        array(select * from jsonb_array_elements_text(clientRecord->'dietary_requirements')),
        array(select * from jsonb_array_elements_text(clientRecord->'feminine_products')),
        CASE
            WHEN clientRecord->>'baby_food' = 'true' THEN TRUE
            WHEN clientRecord->>'baby_food' = 'false' THEN FALSE
            ELSE NULL END, 
        array(select * from jsonb_array_elements_text(clientRecord->'pet_food')),
        array(select * from jsonb_array_elements_text(clientRecord->'other_items')),
        clientRecord->>'extra_information',
        CASE
            WHEN clientRecord->>'flagged_for_attention' = 'true' THEN TRUE
            WHEN clientRecord->>'flagged_for_attention' = 'false' THEN FALSE
            ELSE NULL END,
        CASE
            WHEN clientRecord->>'signposting_call_required' = 'true' THEN TRUE
            WHEN clientRecord->>'signposting_call_required' = 'false' THEN FALSE
            ELSE NULL END,
        clientRecord->>'notes',
        CAST(clientRecord->>'default_list' as list_type)
    )
    RETURNING primary_key into inserted_client_id; 

    raise log 'inserted client id %', inserted_client_id;

     IF inserted_client_id IS NULL THEN
        RETURN NULL;
    END IF;
     
    SELECT family_id INTO created_family_id
        FROM clients
        WHERE primary_key = inserted_client_id;

    raise log 'created_family_id: %', created_family_id;

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
            created_family_id,
            (member->>'birth_year')::numeric,
            (member->>'birth_month')::numeric,
            (member->>'recorded_as_child')::boolean,
            (member->>'gender')::gender
        );
    END LOOP;

    RETURN inserted_client_id;
END;$function$
;


