set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.anonymise_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
    if new.user_id is null then
        new.first_name = null;
        new.last_name = null;
        new.telephone_number = null;
        new.email = null;
        new.created_at = null;
        new.updated_at = null;
        new.last_sign_in_at = null;
        update public.profiles
        set 
            first_name = new.first_name,
            last_name = new.last_name,
            telephone_number = new.telephone_number,
            email = new.telephone_number,
            created_at = new.created_at,
            updated_at = new.updated_at,
            last_sign_in_at = new.last_sign_in_at
        where primary_key = new.primary_key;
    end if;
    return new;
END;$function$
;


