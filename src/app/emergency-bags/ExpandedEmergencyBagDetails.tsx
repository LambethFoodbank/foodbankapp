"use client";

import React, { ReactElement, useCallback, useEffect, useState } from "react";
import DataViewer from "@/components/DataViewer/DataViewer";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import getExpandedEmergencyBagDetails, {
    ExpandedEmergencyBagDetails,
    FetchExpandedEmergencyBagDetailsError,
    getExpandedEmergencyBagDataForDataViewer,
} from "@/app/emergency-bags/getExpandedEmergencyBagDetails";

interface Props {
    emergencyBagId: string | null;
    refreshCallback?: (refreshFunction: () => void) => void;
}

function getErrorMessageForExpandedEmergencyBagDetailsError(
    error: FetchExpandedEmergencyBagDetailsError
): string {
    switch (error.type) {
        case "failedToFetchEmergencyBagDetails":
            return `Failed to fetch emergency bag details. Log ID: ${error.logId}`;
    }
}

const ExpandedEmergencyBagDetailsView = ({
    emergencyBagId,
    refreshCallback,
}: Props): ReactElement => {
    const [emergencyBagDetails, setEmergencyBagDetails] =
        useState<ExpandedEmergencyBagDetails | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchAndSetEmergencyBagDetails = useCallback(async (): Promise<void> => {
        if (!emergencyBagId) {
            return;
        }

        const { emergencyBagDetails: expandedEmergencyBagDetails, error } =
            await getExpandedEmergencyBagDetails(emergencyBagId);

        if (error) {
            const newErrorMessage = getErrorMessageForExpandedEmergencyBagDetailsError(error);
            setErrorMessage(newErrorMessage);
            return;
        }

        setEmergencyBagDetails(expandedEmergencyBagDetails);
    }, [emergencyBagId]);

    useEffect(() => {
        void fetchAndSetEmergencyBagDetails();
    }, [fetchAndSetEmergencyBagDetails, refreshTrigger]);

    const refreshEmergencyBagDetails = (): void => {
        setRefreshTrigger((prev) => prev + 1);
    };

    useEffect(() => {
        if (refreshCallback) {
            refreshCallback(refreshEmergencyBagDetails);
        }
    }, [refreshCallback]);

    return (
        <>
            {errorMessage && <ErrorSecondaryText>{errorMessage}</ErrorSecondaryText>}

            {emergencyBagDetails && (
                <>
                    <DataViewer
                        data={{
                            ...getExpandedEmergencyBagDataForDataViewer(
                                emergencyBagDetails.expandedEmergencyBagData
                            ),
                        }}
                    />
                </>
            )}
        </>
    );
};

export default ExpandedEmergencyBagDetailsView;
