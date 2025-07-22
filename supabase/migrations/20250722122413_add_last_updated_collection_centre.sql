alter table "public"."collection_centres" add column "last_updated" timestamp with time zone default current_timestamp;
update "public"."collection_centres" set last_updated = current_timestamp;
alter table "public"."collection_centres" alter column "last_updated" set not null;