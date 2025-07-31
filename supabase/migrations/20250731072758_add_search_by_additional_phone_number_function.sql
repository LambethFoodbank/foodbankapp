set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.search_by_additional_phone_number(search_number text)
 RETURNS SETOF clients
 LANGUAGE plpgsql
AS $function$
  begin
    return query 
      select *
      from clients
      where is_active = true and exists(
        select 1 from unnest(clients.additional_phone_numbers) as phone
        where phone ilike '%' || search_number || '%'
      );
  end;
$function$
;


