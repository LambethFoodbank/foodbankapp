alter table "public"."packing_slots" add column "last_updated" timestamp with time zone default current_timestamp;
update "public"."packing_slots" set last_updated = current_timestamp;
alter table "public"."packing_slots" alter column "last_updated" set not null;
