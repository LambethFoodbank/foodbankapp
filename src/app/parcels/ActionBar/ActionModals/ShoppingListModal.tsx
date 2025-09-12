"use client";

import { getDeletedClientParcelsCount } from "@/app/parcels/ActionBar/ActionModals/getNumberOfDeletedClientParcels";
import React, { useEffect, useState } from "react";
import GeneralActionModal, { ActionModalProps, maxParcelsToShow } from "./GeneralActionModal";
import SelectedParcelsOverview from "../SelectedParcelsOverview";
import { getStatusErrorMessageWithLogId } from "../Statuses";
import ShoppingListPdfButton from "@/app/parcels/ActionBar/ActionButtons/ShoppingList/ShoppingListPdfButton";
import { ShoppingListPdfError } from "@/app/parcels/ActionBar/ActionButtons/ShoppingList/getShoppingListData";
import { sendAuditLog } from "@/server/auditLog";
import DuplicateDownloadWarning from "@/app/parcels/ActionBar/DuplicateDownloadWarning";
import { getDuplicateDownloadedPostcodes } from "@/app/parcels/ActionBar/ActionModals/getDuplicateDownloadedPostcodes";
import { ParcelsTableRow } from "../../parcelsTable/types";
import { saveParcelTableRowsStatus } from "../saveStatus";
import DeletedClientParcelsDownloadWarning from "@/app/parcels/ActionBar/DeletedClientParcelsDownloadWarning";

interface ContentProps {
    selectedParcels: ParcelsTableRow[];
    onPdfCreationCompleted: () => void;
    onPdfCreationFailed: (pdfError: ShoppingListPdfError) => void;
    duplicateDownloadedPostcodes: (string | null)[];
    deletedClientParcelsCount: number;
}

const getPdfErrorMessage = (error: ShoppingListPdfError): string => {
    let errorMessage: string;
    switch (error.type) {
        case "clientFetchFailed":
            errorMessage = "Failed to fetch client data for the selected parcel(s).";
            break;
        case "noMatchingClients":
            errorMessage =
                "No client in the database matches the client of the selected parcel(s).";
            break;
        case "familyFetchFailed":
            errorMessage = "Failed to fetch client's family data for the selected parcel(s).";
            break;
        case "listsFetchFailed":
            errorMessage = "Failed to fetch shopping list data.";
            break;
        case "listsCommentFetchFailed":
            errorMessage = "Failed to fetch shopping list comment.";
            break;
        case "failedToFetchParcel":
            errorMessage = "Failed to fetch parcel(s) data.";
            break;
        case "noMatchingParcels":
            errorMessage = "No parcel in the database matches the selected parcel(s).";
            break;
        case "invalidFamilySize":
            errorMessage = "Invalid family size for shopping list PDF.";
            break;
        case "inactiveClient":
            errorMessage = "All selected parcels belong to deleted clients.";
            break;
    }
    return `${errorMessage} LogId: ${error.logId}`;
};

const ShoppingListModalContent: React.FC<ContentProps> = ({
    selectedParcels,
    duplicateDownloadedPostcodes,
    deletedClientParcelsCount,
    onPdfCreationCompleted,
    onPdfCreationFailed,
}) => {
    return (
        <>
            <SelectedParcelsOverview
                parcels={selectedParcels}
                maxParcelsToShow={maxParcelsToShow}
            />
            {deletedClientParcelsCount > 0 && (
                <DeletedClientParcelsDownloadWarning
                    deletedClientParcelsCount={deletedClientParcelsCount}
                />
            )}
            {duplicateDownloadedPostcodes.length > 0 && (
                <DuplicateDownloadWarning postcodes={duplicateDownloadedPostcodes} />
            )}
            <ShoppingListPdfButton
                parcels={selectedParcels}
                onPdfCreationCompleted={onPdfCreationCompleted}
                onPdfCreationFailed={onPdfCreationFailed}
            />
        </>
    );
};

const ShoppingListModal: React.FC<ActionModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [duplicateDownloadedPostcodes, setDuplicateDownloadedPostcodes] = useState<
        (string | null)[]
    >([]);
    const [deletedClientParcelsCount, setDeletedClientParcelsCount] = useState<number>(0);

    const onClose = (): void => {
        props.onClose();
        setErrorMessage(null);
    };

    const parcelIds = props.selectedParcels.map((parcel) => parcel.parcelId);

    const onPdfCreationCompleted = async (): Promise<void> => {
        const { error } = await saveParcelTableRowsStatus(
            props.selectedParcels.filter((parcel) => parcel.clientIsActive),
            "Shopping List Downloaded"
        );
        if (error) {
            setErrorMessage(getStatusErrorMessageWithLogId(error));
        }
        setSuccessMessage("Shopping List Created");
        setActionCompleted(true);
        void sendAuditLog({
            action: "create shopping list pdf",
            wasSuccess: true,
            content: { parcelIds: parcelIds },
        });
        props.postSuccessCallback();

        // Auto-close the modal after 3 seconds
        setTimeout(() => {
            props.onClose();
        }, 3000);
    };

    const onPdfCreationFailed = (pdfError: ShoppingListPdfError): void => {
        setErrorMessage(getPdfErrorMessage(pdfError));
        setActionCompleted(true);
        void sendAuditLog({
            action: "create shopping list pdf",
            wasSuccess: false,
            content: { parcelIds: parcelIds },
            logId: pdfError.logId,
        });
    };

    useEffect(() => {
        void getDuplicateDownloadedPostcodes(
            parcelIds,
            "Shopping List Downloaded",
            setDuplicateDownloadedPostcodes,
            setErrorMessage
        );

        void getDeletedClientParcelsCount(parcelIds, setDeletedClientParcelsCount, setErrorMessage);
    }, [parcelIds]);

    return (
        <GeneralActionModal
            {...props}
            onClose={onClose}
            errorMessage={errorMessage}
            successMessage={successMessage}
        >
            {!actionCompleted && (
                <ShoppingListModalContent
                    selectedParcels={props.selectedParcels}
                    duplicateDownloadedPostcodes={duplicateDownloadedPostcodes}
                    deletedClientParcelsCount={deletedClientParcelsCount}
                    onPdfCreationCompleted={onPdfCreationCompleted}
                    onPdfCreationFailed={onPdfCreationFailed}
                />
            )}
        </GeneralActionModal>
    );
};

export default ShoppingListModal;
