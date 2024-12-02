"use client";

import React, { useEffect, useRef, useState } from "react";
import GeneralActionModal, {
    Heading,
    maxParcelsToShow,
    ActionModalProps,
} from "./GeneralActionModal";
import SelectedParcelsOverview from "../SelectedParcelsOverview";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { getStatusErrorMessageWithLogId } from "../Statuses";
import DriverOverviewPdfButton, {
    DriverOverviewError,
} from "@/app/parcels/ActionBar/ActionButtons/DriverOverviewPdfButton";
import { sendAuditLog } from "@/server/auditLog";
import { displayNameForNullDriverName } from "@/common/format";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { Centerer } from "@/components/Modal/ModalFormStyles";

interface DriverOverviewInputProps {
    onDateChange: (newDate: Dayjs | null) => void;
    onDriverNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setDateValid: () => void;
    setDateInvalid: () => void;
}

interface ContentProps {
    selectedParcels: ParcelsTableRow[];
    date: Dayjs;
    driverName: string | null;
    onPdfCreationCompleted: () => void;
    onPdfCreationFailed: (pdfError: DriverOverviewError) => void;
    isInputValid: boolean | null;
    onDateChange: (newDate: Dayjs | null) => void;
    onDriverNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setIsDateValid: (valid: boolean) => void;
    maxParcelsToShow: number;
}

const DriverOverviewInput = React.forwardRef<HTMLInputElement, DriverOverviewInputProps>(
    (props, driverNameInputFocusRef) => {
        return (
            <>
                <Heading>Delivery Information</Heading>
                <FreeFormTextInput
                    onChange={props.onDriverNameChange}
                    label="Driver's Name (required)"
                    ref={driverNameInputFocusRef}
                    fullWidth
                    margin="normal"
                />
                <DatePicker
                    defaultValue={dayjs()}
                    onChange={props.onDateChange}
                    onError={(error) => {
                        if (error) {
                            props.setDateInvalid();
                        } else {
                            props.setDateValid();
                        }
                    }}
                    slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                    disablePast
                />
            </>
        );
    }
);

DriverOverviewInput.displayName = "DriverOverviewInput";

const getPdfErrorMessage = (error: DriverOverviewError): string => {
    let errorMessage: string;
    switch (error.type) {
        case "parcelFetchFailed":
            errorMessage = "Failed to fetch parcel data.";
            break;
        case "noMatchingClient":
            errorMessage = "Failed to find a client for one or more of the parcels.";
            break;
        case "driverMessageFetchFailed":
            errorMessage = "Failed to fetch driver overview message.";
            break;
        case "noCollectionCentre":
            errorMessage = "Failed to find a collection centre for one or more of the parcels.";
            break;
    }
    return `${errorMessage} LogId: ${error.logId}`;
};

const DriverOverviewModalContent: React.FC<ContentProps> = ({
    onDateChange,
    onDriverNameChange,
    setIsDateValid,
    selectedParcels,
    maxParcelsToShow,
    date,
    driverName,
    onPdfCreationCompleted,
    onPdfCreationFailed,
    isInputValid,
}) => {
    const driverNameInputFocusRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        driverNameInputFocusRef.current?.focus();
    }, []);

    return (
        <form>
            <DriverOverviewInput
                onDateChange={onDateChange}
                onDriverNameChange={onDriverNameChange}
                setDateValid={() => setIsDateValid(true)}
                setDateInvalid={() => setIsDateValid(false)}
                ref={driverNameInputFocusRef}
            />
            <SelectedParcelsOverview
                parcels={selectedParcels}
                maxParcelsToShow={maxParcelsToShow}
            />
            <Centerer>
                <DriverOverviewPdfButton
                    parcels={selectedParcels}
                    date={date}
                    driverName={driverName}
                    onPdfCreationCompleted={onPdfCreationCompleted}
                    onPdfCreationFailed={onPdfCreationFailed}
                    disabled={!isInputValid}
                />
            </Centerer>
        </form>
    );
};

const DriverOverviewModal: React.FC<ActionModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [driverName, setDriverName] = useState<string | null>(null);
    const [date, setDate] = useState(dayjs());

    const [isDateValid, setIsDateValid] = useState(true);

    const isInputValid = isDateValid && driverName !== null;

    const onDriverNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const trimmedDriverName = event.target.value.trim();
        setDriverName(trimmedDriverName.length !== 0 ? trimmedDriverName : null);
    };
    const onDateChange = (newDate: Dayjs | null): void => {
        if (newDate) {
            setDate(newDate);
        }
    };

    const onClose = (): void => {
        props.onClose();
        setDate(dayjs());
        setDriverName(null);
        setErrorMessage(null);
    };

    const onPdfCreationCompleted = async (): Promise<void> => {
        const { error } = await props.updateParcelStatuses(
            props.selectedParcels,
            "Out for Delivery",
            `with ${driverName ?? displayNameForNullDriverName}`,
            undefined,
            date
        );
        if (error) {
            setErrorMessage(getStatusErrorMessageWithLogId(error));
        }
        setSuccessMessage("Driver Overview Created");
        setActionCompleted(true);
        void sendAuditLog({
            action: "create driver overview pdf",
            wasSuccess: true,
            content: {
                parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId),
                date: date.toString(),
                driverName: driverName,
            },
        });
    };

    const onPdfCreationFailed = (pdfError: DriverOverviewError): void => {
        setErrorMessage(getPdfErrorMessage(pdfError));
        setActionCompleted(true);
        void sendAuditLog({
            action: "create driver overview pdf",
            wasSuccess: false,
            content: {
                parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId),
                date: date.toString(),
                driverName: driverName,
            },
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
            {!actionCompleted && (
                <DriverOverviewModalContent
                    onDateChange={onDateChange}
                    onDriverNameChange={onDriverNameChange}
                    setIsDateValid={setIsDateValid}
                    selectedParcels={props.selectedParcels}
                    maxParcelsToShow={maxParcelsToShow}
                    date={date}
                    driverName={driverName}
                    onPdfCreationCompleted={onPdfCreationCompleted}
                    onPdfCreationFailed={onPdfCreationFailed}
                    isInputValid={isInputValid}
                />
            )}
        </GeneralActionModal>
    );
};

export default DriverOverviewModal;
