alter table "public"."parcels" alter column "referral_agency" set default ''::text;

alter table "public"."parcels" alter column "referrer_email" set default ''::text;

alter table "public"."parcels" alter column "referrer_name" set default ''::text;

alter table "public"."parcels" alter column "referrer_phone" set default ''::text;

alter table "public"."parcels" alter column "voucher_number" set default ''::text;
