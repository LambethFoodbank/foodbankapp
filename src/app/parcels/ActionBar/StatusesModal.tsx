import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "@mui/material/Button";
import Modal from "@/components/Modal/Modal";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ParcelsTableRow } from "../parcelsTable/types";
import SelectedParcelsOverview from "./SelectedParcelsOverview";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import { FormElementWithSpacing, FormErrorText } from "@/components/Form/formStyling";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";

const NO_RESPONSE_FOLLOW_UP = ["Voicemail", "Text", "Email"];
const NO_RESPONSE_STATUS = "Called and No Response";
const MAX_PARCELS_TO_SHOW = 5;

const FOLLOW_UP_LABELS_AND_KEYS: [string, string][] = NO_RESPONSE_FOLLOW_UP.map((followUp) => [
    followUp,
    followUp,
]);

interface StatusesModalProps extends React.ComponentProps<typeof Modal> {
    selectedParcels: ParcelsTableRow[];
    onSubmit: (date: Dayjs, callNoResponseFollowUp: string[]) => void;
    selectedStatus?: string | null;
    errorText: string | null;
    setErrorText: React.Dispatch<React.SetStateAction<string | null>>;
}

const Row = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
`;

const ModalInner = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
`;

const StatusesModal: React.FC<StatusesModalProps> = (props) => {
    const [date, setDate] = useState(dayjs(new Date()));
    const [isValidDate, setIsValidDate] = useState(true);
    const [callNoResponseFollowUp, setCallNoResponseFollowUp] = useState<string[]>([]);

    useEffect(() => {
        setDate(dayjs(new Date()));
    }, [props.isOpen]);

    useEffect(() => {
        const firstRegisteredDate = dayjs("2000-01-01");
        const currentDate = dayjs();

        if (
            !date ||
            !date.isValid() ||
            date.isBefore(firstRegisteredDate) ||
            date.isAfter(currentDate)
        ) {
            setIsValidDate(false);
            props.setErrorText("Please choose a valid date.");
        } else {
            setIsValidDate(true);
            props.setErrorText(null);
        }
    }, [date, props]);

    const onDateChange = (newDate: Dayjs | null): void => {
        if (!newDate) {
            return;
        }
        setDate(
            dayjs(new Date())
                .set("year", newDate.year() ?? date.year())
                .set("month", newDate.month() ?? date.month())
                .set("date", newDate.date() ?? date.date())
                .set("hour", isValidDate ? date.hour() : 8)
                .set("minute", isValidDate ? date.minute() : 0)
        );
    };

    const onTimeChange = (newDate: Dayjs | null): void => {
        if (!newDate) {
            return;
        }
        setDate(
            dayjs(new Date())
                .set("year", date.year())
                .set("month", date.month())
                .set("date", date.date())
                .set("hour", newDate.hour() ?? date.hour())
                .set("minute", newDate.minute() ?? date.minute())
        );
    };

    useEffect(() => {
        if (props.isOpen) {
            setCallNoResponseFollowUp([]);
        }
    }, [props.isOpen]);

    const toggleCallNoResponseFollowUp = (newNoResponseFollowUp: string): void => {
        setCallNoResponseFollowUp((prevCallNoResponseFollowUp) =>
            prevCallNoResponseFollowUp.includes(newNoResponseFollowUp)
                ? prevCallNoResponseFollowUp.filter(
                      (prevStatus) => prevStatus !== newNoResponseFollowUp
                  )
                : [...prevCallNoResponseFollowUp, newNoResponseFollowUp]
        );
    };

    return (
        <Modal {...props}>
            <ModalInner>
                <Centerer>
                    <Row>
                        Date:
                        <DatePicker
                            value={date}
                            defaultValue={date}
                            onChange={onDateChange}
                            disableFuture
                            onError={() => {
                                setIsValidDate(false);
                                props.setErrorText("Please choose a valid date.");
                            }}
                            minDate={dayjs("2000-01-01")}
                        />
                        Time:
                        <TimePicker
                            value={date}
                            onChange={onTimeChange}
                            disableFuture={date.day() === dayjs().day()}
                            onError={() => {
                                setIsValidDate(false);
                                props.setErrorText("Please choose a valid date.");
                            }}
                        />
                    </Row>
                </Centerer>
                <SelectedParcelsOverview
                    parcels={props.selectedParcels}
                    maxParcelsToShow={MAX_PARCELS_TO_SHOW}
                />
                {props.selectedStatus === NO_RESPONSE_STATUS && (
                    <FormElementWithSpacing>
                        <CheckboxGroupInput
                            groupLabel="Did you send any of the following?"
                            labelsAndKeys={FOLLOW_UP_LABELS_AND_KEYS}
                            checkedKeys={callNoResponseFollowUp}
                            onChange={(event) => toggleCallNoResponseFollowUp(event.target.name)}
                        />
                    </FormElementWithSpacing>
                )}
                <Centerer>
                    <Button
                        type="button"
                        variant="contained"
                        onClick={() => props.onSubmit(date, callNoResponseFollowUp)}
                        disabled={!isValidDate}
                    >
                        Submit
                    </Button>
                </Centerer>
                {props.errorText && (
                    <FormErrorText style={{ marginBottom: "0" }}>{props.errorText}</FormErrorText>
                )}
            </ModalInner>
        </Modal>
    );
};

export default StatusesModal;
