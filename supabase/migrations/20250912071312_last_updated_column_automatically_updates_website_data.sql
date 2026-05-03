create trigger handle_updated_at
    before update on public.website_data
    for each row
    execute function moddatetime('last_updated');
