
ALTER TABLE "public"."clients" RENAME COLUMN "baby_food" TO "baby_food_flags";


ALTER TABLE "public"."clients" ADD COLUMN "baby_other_items" "text"[] NULL DEFAULT '{}'::"text"[];

ALTER TABLE "public"."clients" ADD COLUMN "baby_food" "text";

ALTER TABLE "public"."clients" ADD COLUMN "baby_formula" "text";

ALTER TABLE "public"."clients" ADD COLUMN "baby_nappies" "text";


UPDATE "public"."clients"
    SET "baby_food" = 'Pureed fruit'
    WHERE "baby_food_flags" IS TRUE;


ALTER TABLE "public"."clients" DROP COLUMN "baby_food_flags";
