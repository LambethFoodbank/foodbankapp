import { Database } from "@/databaseTypesFile";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies, UnsafeUnwrappedCookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getSupabaseServerComponentClient(): Promise<SupabaseClient<Database>> {
    const cookieStore = await cookies();

    return createServerComponentClient<Database>({
        cookies: () => cookieStore as unknown as UnsafeUnwrappedCookies,
    });
}
