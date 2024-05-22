"use client";

import React, { ReactElement, useCallback, useEffect, useState } from "react";
import DataViewer from "@/components/DataViewer/DataViewer";
import getExpandedParcelDetails, {
    ExpandedParcelDetails,
    FetchExpandedParcelDetailsError,
} from "@/app/parcels/getExpandedParcelDetails";
import EventTable, { EventTableRow } from "./EventTable";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import { styled } from "styled-components";

const DeletedText = styled.div`
    font-weight: 600;
    padding: 0.5em 0 2em 0;
    display: flex;
    flex-direction: row;
`;

interface Props {
    parcelId: string | null;
}

const sortByTimestampWithMostRecentFirst = (events: EventTableRow[]): EventTableRow[] => {
    return events.sort((eventA, eventB) => eventB.timestamp.getTime() - eventA.timestamp.getTime());
};

function getErrorMessageForExpandedParcelDetailsError(
    error: FetchExpandedParcelDetailsError
): string {
    switch (error.type) {
        case "failedToFetchParcelDetails":
            return `Failed to fetch parcel details. Log ID: ${error.logId}`;
        case "clientDetailDoesNotExist":
            return `Client detail cannot be found. Log ID: ${error.logId}`;
    }
}

const ExpandedParcelDetailsView = ({ parcelId }: Props): ReactElement => {
    const [parcelDetails, setParcelDetails] = useState<ExpandedParcelDetails | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchAndSetParcelDetails = useCallback(async (): Promise<void> => {
        if (!parcelId) {
            return;
        }

        const { parcelDetails: expandedParcelDetails, error } =
            await getExpandedParcelDetails(parcelId);

        if (error) {
            const newErrorMessage = getErrorMessageForExpandedParcelDetailsError(error);
            setErrorMessage(newErrorMessage);
            return;
        }

        setParcelDetails(expandedParcelDetails);
    }, [parcelId]);

    useEffect(() => {
        void fetchAndSetParcelDetails();
    }, [fetchAndSetParcelDetails]);

    return (
        <>
            {errorMessage && <ErrorSecondaryText>{errorMessage}</ErrorSecondaryText>}

            {parcelDetails && (
                <>
                    {!parcelDetails.expandedParcelData.isActive && (
                        <DeletedText>This parcel belongs to a deleted client.</DeletedText>
                    )}
                    <DataViewer
                        data={parcelDetails.expandedParcelData}
                        fieldsToHide={["isActive"]}
                    />
                    <EventTable
                        tableData={sortByTimestampWithMostRecentFirst(parcelDetails.events)}
                    />
                </>
            )}
        </>
    );
};

export default ExpandedParcelDetailsView;
