"use client";

import React, { useState } from "react";
import GeneralActionModal, { ActionModalProps, maxParcelsToShow } from "./GeneralActionModal";
import { sendAuditLog } from "@/server/auditLog";
import SelectedParcelsOverview from "../SelectedParcelsOverview";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import SelectedParcelsReportCsvButton, {
    FetchSelectedParcelsReportError,
} from "@/app/parcels/ActionBar/ActionButtons/SelectedParcelsReportCsvButton";

interface ContentProps {
    selectedParcels: ParcelsTableRow[];
    maxParcelsToShow: number;
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (csvError: FetchSelectedParcelsReportError) => void;
}

const SelectedParcelsReportModalContent: React.FC<ContentProps> = ({
    selectedParcels,
    maxParcelsToShow,
    onFileCreationCompleted,
    onFileCreationFailed,
}) => {
    return (
        <>
            <SelectedParcelsOverview
                parcels={selectedParcels}
                maxParcelsToShow={maxParcelsToShow}
            />
            <SelectedParcelsReportCsvButton
                parcels={selectedParcels}
                onFileCreationCompleted={onFileCreationCompleted}
                onFileCreationFailed={onFileCreationFailed}
            />
        </>
    );
};

const SelectedParcelsReportModal: React.FC<ActionModalProps> = (props) => {
    const [actionShown, setActionShown] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const onClose = (): void => {
        props.onClose();
        setErrorMessage(null);
    };

    const onFileCreationCompleted = async (): Promise<void> => {
        setSuccessMessage("Selected Parcels Report Created");
        setActionShown(false);
        void sendAuditLog({
            action: "create selected parcels report csv",
            wasSuccess: true,
            content: { parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId) },
        });
        props.postSuccessCallback();

        // Delay closing the modal to allow user to handle file explorer dialog
        setTimeout(() => {
            props.onClose();
        }, 3000); // 3-second delay
    };

    const onFileCreationFailed = (csvError: FetchSelectedParcelsReportError): void => {
        setErrorMessage("Failed to fetch selected parcels report data");
        setActionShown(false);
        void sendAuditLog({
            action: "create selected parcels report csv",
            wasSuccess: false,
            content: { parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId) },
            logId: csvError.logId,
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
                <SelectedParcelsReportModalContent
                    selectedParcels={props.selectedParcels}
                    maxParcelsToShow={maxParcelsToShow}
                    onFileCreationCompleted={onFileCreationCompleted}
                    onFileCreationFailed={onFileCreationFailed}
                />
            )}
        </GeneralActionModal>
    );
};

export default SelectedParcelsReportModal;
