update public.audit_log
  set event_id = null
  from public.events
  where audit_log.event_id = events.primary_key
    and events.new_parcel_status = 'Day Overview Downloaded';

delete from public.events where new_parcel_status = 'Day Overview Downloaded';

delete from public.status_order where event_name = 'Day Overview Downloaded';


update public.status_order set workflow_order = 0 where event_name = '';
update public.status_order set workflow_order = 1 where event_name = 'Parcel Denied';
update public.status_order set workflow_order = 2 where event_name = 'Pending More Info';
update public.status_order set workflow_order = 3 where event_name = 'Called and Confirmed';
update public.status_order set workflow_order = 4 where event_name = 'Called and No Response';
update public.status_order set workflow_order = 5 where event_name = 'Shopping List Downloaded';
update public.status_order set workflow_order = 6 where event_name = 'Ready to Dispatch';
update public.status_order set workflow_order = 7 where event_name = 'Received by Centre';
update public.status_order set workflow_order = 8 where event_name = 'Collection Failed';
update public.status_order set workflow_order = 9 where event_name = 'Parcel Collected';
update public.status_order set workflow_order = 10 where event_name = 'Shipping Labels Downloaded';
update public.status_order set workflow_order = 11 where event_name = 'Packing Date Changed';
update public.status_order set workflow_order = 12 where event_name = 'Packing Slot Changed';
update public.status_order set workflow_order = 13 where event_name = 'Out for Delivery';
update public.status_order set workflow_order = 14 where event_name = 'Delivered';
update public.status_order set workflow_order = 15 where event_name = 'Delivery Failed';
update public.status_order set workflow_order = 16 where event_name = 'Delivery Cancelled';
update public.status_order set workflow_order = 17 where event_name = 'Fulfilled with Trussell Trust';
update public.status_order set workflow_order = 18 where event_name = 'Parcel Deleted';
