
UPDATE clients
  SET hygiene_female_incontinence = TRUE
  WHERE feminine_products IS NOT NULL AND feminine_products @> ARRAY['Incontinence Pads'];

UPDATE clients
  SET hygiene_pads = '1 pack'
  WHERE feminine_products IS NOT NULL AND feminine_products @> ARRAY['Pads'];

UPDATE clients
  SET hygiene_tampons = '1 pack'
  WHERE feminine_products IS NOT NULL AND feminine_products @> ARRAY['Tampons'];
