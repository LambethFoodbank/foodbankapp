import { getSupabaseServerComponentClient } from "@/supabaseServer";
import { fetchUserRole } from "@/common/fetchUserRole";

type Authenticated =
    | {
          isSuccess: true;
          failureReason: null;
      }
    | {
          isSuccess: false;
          failureReason: FailureReason;
      };

type FailureReason =
    | "unauthenticated"
    | "unauthorised"
    | "fetch user error"
    | "fetch user role error";

export async function authenticateAsAdmin(): Promise<Authenticated> {
    const serverComponentClient = await getSupabaseServerComponentClient();

    const {
        data: { user },
        error: userError,
    } = await serverComponentClient.auth.getUser();

    if (userError) {
        return {
            isSuccess: false,
            failureReason: "fetch user error",
        };
    }

    if (user === null) {
        return {
            isSuccess: false,
            failureReason: "unauthenticated",
        };
    }

    const { role: userRole, error } = await fetchUserRole(user.id);

    if (error) {
        return {
            isSuccess: false,
            failureReason: "fetch user role error",
        };
    }

    if (userRole !== "admin") {
        return {
            isSuccess: false,
            failureReason: "unauthorised",
        };
    }

    return { isSuccess: true, failureReason: null };
}
