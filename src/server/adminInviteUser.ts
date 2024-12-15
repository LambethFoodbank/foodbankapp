"use server";

import { authenticateAsAdmin } from "@/server/authenticateAdminUser";
import { getSupabaseAdminAuthClient } from "@/supabaseAdminAuthClient";
import { User } from "@supabase/gotrue-js";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { InviteUserFields } from "@/app/admin/createUser/CreateUserForm";

export type InviteUserErrorType =
    | "adminAuthenticationFailure"
    | "inviteUserFailure"
    | "createProfileFailure";

export interface InviteUserError {
    type: InviteUserErrorType;
    logId: string;
}

type InviteUsersDataAndErrorType =
    | {
          data: User;
          error: null;
      }
    | {
          data: null;
          error: InviteUserError;
      };

export async function adminInviteUser(
    userDetails: InviteUserFields,
    redirectUrl: string
): Promise<InviteUsersDataAndErrorType> {
    const { isSuccess, failureReason } = await authenticateAsAdmin();

    if (!isSuccess) {
        const logId = await logErrorReturnLogId("Error with authenticating admin", {
            error: failureReason,
        });
        return {
            data: null,
            error: { type: "adminAuthenticationFailure", logId: logId },
        };
    }

    const adminAuthClient = getSupabaseAdminAuthClient();
    const { data: newUserData, error: inviteUserError } = await adminAuthClient.inviteUserByEmail(
        userDetails.email,
        {
            redirectTo: redirectUrl,
        }
    );

    const auditLogInviteUser = {
        action: "send invite link to user by email",
        content: {
            email: userDetails.email,
            redirectTo: redirectUrl,
        },
    } as const satisfies Partial<AuditLog>;

    if (inviteUserError) {
        const logId = await logErrorReturnLogId("failed to invite user", {
            error: inviteUserError,
        });
        await sendAuditLog({
            ...auditLogInviteUser,
            wasSuccess: false,
            logId,
        });
        return {
            data: null,
            error: { type: "inviteUserFailure", logId: logId },
        };
    }

    await sendAuditLog({
        ...auditLogInviteUser,
        wasSuccess: true,
        content: {
            ...auditLogInviteUser.content,
            newUserId: newUserData.user.id,
            invitedAt: newUserData.user.invited_at,
            createdAt: newUserData.user.created_at,
        },
    });

    const { data: profileData, error: createProfileError } = await supabase
        .from("profiles")
        .insert({
            role: userDetails.role,
            first_name: userDetails.firstName,
            last_name: userDetails.lastName,
            telephone_number: userDetails.telephoneNumber,
            email: newUserData.user.email,
            user_id: newUserData.user.id,
            created_at: newUserData.user.created_at,
        })
        .select()
        .single();

    const auditLogAddProfile = {
        action: "add a profile for user",
        content: {
            email: userDetails.email,
            newUserId: newUserData.user.id,
        },
    } as const satisfies Partial<AuditLog>;

    if (createProfileError) {
        const logId = await logErrorReturnLogId(
            `failed to create profile for user with id ${newUserData.user.id}`,
            {
                error: createProfileError,
            }
        );
        await sendAuditLog({
            ...auditLogAddProfile,
            wasSuccess: false,
            logId,
        });
        return {
            data: null,
            error: { type: "createProfileFailure", logId: logId },
        };
    }

    await sendAuditLog({
        ...auditLogAddProfile,
        wasSuccess: true,
        content: { ...auditLogAddProfile.content, profile: profileData },
        profileId: profileData.primary_key,
    });

    void logInfoReturnLogId(`Created a profile for ${userDetails.role} user: ${userDetails.email}`);

    return {
        data: newUserData.user,
        error: null,
    };
}
