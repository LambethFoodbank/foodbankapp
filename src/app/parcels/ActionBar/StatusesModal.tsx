import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "@mui/material/Button";
import Modal from "@/components/Modal/Modal";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ParcelsTableRow } from "../parcelsTable/types";
import SelectedParcelsOverview from "./SelectedParcelsOverview";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import { FormElementWithSpacing } from "@/components/Form/formStyling";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";

interface StatusesModalProps extends React.ComponentProps<typeof Modal> {
    selectedParcels: ParcelsTableRow[];
    onSubmit: (date: Dayjs, callNoResponseFollowUp: string[]) => void;
    selectedStatus?: string | null;
    errorText: string | null;
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
    const [callNoResponseFollowUp, setCallNoResponseFollowUp] = useState<string[]>([]);

    const noResponseStatus = "Called and No Response";
    const noResponseFollowUp = ["Voicemail", "Text", "Email"];

    useEffect(() => {
        setDate(dayjs(new Date()));
    }, [props.isOpen]);

    const onDateChange = (newDate: Dayjs | null): void =>
        setDate((date) =>
            date
                .set("year", newDate?.year() ?? date.year())
                .set("month", newDate?.month() ?? date.month())
                .set("date", newDate?.date() ?? date.date())
        );

    const onTimeChange = (newDate: Dayjs | null): void =>
        setDate((date) =>
            date
                .set("hour", newDate?.hour() ?? date.hour())
                .set("minute", newDate?.minute() ?? date.minute())
        );

    const maxParcelsToShow = 5;

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
                {props.errorText && <ErrorSecondaryText>{props.errorText}</ErrorSecondaryText>}
                <Centerer>
                    <Row>
                        Date:
                        <DatePicker
                            value={date}
                            defaultValue={date}
                            onChange={onDateChange}
                            disableFuture
                        />
                        Time:
                        <TimePicker value={date} onChange={onTimeChange} disableFuture />
                    </Row>
                </Centerer>
                <SelectedParcelsOverview
                    parcels={props.selectedParcels}
                    maxParcelsToShow={maxParcelsToShow}
                />
                {props.selectedStatus === noResponseStatus && (
                    <FormElementWithSpacing>
                        <CheckboxGroupInput
                            groupLabel="Did you send any of the following?"
                            labelsAndKeys={noResponseFollowUp.map((followUp) => [
                                followUp,
                                followUp,
                            ])}
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
                    >
                        Submit
                    </Button>
                </Centerer>
            </ModalInner>
        </Modal>
    );
};

export default StatusesModal;
