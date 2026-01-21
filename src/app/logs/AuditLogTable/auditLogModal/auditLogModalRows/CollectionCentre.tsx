"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import AuditLogModalRow, { TextValueContainer } from "../AuditLogModalRow";
import { AuditLogModalRowResponse } from "../types";

interface CollectionCentreNameDetails {
    collectionCentreName: string;
}

type CollectionCentreNameErrorType = "failedCollectionCentreNameFetch";
interface CollectionCentreNameError {
    type: CollectionCentreNameErrorType;
    logId: string;
}

const getCollectionCentreNameOrErrorMessage = async (
    collectionCentreId: string
): Promise<AuditLogModalRowResponse<CollectionCentreNameDetails>> => {
    const { data: data, error } = await supabase
        .from("collection_centres")
        .select("primary_key, name")
        .eq("primary_key", collectionCentreId)
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: collection centres", {
            error: error,
        });
        return {
            data: null,
            errorMessage: getErrorMessage({
                type: "failedCollectionCentreNameFetch",
                logId: logId,
            }),
        };
    }

    return { data: { collectionCentreName: data.name }, errorMessage: null };
};

const getErrorMessage = (error: CollectionCentreNameError): string => {
    let errorMessage = "";
    switch (error.type) {
        case "failedCollectionCentreNameFetch":
            errorMessage = "Failed to fetch collection centre name.";
            break;
    }
    return `${errorMessage} Log ID: ${error.logId}`;
};

const CollectionCentreName: React.FC<CollectionCentreNameDetails> = ({ collectionCentreName }) => (
    <TextValueContainer>{collectionCentreName}</TextValueContainer>
);

const CollectionCentreAuditLogModalRow: React.FC<{ collectionCentreId: string }> = ({
    collectionCentreId,
}) => (
    <AuditLogModalRow<CollectionCentreNameDetails>
        getDataOrErrorMessage={() => getCollectionCentreNameOrErrorMessage(collectionCentreId)}
        RowComponentWhenSuccessful={CollectionCentreName}
        header="collection centre"
    />
);

export default CollectionCentreAuditLogModalRow;
