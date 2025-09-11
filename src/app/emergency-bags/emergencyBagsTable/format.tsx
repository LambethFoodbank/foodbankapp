import React from "react";
import { formatDateTime, formatDatetimeAsDate } from "@/common/format";
import { EmergencyBagsTableRow, GetEmergencyBagDataAndCountErrorType } from "./types";
import CollectionIcon from "@/components/Icons/CollectionIcon";
import { useTheme } from "styled-components";

const RowToDeliveryCollectionColumn = (
    collectionData: EmergencyBagsTableRow["deliveryCollection"]
): React.ReactElement => {
    const theme = useTheme();
    const { collectionCentreName, collectionCentreAcronym } = collectionData;
    const icons: React.ReactNode[] = [];

    icons.push(
        <>
            <CollectionIcon
                color={theme.main.largeForeground[0]}
                collectionPoint={collectionCentreName}
            />
            {collectionCentreAcronym}
        </>
    );

    return <>{icons}</>;
};

const rowToLastStatusColumn = (data: EmergencyBagsTableRow["lastStatus"] | null): string => {
    if (!data) {
        return "";
    }
    const { name, eventData, timestamp } = data;
    return (
        `${name}` + (eventData ? ` (${eventData})` : "") + ` @ ${formatDatetimeAsDate(timestamp)}`
    );
};

export const emergencyBagTableColumnDisplayFunctions = {
    deliveryCollection: RowToDeliveryCollectionColumn,
    packingDate: formatDatetimeAsDate,
    lastStatus: rowToLastStatusColumn,
    createdAt: formatDateTime,
};

export const getEmergencyBagDataErrorMessage = (
    errorType: GetEmergencyBagDataAndCountErrorType
): string | null => {
    switch (errorType) {
        case "unknownError":
            return "Unknown error has occurred. Please reload.";
        case "failedToFetchEmergencyBags":
            return "Failed to fetch emergency bags. Please reload.";
        case "abortedFetch":
            return null;
    }
};

export const getSelectedEmergencyBagCountMessage = (
    numberOfSelectedEmergencyBags: number
): string | null => {
    if (numberOfSelectedEmergencyBags === 0) {
        return null;
    }
    return numberOfSelectedEmergencyBags === 1
        ? "1 emergency bag selected"
        : `${numberOfSelectedEmergencyBags} emergency bags selected`;
};
