create or replace function insert_collection_centre_with_availability(
    centre_data jsonb,
    availability_data jsonb
) returns collection_centres as $$
declare
new_centre collection_centres%rowtype;
begin
insert into collection_centres (name, acronym)
values (centre_data->>'name', centre_data->>'acronym')
    returning * into new_centre;

insert into collection_centres_availability (
    collection_centre_id, day_index, time_slots, is_active
)
select
    new_centre.primary_key,
    (v->>'day_index')::smallint,
    v->>'time_slots'::collection_timeslot_type[],
    (v->>'is_active')::boolean
from jsonb_array_elements(availability_data) as v;

return new_centre;
end;
$$ language plpgsql;

create or replace function update_collection_centre_with_availability(
    centre_data jsonb,
    availability_data jsonb,
    original_last_updated timestamp
) returns collection_centres as $$
declare
updated_centre collection_centres%rowtype;
begin
update collection_centres
set name = centre_data->>'name',
    acronym = centre_data->>'acronym',
    last_updated = now()
where primary_key = (centre_data->>'primary_key')::uuid
  and last_updated = original_last_updated
    returning * into updated_centre;

if updated_centre is null then
        return null;
end if;

delete from collection_centres_availability
where collection_centre_id = updated_centre.primary_key;

insert into collection_centres_availability (
    collection_centre_id, day_index, time_slots, is_active
)
select
    updated_centre.primary_key,
    (v->>'day_index')::smallint,
    v->>'time_slots'::collection_timeslot_type[],
    (v->>'is_active')::boolean
from jsonb_array_elements(availability_data) as v;

return updated_centre;
end;
$$ language plpgsql;
