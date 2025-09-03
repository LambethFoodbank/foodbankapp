import supabase from "@/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";
import { UserRole } from "@/databaseUtils";
import { logErrorReturnLogId } from "@/logger/logger";
import { sendAuditLog } from "@/server/auditLog";
import { fetchUpdateUserProfile, getBeforeAndAfter } from "@/app/logs/fetchForAuditLog";

export interface UpdateUserProfile {
    profileId: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
}

export async function updateUserProfile(
    userDetails: UpdateUserProfile
): Promise<PostgrestError | null> {

    const { data: oldRow, error: fetchOldRowError } = await fetchUpdateUserProfile(userDetails.profileId);

    if (fetchOldRowError) {
        await sendAuditLog({
            action: "update a user profile",
            content: {
                actionType: 'Edit',
            },
            wasSuccess: false,
            logId: fetchOldRowError.logId,
        });
        return fetchOldRowError.type;
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            role: userDetails.role,
            first_name: userDetails.firstName,
            last_name: userDetails.lastName,
            telephone_number: userDetails.phoneNumber,
            email: userDetails.email,
        })
        .eq("primary_key", userDetails.profileId)
        .single();

    const beforeAndAfter = getBeforeAndAfter(oldRow, userDetails);

    const auditLog = {
        action: "edit a user",
        content: {
            ...beforeAndAfter,
            actionType: "Edit",
        },
        profileId: userDetails.profileId,
    };

    if (error) {
        const logId = await logErrorReturnLogId(
            `Error with updating profiles: profile id ${userDetails.profileId}`,
            {
                error: error,
            }
        );
        await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
        return error;
    }

    await sendAuditLog({ ...auditLog, wasSuccess: true });
    return null;
}
