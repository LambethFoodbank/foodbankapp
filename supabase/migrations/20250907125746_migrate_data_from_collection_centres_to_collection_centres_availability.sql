INSERT INTO collection_centres_availability (
    collection_centre_id,
    day_index,
    is_active,
    time_slots,
    last_updated
)
SELECT
    cc.primary_key as collection_centre_id,
    gs.day_index,
    COALESCE(
            (SELECT av_day.is_active
             FROM unnest(cc.available_days) AS av_day
             WHERE av_day.day::text =
                             CASE gs.day_index
                                 WHEN 0 THEN 'Monday'
                                 WHEN 1 THEN 'Tuesday'
                                 WHEN 2 THEN 'Wednesday'
                                 WHEN 3 THEN 'Thursday'
                                 WHEN 4 THEN 'Friday'
                                 WHEN 5 THEN 'Saturday'
                                 WHEN 6 THEN 'Sunday'
                                 END
        ),
        false
    ) AND NOT cc.is_delivery as is_active,
    cc.time_slots,
    current_timestamp as last_updated
FROM
    collection_centres cc
        CROSS JOIN
    generate_series(0, 6) as gs(day_index)
WHERE
    cc.time_slots IS NOT NULL
  AND array_length(cc.available_days, 1) > 0;
