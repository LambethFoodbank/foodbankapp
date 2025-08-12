"use client";

import { faShoePrints } from "@fortawesome/free-solid-svg-icons";
import { FormGroup } from "@mui/material";
import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import {
    CollectionCentresTableRow,
    FormattedAvailableDayType,
    FormattedAvailableDaysWithPrimaryKey,
    updateDbCollectionCentreAvailableDays,
} from "@/app/admin/collectionCentresTable/CollectionCentreActions";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import { Heading } from "@/app/parcels/ActionBar/ActionModals/GeneralActionModal";
import CheckboxInput from "@/components/DataInput/CheckboxInput";
import Icon from "@/components/Icons/Icon";
import Modal from "@/components/Modal/Modal";
import {
    ButtonsDiv,
    Centerer,
    ContentDiv,
    OutsideDiv,
    SpaceBetween,
} from "@/components/Modal/ModalFormStyles";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { ModalAvailableDaysContainer, ModalAvailableDaysRow } from "@/app/admin/common/modalStyles";

interface Props {
    selectedCollectionCentreInfo: CollectionCentresTableRow | null;
    isOpen: boolean;
    onClose: () => void;
}

function getBaseAuditLogForCollectionCentreAvailableDays(
    action: string,
    availableDaysWithPrimaryKey: FormattedAvailableDaysWithPrimaryKey
): Pick<AuditLog, "action" | "content" | "collectionCentreId"> {
    const availableDays = Object.fromEntries(
        availableDaysWithPrimaryKey.availableDays.map((availaleDays) => [
            availaleDays.day,
            availaleDays.isActive,
        ])
    );
    return {
        action,
        content: {
            availableDays,
        },
        collectionCentreId: availableDaysWithPrimaryKey.primaryKey,
    };
}

const formatCollectionCentreAvailableDaysDbData = (
    row: CollectionCentresTableRow
): FormattedAvailableDaysWithPrimaryKey => {
    let formattedAvailableDays: FormattedAvailableDayType[];

    if (row.availableDays === null || row.availableDays === undefined) {
        formattedAvailableDays = [];
    } else {
        formattedAvailableDays = row.availableDays.map((availableDays) => {
            return {
                day: availableDays.day,
                isActive: availableDays.is_active !== null ? availableDays.is_active : false,
            };
        });
    }

    return {
        primaryKey: row.id,
        availableDays: formattedAvailableDays,
    };
};

const CollectionCentreAvailableDaysModal: React.FC<Props> = (props) => {
    const [availableDaysModalData, setAvailableDaysModalData] =
        useState<FormattedAvailableDaysWithPrimaryKey | null>(null);
    const [availableDaysModalErrorMessage, setAvailableDaysModalErrorMessage] = useState<
        string | null
    >(null);

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
        const { error: updateAvailableDaysError } =
            await updateDbCollectionCentreAvailableDays(availableDaysModalData);
        const baseAuditLog = getBaseAuditLogForCollectionCentreAvailableDays(
            "update collection centre available days",
            availableDaysModalData
        );

        if (updateAvailableDaysError) {
            setAvailableDaysModalErrorMessage(
                `Failed to update the collection centre available days. Log ID: ${updateAvailableDaysError.logId}`
            );
            await sendAuditLog({
                ...baseAuditLog,
                wasSuccess: false,
                logId: updateAvailableDaysError.logId,
            });
        }

        await sendAuditLog({ ...baseAuditLog, wasSuccess: true });
        props.onClose();
    };

    const toggleAvailableDaysInModalData = (dayLabel: string): void => {
        if (!availableDaysModalData) {
            return;
        }

        const availableDaysIndex = availableDaysModalData.availableDays.findIndex(
            (availableDay) => availableDay.day === dayLabel
        );
        const availableDay = availableDaysModalData.availableDays[availableDaysIndex];
        if (!availableDay) {
            return;
        }

        availableDay.isActive = !availableDay.isActive;

        const updatedAvailableDaysData: FormattedAvailableDaysWithPrimaryKey = {
            ...availableDaysModalData,
            availableDays: availableDaysModalData.availableDays,
        };

        setAvailableDaysModalData(updatedAvailableDaysData);
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
                        <ModalAvailableDaysContainer aria-label="List of defined available days">
                            <FormGroup>
                                {availableDaysModalData &&
                                    availableDaysModalData.availableDays.map((availableDay) => {
                                        return (
                                            <>
                                                {availableDay.day != null && (
                                                    <ModalAvailableDaysRow key={availableDay.day}>
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
                                                    </ModalAvailableDaysRow>
                                                )}
                                            </>
                                        );
                                    })}
                            </FormGroup>
                        </ModalAvailableDaysContainer>
                    </Centerer>
                </ContentDiv>
                <ButtonsDiv>
                    {availableDaysModalErrorMessage && (
                        <ErrorSecondaryText>{availableDaysModalErrorMessage}</ErrorSecondaryText>
                    )}
                </ButtonsDiv>
            </OutsideDiv>
        </Modal>
    );
};

export default CollectionCentreAvailableDaysModal;
