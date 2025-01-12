"use client";

import React, { useState } from "react";
import GeneralActionModal, { ActionModalProps, maxParcelsToShow } from "./GeneralActionModal";
import DayOverviewPdfButton, {
    DayOverviewPdfError,
} from "@/app/parcels/ActionBar/ActionButtons/DayOverviewPdfButton";
import { sendAuditLog } from "@/server/auditLog";
import SelectedParcelsOverview from "../SelectedParcelsOverview";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";

interface ContentProps {
    selectedParcels: ParcelsTableRow[];
    maxParcelsToShow: number;
    onPdfCreationCompleted: () => void;
    onPdfCreationFailed: (pdfError: DayOverviewPdfError) => void;
}

const getPdfErrorMessage = (error: DayOverviewPdfError): string => {
    let errorMessage: string;
    switch (error.type) {
        case "parcelFetchFailed":
            errorMessage = "Failed to fetch parcel data.";
            break;
        case "failedToRetrieveCongestionChargeDetails":
            errorMessage = "Failed to retrieve congestion charge data";
            break;
    }
    return `${errorMessage} LogId: ${error.logId}`;
};

const DayOverviewModalContent: React.FC<ContentProps> = ({
    selectedParcels,
    maxParcelsToShow,
    onPdfCreationCompleted,
    onPdfCreationFailed,
}) => {
    return (
        <>
            <SelectedParcelsOverview
                parcels={selectedParcels}
                maxParcelsToShow={maxParcelsToShow}
            />
            <DayOverviewPdfButton
                parcels={selectedParcels}
                onPdfCreationCompleted={onPdfCreationCompleted}
                onPdfCreationFailed={onPdfCreationFailed}
            />
        </>
    );
};

const DayOverviewModal: React.FC<ActionModalProps> = (props) => {
    const [actionShown, setActionShown] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const onClose = (): void => {
        props.onClose();
        setErrorMessage(null);
    };

    const onPdfCreationCompleted = async (): Promise<void> => {
        setSuccessMessage("Day Overview Created");
        setActionShown(false);
        void sendAuditLog({
            action: "create day overview pdf",
            wasSuccess: true,
            content: { parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId) },
        });
    };

    const onPdfCreationFailed = (pdfError: DayOverviewPdfError): void => {
        setErrorMessage(getPdfErrorMessage(pdfError));
        setActionShown(false);
        void sendAuditLog({
            action: "create day overview pdf",
            wasSuccess: false,
            content: { parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId) },
            logId: pdfError.logId,
        });
    };

    return (
        <GeneralActionModal
            {...props}
            onClose={onClose}
            errorMessage={errorMessage}
            successMessage={successMessage}
        >
            {actionShown && (
                <DayOverviewModalContent
                    selectedParcels={props.selectedParcels}
                    maxParcelsToShow={maxParcelsToShow}
                    onPdfCreationCompleted={onPdfCreationCompleted}
                    onPdfCreationFailed={onPdfCreationFailed}
                />
            )}
        </GeneralActionModal>
    );
};

export default DayOverviewModal;
