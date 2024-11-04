-- This is a data conversion script for the following things related to client dietary & other requirements.
-- Currently we only have test/seed data, but these changes need to be spread across the spectrum.


-- in other_requirements, "Hot Water Bottles" and "Blankets" are now singular
UPDATE clients
    SET other_items = CASE
        WHEN other_items IS NOT NULL THEN array_replace(other_items, 'Hot Water Bottles', 'Hot Water Bottle')
        ELSE other_items
    END;

UPDATE clients
    SET other_items = CASE
        WHEN other_items IS NOT NULL THEN array_replace(other_items, 'Blankets', 'Blanket')
        ELSE other_items
    END;


-- if dietary_requirements was not an empty array, then add "Fresh Fruit" and "Fresh Veg"
UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL
            AND array_length(dietary_requirements, 1) IS NOT NULL
            AND array_length(dietary_requirements, 1) > 0
            THEN dietary_requirements || ARRAY['Fresh Fruit', 'Fresh Veg']
        ELSE dietary_requirements
    END;


-- moving from other_requirements to dietary_requirements: Garlic, Ginger, Chillies, Spices
UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL AND other_items IS NOT NULL AND other_items @> ARRAY['Garlic']
            THEN array_append(dietary_requirements, 'Garlic')
        ELSE dietary_requirements
    END;

UPDATE clients
    SET other_items = CASE
        WHEN other_items IS NOT NULL THEN array_remove(other_items, 'Garlic')
        ELSE other_items
    END;


UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL AND other_items IS NOT NULL AND other_items @> ARRAY['Ginger']
            THEN array_append(dietary_requirements, 'Ginger')
        ELSE dietary_requirements
    END;

UPDATE clients
    SET other_items = CASE
        WHEN other_items IS NOT NULL THEN array_remove(other_items, 'Ginger')
        ELSE other_items
    END;


UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL AND other_items IS NOT NULL AND other_items @> ARRAY['Chillies']
            THEN array_append(dietary_requirements, 'Chillies')
        ELSE dietary_requirements
    END;

UPDATE clients
    SET other_items = CASE
        WHEN other_items IS NOT NULL THEN array_remove(other_items, 'Chillies')
        ELSE other_items
    END;


UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL AND other_items IS NOT NULL AND other_items @> ARRAY['Spices']
            THEN array_append(dietary_requirements, 'Spices')
        ELSE dietary_requirements
    END;

UPDATE clients
    SET other_items = CASE
        WHEN other_items IS NOT NULL THEN array_remove(other_items, 'Spices')
        ELSE other_items
    END;


-- invert 'No Rice': add 'Rice' iff 'No Rice' was not present; also remove 'No Rice'
UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL AND NOT dietary_requirements @> ARRAY['No Rice']
            THEN array_append(dietary_requirements, 'Rice')
        WHEN dietary_requirements IS NOT NULL
            THEN array_remove(dietary_requirements, 'No Rice')
        ELSE dietary_requirements
    END;


-- invert 'No Pasta' and 'No Bread' for clients without 'Gluten Free'
UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL AND NOT dietary_requirements && ARRAY['No Pasta', 'Gluten Free'] 
            THEN array_append(dietary_requirements, 'Pasta')
        WHEN dietary_requirements IS NOT NULL
            THEN array_remove(dietary_requirements, 'No Pasta')
        ELSE dietary_requirements
    END;

UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL AND NOT dietary_requirements && ARRAY['No Bread', 'Gluten Free'] 
            THEN array_append(dietary_requirements, 'Bread')
        WHEN dietary_requirements IS NOT NULL
            THEN array_remove(dietary_requirements, 'No Bread')
        ELSE dietary_requirements
    END;


-- if "No Pork" is absent then add "Meat & Pork"; also replace "No Pork" by "Meat (No Pork)"
UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL AND NOT dietary_requirements @> ARRAY['No Pork']
            THEN array_append(dietary_requirements, 'Meat & Pork')
        WHEN dietary_requirements IS NOT NULL
            THEN array_replace(dietary_requirements, 'No Pork', 'Meat (No Pork)')
        ELSE dietary_requirements
    END;


-- remove "No Beef"
UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL THEN array_remove(dietary_requirements, 'No Beef')
        ELSE dietary_requirements
    END;


--  if previously "Vegan" or "Vegetarian" was there, add "Tea"
--  if previously "Vegan", "Pescatarian" and "Halal" were absent, add "Coffee"
UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL AND dietary_requirements && ARRAY['Vegan', 'Vegetarian']
            THEN array_append(dietary_requirements, 'Tea')
        ELSE dietary_requirements
    END;

UPDATE clients
    SET dietary_requirements = CASE
        WHEN dietary_requirements IS NOT NULL AND NOT dietary_requirements && ARRAY['Vegan', 'Pescatarian', 'Halal'] 
            THEN array_append(dietary_requirements, 'Coffee')
        ELSE dietary_requirements
    END;
