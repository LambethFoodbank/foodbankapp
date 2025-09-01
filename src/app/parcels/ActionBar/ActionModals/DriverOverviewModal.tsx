"use client";

import React, { useEffect, useRef, useState } from "react";
import GeneralActionModal, {
    Heading,
    maxParcelsToShow,
    ActionModalProps,
    Paragraph,
    DriverOverviewMessage,
} from "./GeneralActionModal";
import SelectedParcelsOverview from "../SelectedParcelsOverview";
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";
import { getStatusErrorMessageWithLogId } from "../Statuses";
import DriverOverviewPdfButton from "@/app/parcels/ActionBar/ActionButtons/DriverOverview/DriverOverviewPdfButton";
import { DriverOverviewError } from "../ActionButtons/DriverOverview/getDriverOverviewData";
import { sendAuditLog } from "@/server/auditLog";
import { displayNameForNullDriverName } from "@/common/format";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { ButtonCenterer, Centerer } from "@/components/Modal/ModalFormStyles";
import { saveParcelTableRowsStatus } from "../saveStatus";
import RadioGroupInput from "@/components/DataInput/RadioGroupInput";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { fetchDriverNamesByCircuitPresence } from "@/app/drivers/driversTable/DriversActions";
import DriverCircuitButton from "@/app/parcels/ActionBar/ActionButtons/DriverOverview/DriverCircuitButton";

interface DriverOverviewInputProps {
    onDateTimeChange: (newDate: Dayjs | null) => void;
    onDriverNameChange: (value: string) => void;
    setDateValid: () => void;
    setDateInvalid: () => void;
    sendToCircuit: boolean;
    buttonsDisabled: (value: boolean) => void;
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
    onDriverNameChange: (value: string) => void;
    setIsDateValid: (valid: boolean) => void;
    maxParcelsToShow: number;
    sendToCircuit: boolean;
    onSendToCircuitChange: (value: boolean) => void;
    routeSendCompleted: boolean;
    onRouteSendCompleted: () => void;
    buttonsDisabled: (value: boolean) => void;
    displayActionMessage?: string | null;
}

const getDriverSelectLabelsAndValues = async (
    hasCircuitId: boolean
): Promise<[string, string][]> => {
    const names = await fetchDriverNamesByCircuitPresence(hasCircuitId);
    return names.map((name) => [name, name]);
};

