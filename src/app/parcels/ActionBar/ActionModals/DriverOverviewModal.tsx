"use client";

import React, { useEffect, useRef, useState } from "react";
import GeneralActionModal, {
    Heading,
    maxParcelsToShow,
    ActionModalProps,
    Paragraph,
} from "./GeneralActionModal";
import SelectedParcelsOverview from "../SelectedParcelsOverview";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";
import { getStatusErrorMessageWithLogId } from "../Statuses";
import DriverOverviewPdfButton from "@/app/parcels/ActionBar/ActionButtons/DriverOverview/DriverOverviewPdfButton";
import { DriverOverviewError } from "../ActionButtons/DriverOverview/getDriverOverviewData";
import { sendAuditLog } from "@/server/auditLog";
import { displayNameForNullDriverName } from "@/common/format";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import { saveParcelTableRowsStatus } from "../saveStatus";
import RadioGroupInput from "@/components/DataInput/RadioGroupInput";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { fetchDriverNamesByCircuitPresence } from "@/app/drivers/driversTable/DriversActions";

interface DriverOverviewInputProps {
    onDateTimeChange: (newDate: Dayjs | null) => void;
    onDriverNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setDateValid: () => void;
    setDateInvalid: () => void;
    sendToCircuit: boolean;
    onSendToCircuitChange?: (value: boolean) => void;
}

interface ContentProps {
    selectedParcels: ParcelsTableRow[];
    dateTime: Dayjs;
    driverName: string | null;
    onPdfCreationCompleted: () => void;
    onPdfCreationFailed: (pdfError: DriverOverviewError) => void;
    isInputValid: boolean | null;
    onDateTimeChange: (newDate: Dayjs | null) => void;
    onDriverNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setIsDateValid: (valid: boolean) => void;
    maxParcelsToShow: number;
    sendToCircuit: boolean;
    onSendToCircuitChange: (value: boolean) => void;
}

const getDriverSelectLabelsAndValues = async (
    hasCircuitId: boolean
): Promise<[string, string][]> => {
    const names = await fetchDriverNamesByCircuitPresence(hasCircuitId);
    return names.map((name) => [name, name]);
};

const DriverOverviewInput = React.forwardRef<HTMLInputElement, DriverOverviewInputProps>(
    (props) => {
        const dateTime = dayjs();
        const [driverOptions, setDriverOptions] = useState<[string, string][]>([]);
        const [selectedDriver, setSelectedDriver] = useState<string>("");

        useEffect(() => {
            let isActive = true;
            (async () => {
                try {
                    const opts = await getDriverSelectLabelsAndValues(props.sendToCircuit);
                    if (isActive) {
                        setDriverOptions(opts);
                        // reset selection if current value not in new options
                        if (!opts.some(([_, v]) => v === selectedDriver)) {
                            setSelectedDriver("");
                        }
                    }
                } catch (e) {
                    // silently ignore for now or consider surfacing an error prop
                    if (isActive) {
                        setDriverOptions([]);
                        setSelectedDriver("");
                    }
                }
            })();
            return () => {
                isActive = false;
            };
        }, [props.sendToCircuit]);

        return (
            <>
                <Heading>Delivery Information</Heading>
                <br />
                <Paragraph>Send selected parcels to driver's Circuit App?</Paragraph>
                <RadioGroupInput
                    labelsAndValues={[
                        ["Yes", "Yes"],
                        ["No", "No"],
                    ]}
                    defaultValue={props.sendToCircuit ? "Yes" : "No"}
                    onChange={(event) =>
                        props.onSendToCircuitChange?.(event.target.value === "Yes")
                    }
                ></RadioGroupInput>
                <ControlledSelect
                    selectLabelId="driver-select-label"
                    labelsAndValues={driverOptions}
                    listTitle="Driver's Name (required)"
                    value={selectedDriver}
                    onChange={(event) => setSelectedDriver(event.target.value as string)}
                />

                <DateTimePicker
                    defaultValue={dateTime}
                    onChange={props.onDateTimeChange}
                    onError={(error) => {
                        if (error) {
                            props.setDateInvalid();
                        } else {
                            props.setDateValid();
                        }
                    }}
                    slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
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
    onDateTimeChange,
    onDriverNameChange,
    setIsDateValid,
    selectedParcels,
    maxParcelsToShow,
    dateTime: date,
    driverName,
    onPdfCreationCompleted,
    onPdfCreationFailed,
    isInputValid,
    sendToCircuit,
    onSendToCircuitChange,
}) => {
    const driverNameInputFocusRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        driverNameInputFocusRef.current?.focus();
    }, []);

    return (
        <form>
            <DriverOverviewInput
                onDateTimeChange={onDateTimeChange}
                onDriverNameChange={onDriverNameChange}
                setDateValid={() => setIsDateValid(true)}
                setDateInvalid={() => setIsDateValid(false)}
                ref={driverNameInputFocusRef}
                sendToCircuit={sendToCircuit}
                onSendToCircuitChange={onSendToCircuitChange}
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
    const [sendToCircuit, setSendToCircuit] = useState<boolean>(true);

    const isInputValid = isDateValid && driverName !== null;

    const onDriverNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const trimmedDriverName = event.target.value.trim();
        setDriverName(trimmedDriverName.length !== 0 ? trimmedDriverName : null);
    };

    const onDateTimeChange = (newDate: Dayjs | null): void => {
        if (newDate) {
            newDate = newDate.set("second", 0).set("millisecond", 0);
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
        const { error } = await saveParcelTableRowsStatus(
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
        props.postSuccessCallback();

        // Auto-close the modal after 3 seconds
        setTimeout(() => {
            props.onClose();
        }, 3000);
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
                    onDateTimeChange={onDateTimeChange}
                    onDriverNameChange={onDriverNameChange}
                    setIsDateValid={setIsDateValid}
                    selectedParcels={props.selectedParcels}
                    maxParcelsToShow={maxParcelsToShow}
                    dateTime={date}
                    driverName={driverName}
                    onPdfCreationCompleted={onPdfCreationCompleted}
                    onPdfCreationFailed={onPdfCreationFailed}
                    isInputValid={isInputValid}
                    sendToCircuit={sendToCircuit}
                    onSendToCircuitChange={setSendToCircuit}
                />
            )}
        </GeneralActionModal>
    );
};

export default DriverOverviewModal;
