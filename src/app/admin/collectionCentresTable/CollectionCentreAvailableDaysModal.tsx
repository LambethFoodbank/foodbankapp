"use client";

import { faShoePrints } from "@fortawesome/free-solid-svg-icons";
import { FormGroup } from "@mui/material";
import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import {
    CollectionCentresTableRow,
    FormattedAvailableDaysWithPrimaryKey,
} from "@/app/admin/collectionCentresTable/CollectionCentreActions";
import { Heading } from "@/app/parcels/ActionBar/ActionModals/GeneralActionModal";
import CheckboxInput from "@/components/DataInput/CheckboxInput";
import Icon from "@/components/Icons/Icon";
import Modal from "@/components/Modal/Modal";
import { Centerer, ContentDiv, OutsideDiv, SpaceBetween } from "@/components/Modal/ModalFormStyles";
import { ModalContainer, ModalRow } from "@/app/admin/common/modalStyles";
import { DaysOfWeekType } from "@/common/databaseDaysOfWeek";

interface Props {
    selectedCollectionCentreInfo: CollectionCentresTableRow | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updated: FormattedAvailableDaysWithPrimaryKey) => void;
}

const formatCollectionCentreAvailableDaysDbData = (
    row: CollectionCentresTableRow
): FormattedAvailableDaysWithPrimaryKey => {
    const defaultDays: Record<DaysOfWeekType, boolean> = {
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: false,
        Sunday: false,
    };

    if (!row.availability || row.availability.length === 0) {
        const availableDays = Object.entries(defaultDays).map(([day, isActive]) => ({
            day: day as DaysOfWeekType,
            isActive,
        }));

        return {
            primaryKey: row.id,
            availableDays,
            lastUpdated: row.lastUpdated,
        };
    }

    const availableDays = Object.entries(defaultDays).map(([day, _], index) => {
        const dayAvailability = row.availability.find((dayObj) => dayObj.dayIndex === index);
        return {
            day: day as DaysOfWeekType,
            isActive: dayAvailability ? dayAvailability.isActive : false,
        };
    });

    return {
        primaryKey: row.id,
        availableDays,
        lastUpdated: row.lastUpdated,
    };
};

const CollectionCentreAvailableDaysModal: React.FC<Props> = (props) => {
    const [availableDaysModalData, setAvailableDaysModalData] =
        useState<FormattedAvailableDaysWithPrimaryKey | null>(null);

    const theme = useTheme();

    useEffect(() => {
        if (props.selectedCollectionCentreInfo) {
            setAvailableDaysModalData(
                formatCollectionCentreAvailableDaysDbData(props.selectedCollectionCentreInfo)
            );
        }
    }, [props.selectedCollectionCentreInfo]);

    const handleModalSaveClick = async (): Promise<void> => {
        if (availableDaysModalData === null) {
            return;
        }
        const payload: FormattedAvailableDaysWithPrimaryKey = {
            ...availableDaysModalData,
        };
        props.onSave(payload);
        props.onClose();
    };

    const toggleAvailableDaysInModalData = (dayToToggle: string): void => {
        if (!availableDaysModalData) {
            return;
        }

        setAvailableDaysModalData((previousAvailableDaysModalData) =>
            previousAvailableDaysModalData
                ? {
                      ...previousAvailableDaysModalData,
                      availableDays: previousAvailableDaysModalData.availableDays.map(
                          (availableDayObject) =>
                              availableDayObject.day === dayToToggle
                                  ? {
                                        ...availableDayObject,
                                        isActive: !availableDayObject.isActive,
                                    }
                                  : availableDayObject
                      ),
                  }
                : null
        );
    };

    return (
        <Modal
            header={
                <>
                    <Icon icon={faShoePrints} color={theme.primary.largeForeground[2]} />
                    Edit Collection Days
                </>
            }
            isOpen={props.isOpen}
            onClose={() => {
                props.onClose();
            }}
            headerId="expandedCollectionCentreAvailableDaysModal"
            testId="CollectionCentreAvailableDaysModal"
            maxWidth="xs"
            footer={
                <SpaceBetween>
                    <Button
                        onClick={handleModalSaveClick}
                        variant="contained"
                        data-testid="SaveDaysCloseModal"
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
                        <ModalContainer aria-label="List of defined available days">
                            <FormGroup>
                                {availableDaysModalData &&
                                    availableDaysModalData.availableDays.map((availableDay) => (
                                        <>
                                            {availableDay.day != null && (
                                                <ModalRow key={availableDay.day}>
                                                    <SpaceBetween>
                                                        <CheckboxInput
                                                            label={availableDay.day}
                                                            checked={availableDay.isActive}
                                                            onChange={() =>
                                                                toggleAvailableDaysInModalData(
                                                                    availableDay.day
                                                                )
                                                            }
                                                            ariaLabel="Available Day"
                                                        />
                                                    </SpaceBetween>
                                                </ModalRow>
                                            )}
                                        </>
                                    ))}
                            </FormGroup>
                        </ModalContainer>
                    </Centerer>
                </ContentDiv>
            </OutsideDiv>
        </Modal>
    );
};

export default CollectionCentreAvailableDaysModal;
