CREATE OR REPLACE VIEW collection_centres_with_availability AS
SELECT
    c.primary_key,
    c.name,
    c.acronym,
    c.is_shown,
    c.is_delivery,
    c.last_updated,
    COALESCE(
            json_agg(
                    json_build_object(
                            'day_index', a.day_index,
                            'is_active', a.is_active,
                            'time_slots', COALESCE(
                                    (SELECT json_agg(row_to_json(ts))
                                     FROM unnest(a.time_slots) AS ts),
                                    '[]'::json
                                          )
                    )
            ) FILTER (WHERE a.day_index IS NOT NULL),
            '[]'::json
    ) AS availability
FROM collection_centres c
         LEFT JOIN collection_centres_availability a
                   ON a.collection_centre_id = c.primary_key
GROUP BY c.primary_key, c.name, c.acronym, c.is_shown, c.is_delivery, c.last_updated;

alter view public.collection_centres_with_availability owner to postgres;

comment on view public.collection_centres_with_availability is
  E'@primary_key primary_key';

alter view public.collection_centres_with_availability set (security_invoker = true);
