"use client";

import React, { useEffect, useRef, useState } from "react";
import GeneralActionModal, { ActionModalProps } from "./GeneralActionModal";
import { Button } from "@mui/material";

interface ContentProps {
    uniquePostcodes: string[];
    setErrorMessage: (message: string) => void;
    setActionCompleted: (completed: boolean) => void;
    mapsLinkForSelectedParcels: string;
    setSuccessMessage: (message: string) => void;
    postSuccessCallback: () => void;
}

const GenerateMapModalContent: React.FC<ContentProps> = ({
    uniquePostcodes,
    setErrorMessage,
    setActionCompleted,
    mapsLinkForSelectedParcels,
    setSuccessMessage,
    postSuccessCallback,
}) => {
    const generateMapButtonFocusRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        generateMapButtonFocusRef.current?.focus();
    }, []);

    return (
        <Button
            variant="contained"
            onClick={() => {
                if (uniquePostcodes.length === 0) {
                    setErrorMessage("No selected parcels have addresses.");
                    setActionCompleted(true);
                    return;
                }
                const openInNewTab = (url: string): void => {
                    window.open(url, "_blank", "noopener, noreferrer");
                };
                openInNewTab(mapsLinkForSelectedParcels);
                setSuccessMessage("Map Generated");
                setActionCompleted(true);
                postSuccessCallback();
            }}
            ref={generateMapButtonFocusRef}
        >
            Generate Map
        </Button>
    );
};

const GenerateMapModal: React.FC<ActionModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const onClose = (): void => {
        props.onClose();
        setErrorMessage(null);
    };

    const formattedPostcodes = props.selectedParcels.reduce<string[]>(
        (formattedPostcodes, parcel) => {
            if (parcel.addressPostcode.postcode && parcel.addressPostcode.postcode !== "-") {
                formattedPostcodes.push(parcel.addressPostcode.postcode.replaceAll(" ", ""));
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

    return (
        <GeneralActionModal
            {...props}
            onClose={onClose}
            errorMessage={errorMessage}
            successMessage={successMessage}
        >
            {!actionCompleted && (
                <GenerateMapModalContent
                    uniquePostcodes={uniquePostcodes}
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
