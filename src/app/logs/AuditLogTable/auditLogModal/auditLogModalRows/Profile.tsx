"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import AuditLogModalRow, { TextValueContainer } from "../AuditLogModalRow";
import { AuditLogModalRowResponse } from "../types";
import { profileDisplayNameForDeletedUser } from "../../format";
import { UserRole } from "@/databaseUtils";

interface ProfileNameDetails {
    firstName: string;
    lastName: string;
    userId: string | null;
    role: UserRole;
}

type ProfileNameErrorType = "failedProfileFetch";
interface ProfileNameError {
    type: ProfileNameErrorType;
    logId: string;
}

const getProfileNameOrErrorMessage = async (
    profileId: string
): Promise<AuditLogModalRowResponse<ProfileNameDetails>> => {
    const { data: data, error } = await supabase
        .from("profiles")
        .select("primary_key, first_name, last_name, user_id, role")
        .eq("primary_key", profileId)
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: profiles", {
            error: error,
        });
        return {
            data: null,
            errorMessage: getErrorMessage({ type: "failedProfileFetch", logId: logId }),
        };
    }

    return {
        data: {
            firstName: data.first_name ?? "",
            lastName: data.last_name ?? "",
            userId: data.user_id,
            role: data.role,
        },
        errorMessage: null,
    };
};

const getErrorMessage = (error: ProfileNameError): string => {
    let errorMessage = "";
    switch (error.type) {
        case "failedProfileFetch":
            errorMessage = "Failed to fetch profile data.";
            break;
    }
    return `${errorMessage} Log ID: ${error.logId}`;
};

const ProfileName: React.FC<ProfileNameDetails> = ({ firstName, lastName, userId, role }) => (
    <TextValueContainer>
        {userId === null ? profileDisplayNameForDeletedUser(role) : `${firstName} ${lastName}`}
    </TextValueContainer>
);

const ProfileAuditLogModalRow: React.FC<{ profileId: string }> = ({ profileId }) => (
    <AuditLogModalRow<ProfileNameDetails>
        getDataOrErrorMessage={() => getProfileNameOrErrorMessage(profileId)}
        RowComponentWhenSuccessful={ProfileName}
        header="profile"
    />
);

export default ProfileAuditLogModalRow;
