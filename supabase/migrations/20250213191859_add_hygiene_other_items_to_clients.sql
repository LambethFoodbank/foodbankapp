
ALTER TABLE "public"."clients" ADD COLUMN "hygiene_other_items" "text"[] NULL DEFAULT '{}'::"text"[];

UPDATE "public"."clients"
    SET "hygiene_other_items" = CASE
        WHEN "hygiene_female_incontinence" IS TRUE
            THEN array_append("hygiene_other_items", 'Female Incontinence Pads')
        ELSE "hygiene_other_items"
    END;


UPDATE "public"."clients"
    SET "hygiene_other_items" = CASE
        WHEN "hygiene_male_incontinence" IS TRUE
            THEN array_append("hygiene_other_items", 'Male Incontinence Pads')
        ELSE "hygiene_other_items"
    END;


ALTER TABLE "public"."clients" DROP COLUMN "hygiene_female_incontinence";

ALTER TABLE "public"."clients" DROP COLUMN "hygiene_male_incontinence";
