alter table "public"."families" alter column "gender" drop default;

alter table "public"."families" alter column "gender" drop not null;
