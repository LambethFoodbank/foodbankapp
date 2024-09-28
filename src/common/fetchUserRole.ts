import supabase from "@/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";
import { UserRole } from "@/databaseUtils";

type fetchRoleResult =
    | {
          role: UserRole;
          error: null;
          userMissing: boolean;
      }
    | {
          role: null;
          error: PostgrestError;
          userMissing: boolean;
      };

export const fetchUserRole = async (userId: string): Promise<fetchRoleResult> => {
    const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .single();

    if (error) {
        return {
            role: null,
            error: error,
            userMissing: error.code === "PGRST116",
        };
    }

    return { role: data.role, error: null, userMissing: false };
};
