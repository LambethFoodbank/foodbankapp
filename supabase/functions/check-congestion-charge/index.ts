/* eslint-disable import/no-unresolved */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck (for Deno references, annoyingly cannot get around for now)
/* global Deno */

import { type Handler, serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@latest";
import { corsHeaders, generateCorsOptionsForJsonResponse } from "../_shared/cors.ts";

serve(async (req: Handler): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const request = await req.json();

        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: req.headers.get("Authorization"),
                },
            },
        });

        const { data, error } = await supabase.storage
            .from("public")
            .download("congestion-charge/congestion-zone-postcodes.txt");

        if (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                generateCorsOptionsForJsonResponse(400)
            );
        }

        const contents = await data.text();
        const chargedPostcodes = new Set(contents.split("\n"));
        const result = request.postcodes?.map((postcode: string) => ({
            postcode,
            congestionCharge: chargedPostcodes.has(postcode),
        }));

        return new Response(JSON.stringify(result), generateCorsOptionsForJsonResponse(200));
    } catch (error) {
        return new Response(JSON.stringify(error), generateCorsOptionsForJsonResponse(400));
    }
});