const DriverOverviewInput = React.forwardRef<HTMLInputElement, DriverOverviewInputProps>(
    (props, _ref) => {
        const dateTime = dayjs();
        const [driverOptions, setDriverOptions] = useState<[string, string][]>([]);
        const [selectedDriver, setSelectedDriver] = useState<string>("");

        useEffect(() => {
            let isActive = true;
            (async () => {
                try {
                    const driversList = await getDriverSelectLabelsAndValues(props.sendToCircuit);
                    if (isActive) {
                        setDriverOptions(driversList);
                    }
                } catch (err) {
                    if (isActive) {
                        setDriverOptions([]);
                    }
                }
            })();
            return () => {
                isActive = false;
            };
        }, [props.sendToCircuit]);

        useEffect(() => {
            if (selectedDriver && !driverOptions.some(([_, value]) => value === selectedDriver)) {
                setSelectedDriver("");
            }
        }, [driverOptions, selectedDriver]);

        return (
            <>
                <Heading>Delivery Information</Heading>
                <br />
                <Paragraph>Send selected parcels to driver&#39;s Circuit App?</Paragraph>
                <RadioGroupInput
                    labelsAndValues={[
                        ["Yes", "Yes"],
                        ["No", "No"],
                    ]}
                    defaultValue="Yes"
                    onChange={(event) => {
                        props.onSendToCircuitChange?.(event.target.value === "Yes");
                        props.buttonsDisabled?.(true);
                    }}
                ></RadioGroupInput>
                <ControlledSelect
                    selectLabelId="driver-select-label"
                    labelsAndValues={driverOptions}
                    listTitle="Driver's Name (required)"
                    value={selectedDriver}
                    focusOnDropdown={true}
                    onChange={(event) => {
                        const value = event.target.value as string;
                        props.onDriverNameChange(value);
                        setSelectedDriver(value);
                        props.buttonsDisabled?.(false);
                    }}
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
    routeSendCompleted,
    onRouteSendCompleted,
    displayActionMessage,
    buttonsDisabled,
}) => {
    const driverNameInputFocusRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        driverNameInputFocusRef.current?.focus();
    }, []);

    const parcelListContainsCollectionsCentres = selectedParcels.some(
        (parcel) => parcel.deliveryCollection.collectionCentreName !== "Delivery"
    );
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
                buttonsDisabled={buttonsDisabled}
            />
            <SelectedParcelsOverview
                parcels={selectedParcels}
                maxParcelsToShow={maxParcelsToShow}
            />
            {sendToCircuit && parcelListContainsCollectionsCentres && (
                <Centerer>
                    <DriverOverviewMessage>
                        * The list has <strong>Collection</strong> parcels — they won&#39;t be
                        included in the Driver’s route.
                    </DriverOverviewMessage>
                </Centerer>
            )}
            <ButtonCenterer>
                <DriverOverviewPdfButton
                    parcels={selectedParcels}
                    date={date}
                    driverName={driverName}
                    onPdfCreationCompleted={onPdfCreationCompleted}
                    onPdfCreationFailed={onPdfCreationFailed}
                    disabled={!isInputValid}
                />
                {sendToCircuit && (
                    <DriverCircuitButton
                        onRouteSendCompleted={onRouteSendCompleted}
                        routeSendCompleted={routeSendCompleted}
                        disabled={!isInputValid}
                    />
                )}
            </ButtonCenterer>
            {displayActionMessage && (
                <Centerer>
                    <DriverOverviewMessage>{displayActionMessage}</DriverOverviewMessage>
                </Centerer>
            )}
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
    const [sendToCircuitCompleted, setSendToCircuitCompleted] = useState<boolean>(false);
    const [downloadCompleted, setDownloadCompleted] = useState<boolean>(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

    const isInputValid = isDateValid && driverName !== null && !buttonsDisabled;

    const onDriverNameChange = (value: string): void => {
        setDriverName(value.length !== 0 ? value : null);
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

    const onRouteSendCompleted = async (): Promise<void> => {
        if (downloadCompleted) {
            setSuccessMessage("Driver Overview Created");
            setActionCompleted(true);
            props.postSuccessCallback();

            // Auto-close the modal after 3 seconds
            setTimeout(() => {
                props.onClose();
            }, 3000);
        } else {
            setActionMessage("Circuit route was successfully sent");
        }
        void sendAuditLog({
            action: "generate a driver's route",
            wasSuccess: true,
            content: {
                parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId),
                date: date.toString(),
                driverName: driverName,
            },
        });
        setSendToCircuitCompleted(true);
    };

    const onPdfCreationCompleted = async (): Promise<void> => {
        const shouldActionBeCompleted = !sendToCircuit || sendToCircuitCompleted;
        const { error } = await saveParcelTableRowsStatus(
            props.selectedParcels,
            "Out for Delivery",
            `with ${driverName ?? displayNameForNullDriverName}`,
            undefined,
            date
        );
        if (error && shouldActionBeCompleted) {
            setErrorMessage(getStatusErrorMessageWithLogId(error));
        }
        if (shouldActionBeCompleted) {
            setSuccessMessage("Driver Overview Created");
            setActionCompleted(true);
            props.postSuccessCallback();

            // Auto-close the modal after 3 seconds
            setTimeout(() => {
                props.onClose();
            }, 3000);
        } else {
            setActionMessage("Driver PDF Download Completed");
        }
        void sendAuditLog({
            action: "create driver overview pdf",
            wasSuccess: true,
            content: {
                parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId),
                date: date.toString(),
                driverName: driverName,
            },
        });
        setDownloadCompleted(true);
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
                    routeSendCompleted={sendToCircuitCompleted}
                    onRouteSendCompleted={onRouteSendCompleted}
                    displayActionMessage={actionMessage}
                    buttonsDisabled={setButtonsDisabled}
                />
            )}
        </GeneralActionModal>
    );
};

export default DriverOverviewModal;
