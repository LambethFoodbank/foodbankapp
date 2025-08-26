update "public"."collection_centres_availability" set last_updated = current_timestamp;
alter table "public"."collection_centres_availability" alter column "last_updated" set not null;

create extension if not exists "moddatetime" with schema "extensions";

create trigger handle_updated_at before update on public.collection_centres_availability for each row execute function moddatetime('last_updated');
