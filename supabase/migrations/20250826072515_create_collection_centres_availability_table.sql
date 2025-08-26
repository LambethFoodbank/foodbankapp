create table "public"."collection_centres_availability" (
    "primary_key" "uuid" default "gen_random_uuid"() not null,
    "collection_centre_id" "uuid" not null,
    "day_index" smallint not null,
    "is_active" boolean not null,
    "time_slots" collection_timeslot_type[],
    "last_updated" timestamp with time zone default current_timestamp
);

alter table "public"."collection_centres_availability" owner to "postgres";

alter table only "public"."collection_centres_availability"
    add constraint "collection_centres_availability_pkey" primary key ("primary_key");

alter table "public"."collection_centres_availability" enable row level security;

grant delete on table "public"."collection_centres_availability" to "anon";

grant insert on table "public"."collection_centres_availability" to "anon";

grant references on table "public"."collection_centres_availability" to "anon";

grant select on table "public"."collection_centres_availability" to "anon";

grant trigger on table "public"."collection_centres_availability" to "anon";

grant truncate on table "public"."collection_centres_availability" to "anon";

grant update on table "public"."collection_centres_availability" to "anon";

grant delete on table "public"."collection_centres_availability" to "authenticated";

grant insert on table "public"."collection_centres_availability" to "authenticated";

grant references on table "public"."collection_centres_availability" to "authenticated";

grant select on table "public"."collection_centres_availability" to "authenticated";

grant trigger on table "public"."collection_centres_availability" to "authenticated";

grant truncate on table "public"."collection_centres_availability" to "authenticated";

grant update on table "public"."collection_centres_availability" to "authenticated";

grant delete on table "public"."collection_centres_availability" to "service_role";

grant insert on table "public"."collection_centres_availability" to "service_role";

grant references on table "public"."collection_centres_availability" to "service_role";

grant select on table "public"."collection_centres_availability" to "service_role";

grant trigger on table "public"."collection_centres_availability" to "service_role";

grant truncate on table "public"."collection_centres_availability" to "service_role";

grant update on table "public"."collection_centres_availability" to "service_role";

create policy "Enable all access to admins"
on "public"."collection_centres_availability"
as permissive
for all
to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));
