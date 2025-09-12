alter table "public"."parcels" add column "signposting_call_reasons" text[] default '{}'::text[];

alter table "public"."parcels" add column "signposting_call_required" boolean default false;
