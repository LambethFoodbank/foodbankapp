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
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

interface StatusesModalProps extends React.ComponentProps<typeof Modal> {
    selectedParcels: ParcelsTableRow[];
    onSubmit: (date: Dayjs, callNoResponseStatuses: string[]) => void;
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

    const [callNoResponseStatuses, setCallNoResponseStatuses] = useState<string[]>([]);

    const toggleCallNoResponseStatuses = (newNoResponseStatus: string): void => {
        setCallNoResponseStatuses((prevCallNoResponseStatuses) =>
            prevCallNoResponseStatuses.includes(newNoResponseStatus)
                ? prevCallNoResponseStatuses.filter(
                      (prevStatus) => prevStatus !== newNoResponseStatus
                  )
                : [...prevCallNoResponseStatuses, newNoResponseStatus]
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
                {props.selectedStatus === "Called and No Response" && (
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={callNoResponseStatuses.includes("Voicemail")}
                                    onChange={() => toggleCallNoResponseStatuses("Voicemail")}
                                />
                            }
                            label="Voicemail"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={callNoResponseStatuses.includes("Text")}
                                    onChange={() => toggleCallNoResponseStatuses("Text")}
                                />
                            }
                            label="Text"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={callNoResponseStatuses.includes("Email")}
                                    onChange={() => toggleCallNoResponseStatuses("Email")}
                                />
                            }
                            label="Email"
                        />
                    </FormGroup>
                )}
                <Centerer>
                    <Button
                        type="button"
                        variant="contained"
                        onClick={() => props.onSubmit(date, callNoResponseStatuses)}
                    >
                        Submit
                    </Button>
                </Centerer>
            </ModalInner>
        </Modal>
    );
};

export default StatusesModal;
