import React from "react";
import { useTheme } from "styled-components";
import {
    displayNameForDeletedClient,
    displayPostcodeForHomelessClient,
    formatDateTime,
    formatDatetimeAsDate,
} from "@/common/format";
import ClientOutsideDeliveryAreaIcon from "@/components/Icons/ClientsOutsideDeliveryAreaIcon";
import CollectionIcon from "@/components/Icons/CollectionIcon";
import CongestionChargeAppliesIcon from "@/components/Icons/CongestionChargeAppliesIcon";
import DeliveryIcon from "@/components/Icons/DeliveryIcon";
import FlaggedForAttentionIcon from "@/components/Icons/FlaggedForAttentionIcon";
import HotelIcon from "@/components/Icons/HotelIcon";
import PhoneIcon from "@/components/Icons/PhoneIcon";
import {
    FetchClientIdAndIsActiveError,
    GetParcelDataAndCountErrorType,
    ParcelsTableRow,
} from "./types";

const RowToIconsColumn = ({
    flaggedForAttention,
    requiresFollowUpPhoneCall,
}: ParcelsTableRow["iconsColumn"]): React.ReactElement => {
    const theme = useTheme();
    return (
        <>
            {flaggedForAttention && <FlaggedForAttentionIcon />}
            {requiresFollowUpPhoneCall && <PhoneIcon color={theme.main.largeForeground[0]} />}
        </>
    );
};

const RowToDeliveryCollectionColumn = (
    collectionData: ParcelsTableRow["deliveryCollection"]
): React.ReactElement => {
    const theme = useTheme();
    const { collectionCentreName, collectionCentreAcronym, congestionChargeApplies, listType } =
        collectionData;
    const icons: React.ReactNode[] = [];

    if (listType === "hotel") {
        icons.push(
            <>
                <HotelIcon color={theme.main.largeForeground[0]} />
            </>
        );
    }

    if (collectionCentreName === "Delivery") {
        icons.push(
            <>
                <DeliveryIcon color={theme.main.largeForeground[0]} />
                {congestionChargeApplies && <CongestionChargeAppliesIcon />}
            </>
        );
    } else {
        icons.push(
            <>
                <CollectionIcon
                    color={theme.main.largeForeground[0]}
                    collectionPoint={collectionCentreName}
                />
                {collectionCentreAcronym}
            </>
        );
    }

    return <>{icons}</>;
};

const rowToLastStatusColumn = (data: ParcelsTableRow["lastStatus"] | null): string => {
    if (!data) {
        return "";
    }
    const { name, eventData, timestamp } = data;
    return (
        `${name}` + (eventData ? ` (${eventData})` : "") + ` @ ${formatDatetimeAsDate(timestamp)}`
    );
};

const formatNullPostcode = (postcodeData: string | null): string => {
    return postcodeData ?? displayPostcodeForHomelessClient;
};

const rowToAddressColumn = ({
    addressPostcode,
    isDeliverable,
    clientIsActive,
}: ParcelsTableRow["addressColumn"]): React.ReactElement => {
    const postcodeRow: React.ReactNode[] = [];
    postcodeRow.push(formatNullPostcode(addressPostcode));
    console.log(clientIsActive);
    if (!isDeliverable && clientIsActive) {
        postcodeRow.push(
            <span style={{ paddingLeft: "0.3rem" }}>
                <>
                    <ClientOutsideDeliveryAreaIcon />
                </>
            </span>
        );
    }
    return <>{postcodeRow}</>;
};

export const parcelTableColumnDisplayFunctions = {
    iconsColumn: RowToIconsColumn,
    deliveryCollection: RowToDeliveryCollectionColumn,
    packingDate: formatDatetimeAsDate,
    lastStatus: rowToLastStatusColumn,
    addressColumn: rowToAddressColumn,
    createdAt: formatDateTime,
};

export const getParcelDataErrorMessage = (
    errorType: GetParcelDataAndCountErrorType
): string | null => {
    switch (errorType) {
        case "unknownError":
            return "Unknown error has occurred. Please reload.";
        case "failedToFetchParcels":
            return "Failed to fetch parcels. Please reload.";
        case "failedToRetrieveCongestionChargeDetails":
            return "Failed to retrieve Congestion Charge details. Please reload.";
        case "abortedFetch":
            return null;
    }
};

export const getClientIdAndIsActiveErrorMessage = (
    error: FetchClientIdAndIsActiveError
): string | null => {
    switch (error.type) {
        case "failedClientIdAndIsActiveFetch":
            return `Failed to fetch client ID and is active for the selected parcel. Please reload. Log ID: ${error.logId}`;
        case "noMatchingClient":
            return `No matching client for the selected parcel. Please reload. Log ID: ${error.logId}`;
    }
};

export const getSelectedParcelCountMessage = (numberOfSelectedParcels: number): string | null => {
    if (numberOfSelectedParcels === 0) {
        return null;
    }
    return numberOfSelectedParcels === 1
        ? "1 parcel selected"
        : `${numberOfSelectedParcels} parcels selected`;
};

export const parcelsPageDeletedClientDisplayName = `(${displayNameForDeletedClient})`;
