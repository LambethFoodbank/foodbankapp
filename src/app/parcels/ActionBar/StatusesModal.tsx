import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { managerOrAboveRoles, RoleUpdateContext } from "@/app/roles";
import { Checkbox, Button, FormControlLabel } from "@mui/material";
import Modal from "@/components/Modal/Modal";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ParcelsTableRow } from "../parcelsTable/types";
import SelectedParcelsOverview from "./SelectedParcelsOverview";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import { Centerer } from "@/components/Modal/ModalFormStyles";

interface StatusesModalProps extends React.ComponentProps<typeof Modal> {
    selectedParcels: ParcelsTableRow[];
    onSubmit: (date?: Dayjs) => void;
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

// QQ Tests for server-side timestamp
// - managers & admins can see override option; staff/volunteers cannot - see WikiItems.test.tsx
// - when override is checked, date & time pickers appear
// - when override is unchecked, date & time pickers disappear
// - when modal is opened, override is unchecked
// - E2E test: submit with override checked saves with user timestamp
// - E2E test: submit with override unchecked saves with current timestamp

const StatusesModal: React.FC<StatusesModalProps> = (props) => {
    const [dateTimeIsOverridden, setDateTimeIsOverridden] = useState<boolean>(false);
    const [date, setDate] = useState(dayjs(new Date()));

    const { role } = useContext(RoleUpdateContext);
    const userCanOverrideDateTime = role && managerOrAboveRoles.includes(role);

    useEffect(() => {
        setDateTimeIsOverridden(false);
    }, [props.isOpen]);

    useEffect(() => {
        setDate(dayjs(new Date()));
    }, [props.isOpen, dateTimeIsOverridden]);

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

    const handleOverrideCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setDateTimeIsOverridden(event.target.checked);
    };

    const maxParcelsToShow = 5;

    return (
        <Modal {...props}>
            <ModalInner>
                {props.errorText && <ErrorSecondaryText>{props.errorText}</ErrorSecondaryText>}
                {userCanOverrideDateTime && (
                    <>
                        <Row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={dateTimeIsOverridden}
                                        onChange={handleOverrideCheckbox}
                                    />
                                }
                                label="Override status timestamp"
                            />
                        </Row>
                        {dateTimeIsOverridden && (
                            <Centerer>
                                <Row>
                                    Date:
                                    <DatePicker
                                        value={date}
                                        defaultValue={date}
                                        onChange={onDateChange}
                                        disabled={!dateTimeIsOverridden}
                                        disableFuture
                                    />
                                    Time:
                                    <TimePicker
                                        value={date}
                                        onChange={onTimeChange}
                                        disabled={!dateTimeIsOverridden}
                                        disableFuture
                                    />
                                </Row>
                            </Centerer>
                        )}
                    </>
                )}
                <SelectedParcelsOverview
                    parcels={props.selectedParcels}
                    maxParcelsToShow={maxParcelsToShow}
                />
                <Centerer>
                    <Button
                        type="button"
                        variant="contained"
                        onClick={() => props.onSubmit(dateTimeIsOverridden ? date : undefined)}
                    >
                        Submit
                    </Button>
                </Centerer>
            </ModalInner>
        </Modal>
    );
};

export default StatusesModal;
