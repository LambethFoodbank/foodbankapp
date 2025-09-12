"use client";

import { getDeletedClientParcelsCount } from "@/app/parcels/ActionBar/ActionModals/getNumberOfDeletedClientParcels";
import DeletedClientParcelsDownloadWarning from "@/app/parcels/ActionBar/DeletedClientParcelsDownloadWarning";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GeneralActionModal, {
    Heading,
    maxParcelsToShow,
    ActionModalProps,
} from "./GeneralActionModal";
import SelectedParcelsOverview from "@/app/parcels/ActionBar/SelectedParcelsOverview";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import ShippingLabelsPdfButton, {
    ShippingLabelError,
} from "@/app/parcels/ActionBar/ActionButtons/ShippingLabelsPdfButton";
import { getStatusErrorMessageWithLogId } from "@/app/parcels/ActionBar/Statuses";
import { sendAuditLog } from "@/server/auditLog";
import DuplicateDownloadWarning from "@/app/parcels/ActionBar/DuplicateDownloadWarning";
import { getDuplicateDownloadedPostcodes } from "@/app/parcels/ActionBar/ActionModals/getDuplicateDownloadedPostcodes";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import { saveParcelTableRowsStatus } from "../saveStatus";

interface ShippingLabelsInputProps {
    onLabelQuantityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ContentProps {
    isInputValid: boolean;
    selectedParcels: ParcelsTableRow[];
    labelQuantity: number;
    onPdfCreationCompleted: () => void;
    onPdfCreationFailed: (pdfError: ShippingLabelError) => void;
    onLabelQuantityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    duplicateDownloadedPostcodes: (string | null)[];
    deletedClientParcelsCount: number;
}

const ShippingLabelsInput = React.forwardRef<HTMLInputElement, ShippingLabelsInputProps>(
    (props, quantityInputFocusRef) => {
        return (
            <>
                <Heading>Shipping Labels</Heading>
                <FreeFormTextInput
                    type="number"
                    onChange={props.onLabelQuantityChange}
                    label="Quantity (required)"
                    ref={quantityInputFocusRef}
                />
            </>
        );
    }
);

ShippingLabelsInput.displayName = "ShippingLabelsInput";

const getPdfErrorMessage = (error: ShippingLabelError): string => {
    let errorMessage: string;
    switch (error.type) {
        case "parcelFetchFailed":
            errorMessage = "Failed to fetch selected parcel data.";
            break;
        case "noMatchingClient":
            errorMessage = "No client in the database matches that of the selected parcel.";
            break;
        case "noMatchingPackingSlot":
            errorMessage = "No packing slot in the database matches that of the selected parcel.";
            break;
        case "noMatchingCollectionCentre":
            errorMessage =
                "No collection centre in the database matches that of the selected parcel.";
            break;
        case "noActiveParcels":
            errorMessage = "All selected parcels belong to deleted clients.";
            break;
    }
    return `${errorMessage} LogId: ${error.logId}`;
};

const ShippingLabelModalContent: React.FC<ContentProps> = ({
    isInputValid,
    selectedParcels,
    labelQuantity,
    onPdfCreationCompleted,
    onPdfCreationFailed,
    onLabelQuantityChange,
    duplicateDownloadedPostcodes,
    deletedClientParcelsCount,
}) => {
    const quantityInputFocusRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        quantityInputFocusRef.current?.focus();
    }, []);

    return (
        <form>
            <ShippingLabelsInput
                onLabelQuantityChange={onLabelQuantityChange}
                ref={quantityInputFocusRef}
            />
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
            <Centerer>
                <ShippingLabelsPdfButton
                    disabled={!isInputValid}
                    parcels={selectedParcels}
                    labelQuantity={labelQuantity}
                    onPdfCreationCompleted={onPdfCreationCompleted}
                    onPdfCreationFailed={onPdfCreationFailed}
                />
            </Centerer>
        </form>
    );
};

const ShippingLabelModal: React.FC<ActionModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [labelQuantity, setLabelQuantity] = useState<number>(0);
    const [duplicateDownloadedPostcodes, setDuplicateDownloadedPostcodes] = useState<
        (string | null)[]
    >([]);
    const [deletedClientParcelsCount, setDeletedClientParcelsCount] = useState<number>(0);

    const onLabelQuantityChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>): void => {
            setLabelQuantity(parseInt(event.target.value, 10) ?? 0);
        },
        [setLabelQuantity]
    );

    const isInputValid = labelQuantity > 0;

    const onClose = (): void => {
        props.onClose();
        setLabelQuantity(0);
        setErrorMessage(null);
    };

    const parcelIds = useMemo(
        () => props.selectedParcels.map((parcel) => parcel.parcelId),
        [props.selectedParcels]
    );

    const onPdfCreationCompleted = async (): Promise<void> => {
        const { error } = await saveParcelTableRowsStatus(
            props.selectedParcels.filter((parcel) => parcel.clientIsActive),
            "Shipping Labels Downloaded",
            labelQuantity.toString()
        );
        if (error) {
            setErrorMessage(getStatusErrorMessageWithLogId(error));
        }
        setSuccessMessage("Shipping Labels Created");
        setActionCompleted(true);
        void sendAuditLog({
            action: "create shipping label pdf",
            wasSuccess: true,
            content: {
                parcelIds: parcelIds,
                labelQuantity: labelQuantity,
            },
        });
        props.postSuccessCallback();

        // Auto-close the modal after 3 seconds
        setTimeout(() => {
            props.onClose();
        }, 3000);
    };

    const onPdfCreationFailed = (pdfError: ShippingLabelError): void => {
        setErrorMessage(getPdfErrorMessage(pdfError));
        setActionCompleted(true);
        void sendAuditLog({
            action: "create shipping label pdf",
            wasSuccess: false,
            content: {
                parcelIds: parcelIds,
                labelQuantity: labelQuantity,
            },
            logId: pdfError.logId,
        });
    };

    useEffect(() => {
        void getDuplicateDownloadedPostcodes(
            parcelIds,
            "Shipping Labels Downloaded",
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
                <ShippingLabelModalContent
                    isInputValid={isInputValid}
                    selectedParcels={props.selectedParcels}
                    labelQuantity={labelQuantity}
                    onPdfCreationCompleted={onPdfCreationCompleted}
                    onPdfCreationFailed={onPdfCreationFailed}
                    onLabelQuantityChange={onLabelQuantityChange}
                    duplicateDownloadedPostcodes={duplicateDownloadedPostcodes}
                    deletedClientParcelsCount={deletedClientParcelsCount}
                />
            )}
        </GeneralActionModal>
    );
};

export default ShippingLabelModal;
