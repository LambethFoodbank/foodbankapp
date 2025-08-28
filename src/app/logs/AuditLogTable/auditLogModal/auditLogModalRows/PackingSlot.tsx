"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import AuditLogModalRow, { TextValueContainer } from "../AuditLogModalRow";
import { AuditLogModalRowResponse } from "../types";

interface PackingSlotNameDetails {
    packingSlotName: string;
}

type PackingSlotNameErrorType = "failedPackingSlotsFetch";
interface PackingSlotNameError {
    type: PackingSlotNameErrorType;
    logId: string;
}

const getPackingSlotNameOrErrorMessage = async (
    packingSlotId: string
): Promise<AuditLogModalRowResponse<PackingSlotNameDetails>> => {
    const { data: data, error } = await supabase
        .from("packing_slots")
        .select("primary_key, name")
        .eq("primary_key", packingSlotId)
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: packing slots", {
            error: error,
        });
        return {
            data: null,
            errorMessage: getErrorMessage({ type: "failedPackingSlotsFetch", logId: logId }),
        };
    }

    return { data: { packingSlotName: data.name }, errorMessage: null };
};

const getErrorMessage = (error: PackingSlotNameError): string => {
    let errorMessage = "";
    switch (error.type) {
        case "failedPackingSlotsFetch":
            errorMessage = "Failed to fetch packing slots name.";
            break;
    }
    return `${errorMessage} Log ID: ${error.logId}`;
};

const PackingSlotName: React.FC<PackingSlotNameDetails> = ({ packingSlotName }) => (
    <TextValueContainer>{packingSlotName}</TextValueContainer>
);

const PackingSlotAuditLogModalRow: React.FC<{ packingSlotId: string }> = ({ packingSlotId }) => (
    <AuditLogModalRow<PackingSlotNameDetails>
        getDataOrErrorMessage={() => getPackingSlotNameOrErrorMessage(packingSlotId)}
        RowComponentWhenSuccessful={PackingSlotName}
        header="packing slot"
    />
);

export default PackingSlotAuditLogModalRow;
