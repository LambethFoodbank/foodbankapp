"use client";

import React, { useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import { ErrorSecondaryText, ErrorTextModalFooter } from "@/app/errorStylingandMessages";
import { FormGroup } from "@mui/material";
import Icon from "@/components/Icons/Icon";
import { faShoePrints, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import {
    ButtonsDiv,
    Centerer,
    ContentDiv,
    InputContainer,
    OutsideDiv,
    SpaceBetween,
} from "@/components/Modal/ModalFormStyles";
import Modal from "@/components/Modal/Modal";
import CheckboxInput from "@/components/DataInput/CheckboxInput";
import { StyledIcon, StyledIconButton } from "@/components/Icons/IconButton";
import { Heading } from "@/app/parcels/ActionBar/ActionModals/GeneralActionModal";
import { DesktopTimePicker } from "@mui/x-date-pickers";
import Button from "@mui/material/Button";
import dayjs, { Dayjs } from "dayjs";
import { formatDayjsToHoursAndMinutes, formatTimeStringToHoursAndMinutes } from "@/common/format";
import {
    CollectionCentresTableRow,
    FormattedTimeSlot,
    FormattedTimeSlotsWithPrimaryKey,
    updateDbCollectionCentreTimeSlots,
} from "@/app/admin/collectionCentresTable/CollectionCentreActions";
import { AuditLog, sendAuditLog } from "@/server/auditLog";

interface Props {
    selectedCollectionCentreInfo: CollectionCentresTableRow | null;
    isOpen: boolean;
    onClose: () => void;
}

const ModalTimeSlotsContainer = styled.div`
    max-height: 40vh;
    overflow-y: auto;
`;

const ModalTimeSlotRow = styled.div`
    width: 20rem;
`;

const ColumnContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const RowContainer = styled.div`
    display: flex;
    flex-direction: row;
`;

function getBaseAuditLogForCollectionCentreTimeSlots(
    action: string,
    timeSlotsWithPrimaryKey: FormattedTimeSlotsWithPrimaryKey
): Pick<AuditLog, "action" | "content" | "collectionCentreId"> {
    const timeSlots = Object.fromEntries(
        timeSlotsWithPrimaryKey.timeSlots.map((timeSlot) => [timeSlot.time, timeSlot.isActive])
    );
    return {
        action,
        content: {
            timeSlots,
        },
        collectionCentreId: timeSlotsWithPrimaryKey.primaryKey,
    };
}

const formatCollectionCentreTimeSlotDbData = (
    row: CollectionCentresTableRow
): FormattedTimeSlotsWithPrimaryKey => {
    let formattedTimeSlots: FormattedTimeSlot[];

    if (row.timeSlots === null || row.timeSlots === undefined) {
        formattedTimeSlots = [];
    } else {
        formattedTimeSlots = row.timeSlots.map((timeSlot) => {
            return {
                time: formatTimeStringToHoursAndMinutes(
                    timeSlot.time !== null ? timeSlot.time : ""
                ),
                isActive: timeSlot.is_active !== null ? timeSlot.is_active : false,
            };
        });
    }

    return {
        primaryKey: row.id,
        timeSlots: formattedTimeSlots,
    };
};

const CollectionCentreTimeSlotsModal: React.FC<Props> = (props) => {
    const [timeSlotModalData, setTimeSlotModalData] =
        useState<FormattedTimeSlotsWithPrimaryKey | null>(null);
    const [timeSlotModalErrorMessage, setTimeSlotModalErrorMessage] = useState<string | null>(null);
    const [timeSlotEditIsShown, setTimeSlotEditIsShown] = useState<boolean>(false);
    const [collectionTimeSlotValue, setCollectionTimeSlotValue] = useState<Dayjs>();
    const [addCollectionTimeSlotError, setAddCollectionTimeSlotError] = useState<string | null>(
        null
    );

    const theme = useTheme();

    useEffect(() => {
        if (props.selectedCollectionCentreInfo) {
            setTimeSlotModalData(
                formatCollectionCentreTimeSlotDbData(props.selectedCollectionCentreInfo)
            );
        }
    }, [props.selectedCollectionCentreInfo]);

    const handleModalSaveClick = async (): Promise<void> => {
        if (timeSlotModalData === null) {
            return;
        }
        const { error: updateTimeSlotError } =
            await updateDbCollectionCentreTimeSlots(timeSlotModalData);
        const baseAuditLog = getBaseAuditLogForCollectionCentreTimeSlots(
            "update collection centre time slots",
            timeSlotModalData
        );

        if (updateTimeSlotError) {
            setTimeSlotModalErrorMessage(
                `Failed to update the collection centre time slots. Log ID: ${updateTimeSlotError.logId}`
            );
            await sendAuditLog({
                ...baseAuditLog,
                wasSuccess: false,
                logId: updateTimeSlotError.logId,
            });
        }

        await sendAuditLog({ ...baseAuditLog, wasSuccess: true });
        props.onClose();
    };

    const checkIfSlotExists = (
        existingTimeSlotData: FormattedTimeSlotsWithPrimaryKey,
        newTimeSlot: FormattedTimeSlot
    ): boolean => {
        return existingTimeSlotData.timeSlots.some((slot) => slot.time === newTimeSlot.time);
    };

    const addNewTimeSlotToTimeSlotModalData = (
        existingTimeSlotData: FormattedTimeSlotsWithPrimaryKey,
        newTimeSlot: FormattedTimeSlot
    ): void => {
        const newTimeSlotArray = [...existingTimeSlotData.timeSlots, newTimeSlot];
        newTimeSlotArray.sort((slot1, slot2) => slot1.time.localeCompare(slot2.time));

        const updatedTimeSlotModalData: FormattedTimeSlotsWithPrimaryKey = {
            ...existingTimeSlotData,
            timeSlots: newTimeSlotArray,
        };

        setTimeSlotModalData(updatedTimeSlotModalData);
    };

    const handleAddNewSlotClick = async (): Promise<void> => {
        setTimeSlotEditIsShown(true);
        setCollectionTimeSlotValue(dayjs(collectionTimeSlotValue));
    };

    const handleAddSlotClick = async (): Promise<void> => {
        setAddCollectionTimeSlotError(null);
        if (timeSlotModalData === null || collectionTimeSlotValue === undefined) {
            return;
        }
        const newTimeSlot: FormattedTimeSlot = {
            time: formatDayjsToHoursAndMinutes(collectionTimeSlotValue),
            isActive: true,
        };

        if (checkIfSlotExists(timeSlotModalData, newTimeSlot)) {
            setAddCollectionTimeSlotError(
                "This time slot already exists. Please select a different time."
            );
            return;
        }

        addNewTimeSlotToTimeSlotModalData(timeSlotModalData, newTimeSlot);

        setTimeSlotEditIsShown(false);
    };

    const toggleTimeSlotInModalData = (timeLabel: string): void => {
        if (!timeSlotModalData) {
            return;
        }

        const timeSlotIndex = timeSlotModalData.timeSlots.findIndex(
            (slot) => slot.time === timeLabel
        );
        const timeSlot = timeSlotModalData.timeSlots[timeSlotIndex];
        if (!timeSlot) {
            return;
        }

        timeSlot.isActive = !timeSlot.isActive;

        const updatedTimeSlotData: FormattedTimeSlotsWithPrimaryKey = {
            ...timeSlotModalData,
            timeSlots: timeSlotModalData.timeSlots,
        };

        setTimeSlotModalData(updatedTimeSlotData);
    };

    const deleteTimeSlotFromModalData = (timeLabel: string): void => {
        if (!timeSlotModalData) {
            return;
        }

        const updatedTimeSlotData: FormattedTimeSlotsWithPrimaryKey = {
            ...timeSlotModalData,
            timeSlots: timeSlotModalData.timeSlots.filter(
                (timeSlot) => timeSlot.time !== timeLabel
            ),
        };

        setTimeSlotModalData(updatedTimeSlotData);
    };

    return (
        <Modal
            header={
                <>
                    <Icon icon={faShoePrints} color={theme.primary.largeForeground[2]} />
                    Edit Collection Time Slots
                </>
            }
            isOpen={props.isOpen}
            onClose={() => {
                props.onClose();
            }}
            headerId="expandedCollectionCentreTimeSlotsModal"
            testId="CollectionCentreTimeSlotsModal"
            maxWidth="xs"
            footer={
                <SpaceBetween>
                    {!timeSlotEditIsShown && (
                        <Button
                            onClick={handleAddNewSlotClick}
                            variant="contained"
                            data-testid="DefineNewSlot"
                        >
                            Define a new slot
                        </Button>
                    )}
                    {timeSlotEditIsShown && (
                        <ColumnContainer>
                            <RowContainer>
                                <InputContainer>
                                    <DesktopTimePicker
                                        label="New Collection Slot"
                                        views={["hours", "minutes"]}
                                        format="HH:mm"
                                        value={dayjs(collectionTimeSlotValue)}
                                        onChange={(value) =>
                                            value !== null && setCollectionTimeSlotValue(value)
                                        }
                                    />
                                </InputContainer>
                                <Button
                                    onClick={handleAddSlotClick}
                                    variant="contained"
                                    data-testid="AddSlot"
                                >
                                    Add slot
                                </Button>
                            </RowContainer>
                            {addCollectionTimeSlotError && (
                                <div>
                                    <ErrorTextModalFooter>
                                        {addCollectionTimeSlotError}
                                    </ErrorTextModalFooter>
                                </div>
                            )}
                        </ColumnContainer>
                    )}
                    <Button
                        onClick={handleModalSaveClick}
                        variant="contained"
                        data-testid="SaveSlotsCloseModal"
                    >
                        Save
                    </Button>
                </SpaceBetween>
            }
        >
            <OutsideDiv>
                <ContentDiv>
                    <Centerer>
                        <Heading>{props.selectedCollectionCentreInfo?.name}</Heading>
                    </Centerer>
                    <Centerer>
                        <ModalTimeSlotsContainer aria-label="List of defined time slots">
                            <FormGroup>
                                {timeSlotModalData &&
                                    timeSlotModalData.timeSlots.map((timeSlot) => {
                                        return (
                                            <ModalTimeSlotRow key={timeSlot.time}>
                                                <SpaceBetween>
                                                    <CheckboxInput
                                                        label={timeSlot.time}
                                                        checked={timeSlot.isActive}
                                                        onChange={() =>
                                                            toggleTimeSlotInModalData(timeSlot.time)
                                                        }
                                                        ariaLabel="Time slot"
                                                    />
                                                    <StyledIconButton
                                                        onClick={() =>
                                                            deleteTimeSlotFromModalData(
                                                                timeSlot.time
                                                            )
                                                        }
                                                        aria-label="Delete"
                                                    >
                                                        <StyledIcon
                                                            icon={faTrashAlt}
                                                            onHoverText={`Delete timeslot ${timeSlot.time}`}
                                                        />
                                                    </StyledIconButton>
                                                </SpaceBetween>
                                            </ModalTimeSlotRow>
                                        );
                                    })}
                            </FormGroup>
                        </ModalTimeSlotsContainer>
                    </Centerer>
                </ContentDiv>
                <ButtonsDiv>
                    {timeSlotModalErrorMessage && (
                        <ErrorSecondaryText>{timeSlotModalErrorMessage}</ErrorSecondaryText>
                    )}
                </ButtonsDiv>
            </OutsideDiv>
        </Modal>
    );
};

export default CollectionCentreTimeSlotsModal;
