
UPDATE "public"."status_order"
SET "event_name" = 'Fulfilled with Trussell'
WHERE "event_name" = 'Fulfilled with Trussell Trust';

UPDATE "public"."events"
  SET "new_parcel_status" = 'Fulfilled with Trussell'
WHERE "new_parcel_status" = 'Fulfilled with Trussell Trust';
