INSERT INTO "public"."delivery_areas" (postcode)
SELECT DISTINCT split_part(c.address_postcode, ' ', 1) AS address_postcode
FROM "public"."clients" c
         LEFT JOIN "public"."delivery_areas" a ON split_part(c.address_postcode, ' ', 1) = a.postcode
WHERE a.postcode IS NULL AND address_postcode IS NOT NULL;
