alter table "public"."emergency_bags" add column "last_updated" timestamp with time zone not null default CURRENT_TIMESTAMP;

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.emergency_bags FOR EACH ROW EXECUTE FUNCTION moddatetime();
