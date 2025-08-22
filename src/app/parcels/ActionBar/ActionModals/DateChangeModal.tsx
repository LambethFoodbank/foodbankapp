import React, { useEffect, useRef, useState } from "react";
import GeneralActionModal, {
    ActionModalProps,
    Heading,
    WarningMessage,
    maxParcelsToShow,
} from "./GeneralActionModal";
import { Button } from "@mui/material";
import SelectedParcelsOverview from "../SelectedParcelsOverview";
import SingleDateInput, { DateInputProps } from "@/components/DateInputs/SingleDateInput";
import dayjs, { Dayjs } from "dayjs";
import { getDbDate } from "@/common/format";
import {
    getUpdateErrorMessage,
    packingDateorSlotCheckConcurrency,
    packingDateOrSlotUpdate,
} from "./CommonDateAndSlot";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { ConfirmButtons } from "@/components/Buttons/GeneralButtonParts";

interface ContentProps {
    onClose: () => void;
    onDateSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    setDate: (date: Dayjs) => void;
    selectedParcels: ParcelsTableRow[];
    maxParcelsToShow: number;
    warningMessage: string;
}

const DateChangeInput = React.forwardRef<HTMLInputElement, DateInputProps>(
    (props, dateChangeInputRef) => {
        return (
            <>
                <Heading>What date would you like to change to?</Heading>
                <SingleDateInput setDate={props.setDate} ref={dateChangeInputRef} />
            </>
        );
    }
);

DateChangeInput.displayName = "DateChangeInput";

const DateChangeModalContent: React.FC<ContentProps> = ({
    onClose,
    onDateSubmit,
    setDate,
    selectedParcels,
    maxParcelsToShow,
    warningMessage,
}) => {
    const dateChangeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dateChangeInputRef.current?.focus();
    }, []);

    return (
        <form onSubmit={(event) => onDateSubmit(event)}>
            <DateChangeInput setDate={setDate} ref={dateChangeInputRef} />
            <SelectedParcelsOverview
                parcels={selectedParcels}
                maxParcelsToShow={maxParcelsToShow}
            />
            <WarningMessage>{warningMessage}</WarningMessage>
            <ConfirmButtons>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" type="submit">
                    Change
                </Button>
            </ConfirmButtons>
        </form>
    );
};

const DateChangeModal: React.FC<ActionModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [date, setDate] = useState<Dayjs>();
    const [warningMessage, setWarningMessage] = useState<string>("");

    const onDateSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        if (!date) {
            setWarningMessage("Please choose a valid packing date.");
            return;
        }
        const newPackingDate = getDbDate(dayjs(date));

        const packingDateConcurrencyUpdateFlag = await props.selectedParcels.reduce<
            Promise<boolean>
        >(async (accPromise, parcel) => {
            const acc = await accPromise;
            if (!acc) {
                return false;
            }

            const result = await packingDateorSlotCheckConcurrency(
                {
                    ...parcel,
                    originalLastUpdated: parcel.lastUpdated,
                },
                "packingDate"
            );
            return acc && result;
        }, Promise.resolve(true));
        if (!packingDateConcurrencyUpdateFlag) {
            setErrorMessage("Record has been edited recently - please refresh the page.");
            setActionCompleted(true);
            return;
        }

        const packingDateUpdateErrors = await Promise.all(
            props.selectedParcels.map((parcel) => {
                return packingDateOrSlotUpdate("packingDate", newPackingDate, {
                    ...parcel,
                    originalLastUpdated: parcel.lastUpdated,
                });
            })
        );

        if (
            !packingDateUpdateErrors.every(
                (packingDateUpdateError) => packingDateUpdateError.error === null
            )
        ) {
            setErrorMessage(
                packingDateUpdateErrors
                    .map((packingDateUpdateError) => getUpdateErrorMessage(packingDateUpdateError))
                    .join("")
            );
        } else {
            setSuccessMessage(`Packing Date Changed to ${newPackingDate}`);
            props.postSuccessCallback();

            // Auto-close the modal after 3 seconds
            setTimeout(() => {
                props.onClose();
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
                <DateChangeModalContent
                    onClose={onClose}
                    onDateSubmit={onDateSubmit}
                    setDate={setDate}
                    selectedParcels={props.selectedParcels}
                    maxParcelsToShow={maxParcelsToShow}
                    warningMessage={warningMessage}
                />
            )}
        </GeneralActionModal>
    );
};
export default DateChangeModal;
