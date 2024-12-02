"use client";

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
        const { error } = await props.updateParcelStatuses(
            props.selectedParcels,
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
        getDuplicateDownloadedPostcodes(
            parcelIds,
            "Shipping Labels Downloaded",
            setDuplicateDownloadedPostcodes,
            setErrorMessage
        );
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
                />
            )}
        </GeneralActionModal>
    );
};

export default ShippingLabelModal;
