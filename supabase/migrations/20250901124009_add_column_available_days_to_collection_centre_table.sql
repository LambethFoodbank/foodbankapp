create type "public"."day_of_week" as enum ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

create type "public"."collection_availability_day" as ("day" day_of_week, "is_active" boolean);

alter table "public"."collection_centres" add column "available_days" collection_availability_day[];
alter table "public"."collection_centres" alter column "available_days" set not null;
alter table "public"."collection_centres" alter column "available_days" set default
    ARRAY[
        ('Monday', false),
        ('Tuesday', false),
        ('Wednesday', false),
        ('Thursday', false),
        ('Friday', false),
        ('Saturday', false),
        ('Sunday', false)
    ]::collection_availability_day[];
