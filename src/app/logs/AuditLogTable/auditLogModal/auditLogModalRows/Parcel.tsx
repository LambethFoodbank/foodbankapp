"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import LinkButton from "@/components/Buttons/LinkButton";
import AuditLogModalRow from "../AuditLogModalRow";
import { AuditLogModalRowResponse } from "../types";
import { displayNameForDeletedClient, getParcelOverviewString } from "@/common/format";

interface ParcelLinkDetails {
    parcelId: string;
    collectionDatetime: Date | null;
    fullName: string;
    addressPostcode: string | null;
    clientIsActive: boolean;
}

type ParcelLinkErrorType = "failedParcelOverviewDetailsFetch" | "nullClient";
interface ParcelLinkError {
    type: ParcelLinkErrorType;
    logId: string;
}

const getParcelLinkDetailsOrErrorMessage = async (
    parcelId: string
): Promise<AuditLogModalRowResponse<ParcelLinkDetails>> => {
    const { data: data, error } = await supabase
        .from("parcels")
        .select(
            "primary_key, client:clients(full_name, address_postcode, is_active), collection_datetime"
        )
        .eq("primary_key", parcelId)
        .limit(1, { foreignTable: "clients" })
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: parcels", { error: error });
        return {
            data: null,
            errorMessage: getErrorMessage({
                type: "failedParcelOverviewDetailsFetch",
                logId: logId,
            }),
        };
    }

    if (data.client === null) {
        const logId = await logErrorReturnLogId("Error with fetch: parcels. Client null", {
            error: error,
        });
        return { data: null, errorMessage: getErrorMessage({ type: "nullClient", logId: logId }) };
    }

    const convertedData = {
        parcelId: data.primary_key,
        collectionDatetime: data.collection_datetime ? new Date(data.collection_datetime) : null,
        fullName: data.client.full_name ?? displayNameForDeletedClient,
        addressPostcode: data.client.address_postcode,
        clientIsActive: data.client.is_active,
    };

    return { data: convertedData, errorMessage: null };
};

const getErrorMessage = (error: ParcelLinkError): string => {
    let errorMessage = "";
    switch (error.type) {
        case "failedParcelOverviewDetailsFetch":
            errorMessage = "Failed to fetch parcel details.";
            break;
        case "nullClient":
            errorMessage = "No associated client found for the selected parcel.";
            break;
    }
    return `${errorMessage} Log ID: ${error.logId}`;
};

const ParcelLink: React.FC<ParcelLinkDetails> = ({
    parcelId,
    fullName,
    addressPostcode,
    collectionDatetime,
    clientIsActive,
}) => (
    <LinkButton link={`/parcels?parcelId=${parcelId}`}>
        {getParcelOverviewString(addressPostcode, fullName, collectionDatetime, clientIsActive)}
    </LinkButton>
);

const ParcelAuditLogModalRow: React.FC<{ parcelId: string }> = ({ parcelId }) => (
    <AuditLogModalRow<ParcelLinkDetails>
        getDataOrErrorMessage={() => getParcelLinkDetailsOrErrorMessage(parcelId)}
        RowComponentWhenSuccessful={ParcelLink}
        header="parcel"
    />
);

export default ParcelAuditLogModalRow;
