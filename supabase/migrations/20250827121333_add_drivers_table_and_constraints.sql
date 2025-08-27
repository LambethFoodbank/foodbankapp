create table "public"."drivers" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "circuit_id" text,
    "last_updated" timestamp with time zone not null default current_timestamp
);

alter table "public"."drivers" enable row level security;

alter table "public"."audit_log" add column "driver_id" uuid;

CREATE UNIQUE INDEX drivers_pkey ON public.drivers USING btree (id);

alter table "public"."drivers" add constraint "drivers_pkey" PRIMARY KEY using index "drivers_pkey";

alter table "public"."audit_log" add constraint "audit_log_driver_id_fkey" FOREIGN KEY (driver_id) REFERENCES drivers(id) not valid;

alter table "public"."audit_log" validate constraint "audit_log_driver_id_fkey";

grant delete on table "public"."drivers" to "anon";

grant insert on table "public"."drivers" to "anon";

grant references on table "public"."drivers" to "anon";

grant select on table "public"."drivers" to "anon";

grant trigger on table "public"."drivers" to "anon";

grant truncate on table "public"."drivers" to "anon";

grant update on table "public"."drivers" to "anon";

grant delete on table "public"."drivers" to "authenticated";

grant insert on table "public"."drivers" to "authenticated";

grant references on table "public"."drivers" to "authenticated";

grant select on table "public"."drivers" to "authenticated";

grant trigger on table "public"."drivers" to "authenticated";

grant truncate on table "public"."drivers" to "authenticated";

grant update on table "public"."drivers" to "authenticated";

grant delete on table "public"."drivers" to "service_role";

grant insert on table "public"."drivers" to "service_role";

grant references on table "public"."drivers" to "service_role";

grant select on table "public"."drivers" to "service_role";

grant trigger on table "public"."drivers" to "service_role";

grant truncate on table "public"."drivers" to "service_role";

grant update on table "public"."drivers" to "service_role";

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION moddatetime('last_updated');
