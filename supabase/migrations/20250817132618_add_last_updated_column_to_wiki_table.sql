alter table "public"."wiki" add column "last_updated" timestamp with time zone default current_timestamp;
update "public"."wiki" set last_updated = current_timestamp;
alter table "public"."wiki" alter column "last_updated" set not null;
