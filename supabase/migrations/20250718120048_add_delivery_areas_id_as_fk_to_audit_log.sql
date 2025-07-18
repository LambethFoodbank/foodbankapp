alter table "public"."audit_log" add column "delivery_areas_id" uuid;

alter table "public"."audit_log" add constraint "audit_log_delivery_areas_id_fkey" FOREIGN KEY (delivery_areas_id) REFERENCES delivery_areas(id) not valid;

alter table "public"."audit_log" validate constraint "audit_log_delivery_areas_id_fkey";


