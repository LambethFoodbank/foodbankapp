
ALTER TABLE "public"."clients" ADD COLUMN "signposting_call_reasons" "text"[] NULL DEFAULT '{}'::"text"[];

UPDATE "public"."clients"
    SET "signposting_call_reasons" = NULL
    WHERE "signposting_call_required" IS FALSE
        OR "signposting_call_required" IS NULL;
