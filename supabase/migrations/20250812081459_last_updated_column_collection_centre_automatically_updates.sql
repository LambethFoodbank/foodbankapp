create extension if not exists "moddatetime" with schema "extensions";

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.collection_centres FOR EACH ROW EXECUTE FUNCTION moddatetime('last_updated');
