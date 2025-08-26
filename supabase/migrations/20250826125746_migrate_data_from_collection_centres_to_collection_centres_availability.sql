insert into collection_centres_availability (
    collection_centre_id,
    day_index,
    is_active,
    time_slots
)
select
    cc.primary_key as collection_centre_id,
    gs.day_index,
    case when cc.is_delivery then false else true end as is_active,
    cc.time_slots
from collection_centres cc
         cross join generate_series(0, 6) as gs(day_index);
