"use client";

import React, { useEffect, useRef, useState } from "react";
import GeneralActionModal, {
    Heading,
    maxParcelsToShow,
    ActionModalProps,
} from "./GeneralActionModal";
import { Button } from "@mui/material";
import SelectedParcelsOverview from "../SelectedParcelsOverview";
import { getStatusErrorMessageWithLogId } from "../Statuses";
import { ParcelsTableRow } from "../../parcelsTable/types";
import DeleteButton from "@/components/Buttons/DeleteButton";
import DeleteConfirmationDialog from "@/components/Modal/DeleteConfirmationDialog";
import { ConfirmButtons } from "@/components/Buttons/GeneralButtonParts";
import { saveParcelTableRowsStatus } from "../saveStatus";

interface ContentProps {
    onClose: () => void;
    onDeleteParcels: () => void;
    numberOfParcelsToDelete: number;
    selectedParcels: ParcelsTableRow[];
}

const DeleteParcelModalContent: React.FC<ContentProps> = ({
    onClose,
    onDeleteParcels,
    numberOfParcelsToDelete,
    selectedParcels,
}) => {
    const modalDeleteButtonFocusRef = useRef<HTMLButtonElement>(null);
    const confirmDialogueConfirmButtonFocusRef = useRef<HTMLButtonElement>(null);
    const [isConfirmationDialogueOpen, setIsConfirmationDialogueOpen] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            isConfirmationDialogueOpen
                ? confirmDialogueConfirmButtonFocusRef.current?.focus()
                : modalDeleteButtonFocusRef.current?.focus();
        }, 0);
    }, [isConfirmationDialogueOpen]);

    return (
        <>
            <Heading>
                Are you sure you want to delete the selected parcel{" "}
                {numberOfParcelsToDelete === 1 ? "request" : "requests"}?
            </Heading>
            <SelectedParcelsOverview
                parcels={selectedParcels}
                maxParcelsToShow={maxParcelsToShow}
            />
            <ConfirmButtons>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <DeleteButton
                    onClick={() => setIsConfirmationDialogueOpen(true)}
                    ref={modalDeleteButtonFocusRef}
                >
                    Delete
                </DeleteButton>
            </ConfirmButtons>
            <DeleteConfirmationDialog
                isOpen={isConfirmationDialogueOpen}
                closeModal={() => setIsConfirmationDialogueOpen(false)}
                onConfirm={onDeleteParcels}
                deletionText={`You are about to delete ${
                    numberOfParcelsToDelete === 1 ? "this parcel" : "these parcels"
                }`}
            />
        </>
    );
};

const DeleteParcelModal: React.FC<ActionModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const numberOfParcelsToDelete = props.selectedParcels.length;

    const onDeleteParcels = async (): Promise<void> => {
        const { error } = await saveParcelTableRowsStatus(props.selectedParcels, "Parcel Deleted");
        if (error) {
            setErrorMessage(getStatusErrorMessageWithLogId(error));
        } else {
            setSuccessMessage(`${numberOfParcelsToDelete > 1 ? "Parcels" : "Parcel"} Deleted`);
            props.postSuccessCallback();

            // Auto-close the modal after 3 seconds
            setTimeout(() => {
                onClose();
            }, 3000);
        }
        setActionCompleted(true);
    };

    const onClose = (): void => {
        props.onClose();
        setErrorMessage(null);
    };

    return (
        <GeneralActionModal
            {...props}
            onClose={onClose}
            errorMessage={errorMessage}
            successMessage={successMessage}
        >
            {!actionCompleted && (
                <DeleteParcelModalContent
                    selectedParcels={props.selectedParcels}
                    numberOfParcelsToDelete={numberOfParcelsToDelete}
                    onClose={onClose}
                    onDeleteParcels={onDeleteParcels}
                />
            )}
        </GeneralActionModal>
    );
};
export default DeleteParcelModal;
