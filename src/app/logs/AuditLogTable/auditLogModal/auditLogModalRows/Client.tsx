"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import LinkButton from "@/components/Buttons/LinkButton";
import { AuditLogModalRowResponse } from "../types";
import AuditLogModalRow from "../AuditLogModalRow";
import { displayNameForDeletedClient } from "@/common/format";

interface ClientLinkDetails {
    clientId: string;
    clientName: string;
}

type ClientLinkDetailsErrorType = "failedClientFetch";

interface ClientLinkDetailsError {
    type: ClientLinkDetailsErrorType;
    logId: string;
}

const getClientLinkDetailsOrErrorMessage = async (
    clientId: string
): Promise<AuditLogModalRowResponse<ClientLinkDetails>> => {
    const { data: data, error } = await supabase
        .from("clients")
        .select("primary_key, full_name")
        .eq("primary_key", clientId)
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: clients", { error: error });
        return {
            data: null,
            errorMessage: getErrorMessage({ type: "failedClientFetch", logId: logId }),
        };
    }

    return {
        data: {
            clientId: data.primary_key,
            clientName: data.full_name ?? displayNameForDeletedClient,
        },
        errorMessage: null,
    };
};

const getErrorMessage = (error: ClientLinkDetailsError): string => {
    let errorMessage = "";
    switch (error.type) {
        case "failedClientFetch":
            errorMessage = "Failed to fetch client's details.";
            break;
    }
    return `${errorMessage} Log ID: ${error.logId}`;
};

const ClientLink: React.FC<ClientLinkDetails> = ({ clientId, clientName }) => (
    <LinkButton link={`/clients?clientId=${clientId}`}>{clientName}</LinkButton>
);

const ClientAuditLogModalRow: React.FC<{ clientId: string }> = ({ clientId }) => (
    <AuditLogModalRow<ClientLinkDetails>
        getDataOrErrorMessage={() => getClientLinkDetailsOrErrorMessage(clientId)}
        RowComponentWhenSuccessful={ClientLink}
        header="client"
    />
);

export default ClientAuditLogModalRow;
