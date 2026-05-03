import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { managerOrAboveRoles, RoleUpdateContext } from "@/app/roles";
import { Checkbox, Button, FormControlLabel } from "@mui/material";
import Modal from "@/components/Modal/Modal";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ParcelsTableRow } from "../parcelsTable/types";
import SelectedParcelsOverview from "./SelectedParcelsOverview";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import { FormElementWithSpacing } from "@/components/Form/formStyling";
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
    onSubmit: (date: Dayjs | undefined, callNoResponseFollowUp: string[]) => void;
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
    const [dateTimeIsOverridden, setDateTimeIsOverridden] = useState<boolean>(false);
    const [dateTime, setDateTime] = useState(dayjs(new Date()));
    const [callNoResponseFollowUp, setCallNoResponseFollowUp] = useState<string[]>([]);

    const { role } = useContext(RoleUpdateContext);
    const userCanOverrideDateTime = role && managerOrAboveRoles.includes(role);

    useEffect(() => {
        setDateTimeIsOverridden(false);
    }, [props.isOpen]);

    useEffect(() => {
        setDateTime(dayjs(new Date()));
    }, [props.isOpen, dateTimeIsOverridden]);

    const onDateTimeChange = (newDateTime: Dayjs | null): void => {
        setDateTime((dateTime) =>
            dayjs()
                .set("year", newDateTime?.year() ?? dateTime.year())
                .set("month", newDateTime?.month() ?? dateTime.month())
                .set("date", newDateTime?.date() ?? dateTime.date())
                .set("hour", newDateTime?.hour() ?? dateTime.hour())
                .set("minute", newDateTime?.minute() ?? dateTime.minute())
                .set("second", 0)
    const handleOverrideCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setDateTimeIsOverridden(event.target.checked);
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
        <Modal {...props} testId="StatusesModal">
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
                                        data-testid="OverrideDateTimeCheckbox"
                                    />
                                }
                                label="Override status timestamp"
                            />
                            {dateTimeIsOverridden && (
                                <DateTimePicker
                                    label="Date and Time"
                                    aria-label="Date and Time"
                                    value={dateTime}
                                    onChange={onDateTimeChange}
                                    disabled={!dateTimeIsOverridden}
                                    disableFuture
                                />
                            )}
                        </Row>
                    </>
                )}
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
                        onClick={() =>
                            props.onSubmit(
                                dateTimeIsOverridden ? dateTime : undefined,
                                callNoResponseFollowUp
                            )
                        }
                    >
                        Submit
                    </Button>
                </Centerer>
            </ModalInner>
        </Modal>
    );
};

export default StatusesModal;
