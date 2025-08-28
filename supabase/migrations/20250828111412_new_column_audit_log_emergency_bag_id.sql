alter table "public"."audit_log" add column "emergency_bag_id" uuid;

alter table "public"."audit_log" add constraint "audit_log_emergency_bag_id_fkey" FOREIGN KEY (emergency_bag_id) REFERENCES emergency_bags(id) not valid;

alter table "public"."audit_log" validate constraint "audit_log_emergency_bag_id_fkey";


