"use server";

import { getSupabaseAdminAuthClient } from "@/supabaseAdminAuthClient";
import { authenticateAsAdmin } from "@/server/authenticateAdminUser";
import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { getSupabaseServerComponentClient } from "@/supabaseServer";

export type DeleteUserErrorType =
    | "failedToAuthenticateAsAdmin"
    | "failedToFetchUserIdFromProfiles"
    | "failedToDeleteUser";

type DeleteUserResult =
    | {
          error: {
              type: DeleteUserErrorType;
              logId: string;
          };
      }
    | { error: null };

export async function adminDeleteUser(userId: string): Promise<DeleteUserResult> {
    const { isSuccess, failureReason } = await authenticateAsAdmin();

    if (!isSuccess) {
        const logId = await logErrorReturnLogId("failed to authenticate as admin", {
            error: failureReason,
        });
        return {
            error: { type: "failedToAuthenticateAsAdmin", logId },
        };
    }

    const supabase = getSupabaseServerComponentClient();
    const { data: userProfile, error: userProfileError } = await supabase
        .from("profiles")
        .select("primary_key, role")
        .eq("user_id", userId)
        .single();

    if (userProfileError) {
        const logId = await logErrorReturnLogId("failed to fetch user id from profiles table", {
            error: userProfileError,
        });
        return {
            error: {
                type: "failedToFetchUserIdFromProfiles",
                logId,
            },
        };
    }

    const adminAuthClient = getSupabaseAdminAuthClient();
    const { error: deleteUserError } = await adminAuthClient.deleteUser(userId);

    const auditLog = {
        action: "delete a user",
        content: {
            before: {},
            after: {},
            userId: userId,
            role: userProfile.role,
        },
        profileId: userProfile.primary_key ?? "",
    } as const satisfies Partial<AuditLog>;

    if (deleteUserError) {
        const logId = await logErrorReturnLogId("Failed to fetch userid from profile", {
            error: deleteUserError,
        });
        void sendAuditLog({ ...auditLog, wasSuccess: false, logId });
        return {
            error: { type: "failedToDeleteUser", logId },
        };
    }

    void sendAuditLog({ ...auditLog, wasSuccess: true });
    void logInfoReturnLogId(`Delete successful: user ${userId}`);

    return {
        error: null,
    };
}
