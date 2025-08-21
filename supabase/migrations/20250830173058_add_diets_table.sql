create table "public"."diets" (
    "primary_key" uuid not null default gen_random_uuid(),
    "name" text not null,
    "notes" text
);

alter table "public"."diets" enable row level security;

CREATE UNIQUE INDEX diets_name_key ON public.diets USING btree (name);
CREATE UNIQUE INDEX diets_pkey ON public.diets USING btree (primary_key);

alter table "public"."diets" add constraint "diets_pkey" PRIMARY KEY using index "diets_pkey";
alter table "public"."diets" add constraint "diets_name_key" UNIQUE using index "diets_name_key";

create policy "Enable access for admin user, select for authenticated"
on "public"."diets"
as permissive
for all
to authenticated
using (true)
with check (user_is_admin());

insert into "public"."diets" ("name", "notes")
values
    ('halal', null),
    ('vegetarian', null),
    ('vegan', null),
    ('meat', null),
    ('gluten_free', null),
    ('pescatarian', null),
    ('dairy_free', null),
    ('seafood_allergy', null);