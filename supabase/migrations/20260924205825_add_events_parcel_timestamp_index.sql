
create index events_parcel_timestamp_index
on public.events (parcel_id, "timestamp" desc, primary_key desc)
include (new_parcel_status, event_data);
