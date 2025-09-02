"use client";

import { getDeletedClientParcelsCount } from "@/app/parcels/ActionBar/ActionModals/getNumberOfDeletedClientParcels";
import DeletedClientParcelsDownloadWarning from "@/app/parcels/ActionBar/DeletedClientParcelsDownloadWarning";
import SelectedParcelsOverview from "@/app/parcels/ActionBar/SelectedParcelsOverview";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { logErrorReturnLogId } from "@/logger/logger";
import React, { useEffect, useRef, useState } from "react";
import GeneralActionModal, { ActionModalProps, maxParcelsToShow } from "./GeneralActionModal";
import { Button } from "@mui/material";
import { sendAuditLog } from "@/server/auditLog";

interface ContentProps {
    selectedParcels: ParcelsTableRow[];
    uniquePostcodes: string[];
    setErrorMessage: (message: string) => void;
    setActionCompleted: (completed: boolean) => void;
    mapsLinkForSelectedParcels: string;
    setSuccessMessage: (message: string) => void;
    postSuccessCallback: () => void;
    deletedClientParcelsCount: number;
}

const GenerateMapModalContent: React.FC<ContentProps> = ({
    selectedParcels,
    uniquePostcodes,
    setErrorMessage,
    setActionCompleted,
    mapsLinkForSelectedParcels,
    deletedClientParcelsCount,
    setSuccessMessage,
    postSuccessCallback,
}) => {
    const generateMapButtonFocusRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        generateMapButtonFocusRef.current?.focus();
    }, []);

    const handleGenerateMap = async (): Promise<void> => {
        if (uniquePostcodes.length === 0) {
            const logId = await logErrorReturnLogId(
                "All selected parcels belong to deleted clients."
            );
            setErrorMessage(`All selected parcels belong to deleted clients. LogId: ${logId}.`);

            await sendAuditLog({
                action: "generate map",
                content: { parcelIds: selectedParcels.map((id) => id.parcelId) },
                wasSuccess: false,
                logId: logId,
            });

            setActionCompleted(true);
            return;
        }
        window.open(mapsLinkForSelectedParcels, "_blank", "noopener, noreferrer");

        await sendAuditLog({
            action: "generate map",
            content: { parcelIds: selectedParcels.map((id) => id.parcelId) },
            wasSuccess: true,
        });
        setSuccessMessage("Map Generated");
        setActionCompleted(true);
        postSuccessCallback();
    };

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
            <Button variant="contained" onClick={handleGenerateMap} ref={generateMapButtonFocusRef}>
                Generate Map
            </Button>
        </>
    );
};

const GenerateMapModal: React.FC<ActionModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [deletedClientParcelsCount, setDeletedClientParcelsCount] = useState<number>(0);

    const onClose = (): void => {
        props.onClose();
        setErrorMessage(null);
    };

    const parcelIds = props.selectedParcels.map((parcel) => parcel.parcelId);

    const formattedPostcodes = props.selectedParcels.reduce<string[]>(
        (formattedPostcodes, parcel) => {
            if (parcel.addressPostcode && parcel.addressPostcode !== "-") {
                formattedPostcodes.push(parcel.addressPostcode.replaceAll(" ", ""));
            }
            return formattedPostcodes;
        },
        []
    );

    const uniquePostcodes = Array.from(new Set(formattedPostcodes));

    const mapsLinkForSelectedParcels = `https://www.google.com/maps/dir/${uniquePostcodes.join("/")}//`;

    const postSuccessCallback = (): void => {
        props.postSuccessCallback();

        // Auto-close the modal after 3 seconds
        setTimeout(() => {
            props.onClose();
        }, 3000);
    };

    useEffect(() => {
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
                <GenerateMapModalContent
                    selectedParcels={props.selectedParcels}
                    uniquePostcodes={uniquePostcodes}
                    deletedClientParcelsCount={deletedClientParcelsCount}
                    setErrorMessage={setErrorMessage}
                    setActionCompleted={setActionCompleted}
                    mapsLinkForSelectedParcels={mapsLinkForSelectedParcels}
                    setSuccessMessage={setSuccessMessage}
                    postSuccessCallback={postSuccessCallback}
                />
            )}
        </GeneralActionModal>
    );
};

export default GenerateMapModal;
