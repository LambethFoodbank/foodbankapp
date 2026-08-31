"use server";

import { getSupabaseServerComponentClient } from "@/supabaseServer";
import { logErrorReturnLogId } from "@/logger/logger";
import { CurrentUserError, getCurrentUser } from "./getCurrentUser";
import { Schema } from "@/databaseUtils";

type CurrentProfileResponse =
    | {
          data: Schema["profiles"];
          error: null;
      }
    | {
          data: null;
          error: CurrentProfileError;
      };
type CurrentProfileErrorType = "profileFetchFailed";
type CurrentProfileError = { type: CurrentProfileErrorType; logId: string } | CurrentUserError;

export async function getCurrentProfile(): Promise<CurrentProfileResponse> {
    const { data: userData, error: userError } = await getCurrentUser();

    if (userError) {
        return { data: null, error: userError };
    }

    const supabase = await getSupabaseServerComponentClient();

    const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userData.id)
        .single();

    if (profileError) {
        const logId = await logErrorReturnLogId("error with fetch: profiles", profileError);
        return { data: null, error: { type: "profileFetchFailed", logId: logId } };
    }

    return { data: profileData, error: null };
}
