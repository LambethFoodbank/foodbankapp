create type "public"."day_of_week" as enum ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

create type "public"."collection_availability_day" as ("day" day_of_week, "is_active" boolean);

alter table "public"."collection_centres"
    add column "available_days" collection_availability_day[]
    not null
    default ARRAY[
        ('Monday', true),
        ('Tuesday', true),
        ('Wednesday', true),
        ('Thursday', true),
        ('Friday', true),
        ('Saturday', true),
        ('Sunday', true)
    ]::collection_availability_day[];
