"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Schema } from "@/databaseUtils";
import { logErrorReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import { ErrorSecondaryText, ErrorTextModalFooter } from "@/app/errorStylingandMessages";
import {
    GridActionsCellItem,
    GridColDef,
    GridEventListener,
    GridRowEditStopReasons,
    GridRowId,
    GridRowModes,
    GridRowModesModel,
} from "@mui/x-data-grid";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import Header from "@/app/admin/websiteDataTable/Header";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import StyledDataGrid from "@/app/admin/common/StyledDataGrid";
import { FormGroup, LinearProgress } from "@mui/material";
import {
    fetchCollectionCentresForTable,
    InsertCollectionCentreResult,
    insertNewCollectionCentre,
    UpdateCollectionCentreResult,
    updateDbCollectionCentre,
    updateDbCollectionCentreTimeSlots,
} from "@/app/admin/collectionCentresTable/CollectionCentreActions";
import { EditToolbar } from "@/app/admin/collectionCentresTable/CollectionCentresTableToolbar";
import Button from "@mui/material/Button";
import Icon from "@/components/Icons/Icon";
import { faShoePrints, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import {
    ButtonsDiv,
    Centerer,
    ContentDiv,
    OutsideDiv,
    SpaceBetween,
} from "@/components/Modal/ModalFormStyles";
import Modal from "@/components/Modal/Modal";
import styled, { useTheme } from "styled-components";
import { formatDayjsToHoursAndMinutes, formatTimeStringToHoursAndMinutes } from "@/common/format";
import { DesktopTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import FloatingToast from "@/components/FloatingToast";
import CheckboxInput from "@/components/DataInput/CheckboxInput";
import { StyledIcon, StyledIconButton } from "@/components/Icons/IconButton";
import { Heading } from "@/app/parcels/ActionBar/ActionModals/GeneralActionModal";

export interface CollectionCentresTableRow {
    acronym: Schema["collection_centres"]["acronym"];
    name: Schema["collection_centres"]["name"];
    id: Schema["collection_centres"]["primary_key"];
    isDelivery: Schema["collection_centres"]["is_delivery"];
    isShown: Schema["collection_centres"]["is_shown"];
    timeSlots: Schema["collection_centres"]["time_slots"];
    isNew: boolean;
}

export interface FormattedTimeSlot {
    time: string;
    isActive: boolean;
}

export interface FormattedTimeSlotsWithPrimaryKey {
    primaryKey: Schema["collection_centres"]["primary_key"];
    timeSlots: FormattedTimeSlot[];
}

const ModalTimeSlotsContainer = styled.div`
    max-height: 40vh;
    overflow-y: auto;
`;

const ModalTimeSlotRow = styled.div`
    width: 15rem;
`;

function getBaseAuditLogForCollectionCentreAction(
    action: string,
    collectionCentreRow: CollectionCentresTableRow,
    options?: {
        excludeCollectionCentreId?: boolean;
    }
): Pick<AuditLog, "action" | "content" | "collectionCentreId"> {
    return {
        action,
        content: {
            collectionCentreName: collectionCentreRow.name,
            collectionCentreAcronym: collectionCentreRow.acronym,
            collectionCentreIsShown: collectionCentreRow.isShown,
        },
        collectionCentreId: options?.excludeCollectionCentreId ? undefined : collectionCentreRow.id,
    };
}

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

    if (row.timeSlots === null) {
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

const CollectionCentresTable: React.FC = () => {
    const [rows, setRows] = useState<CollectionCentresTableRow[]>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [existingRowData, setExistingRowData] = useState<CollectionCentresTableRow | null>(null);
    const [timeSlotModalIsOpen, setTimeSlotModalIsOpen] = useState<boolean>(false);
    const [timeSlotModalErrorMessage, setTimeSlotModalErrorMessage] = useState<string | null>(null);
    const [timeSlotModalCentreName, setTimeSlotModalCentreName] = useState<string | null>(null);
    const [timeSlotModalData, setTimeSlotModalData] =
        useState<FormattedTimeSlotsWithPrimaryKey | null>(null);
    const [editableIsShown, setEditableIsShown] = useState<boolean>(false);
    const [collectionTimeSlotValue, setCollectionTimeSlotValue] = useState<Dayjs>();
    const [addCollectionTimeSlotError, setAddCollectionTimeSlotError] = useState<string | null>(
        null
    );
    const theme = useTheme();

    const getCollectionCentresForTable = useCallback(async () => {
        setErrorMessage(null);
        const { data, error } = await fetchCollectionCentresForTable();
        if (error) {
            setErrorMessage("Error fetching data, please reload");
            return;
        }
        setRows(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        void getCollectionCentresForTable();
    }, [getCollectionCentresForTable]);

    useEffect(() => {
        const subscriptionChannel = supabase
            .channel("collection-centre-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "collection_centres" },
                getCollectionCentresForTable
            )
            .subscribe((status, error) => {
                if (subscriptionStatusRequiresErrorMessage(status, error, "collection_centres")) {
                    setErrorMessage("Error fetching data, please reload");
                } else {
                    setErrorMessage(null);
                }
            });

        return () => {
            void supabase.removeChannel(subscriptionChannel);
        };
    }, [getCollectionCentresForTable]);

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
        setTimeSlotModalIsOpen(false);
    };

    const handleAddSlotClick = async (): Promise<void> => {
        setEditableIsShown(true);
        setCollectionTimeSlotValue(dayjs(collectionTimeSlotValue));
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

    const handleSaveSlotClick = async (): Promise<void> => {
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

        setEditableIsShown(false);
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

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.View },
        }));
    };

    const addNewCollectionCentre = async (
        newRow: CollectionCentresTableRow
    ): Promise<InsertCollectionCentreResult> => {
        const { data: createdCollectionCentre, error: insertCollectionCentreError } =
            await insertNewCollectionCentre(newRow);
        const baseAuditLog = getBaseAuditLogForCollectionCentreAction(
            "add a new collection centre",
            newRow,
            { excludeCollectionCentreId: true }
        );

        if (insertCollectionCentreError) {
            setErrorMessage(
                `Failed to add the collection centre. Log ID: ${insertCollectionCentreError.logId}`
            );
            await sendAuditLog({
                ...baseAuditLog,
                wasSuccess: false,
                logId: insertCollectionCentreError.logId,
            });
            setIsLoading(false);
            return { data: null, error: insertCollectionCentreError };
        } else {
            await sendAuditLog({
                ...baseAuditLog,
                collectionCentreId: createdCollectionCentre.collectionCentreId,
                wasSuccess: true,
            });
            setIsLoading(false);
            return { data: createdCollectionCentre, error: null };
        }
    };

    const updateCollectionCentre = async (
        newRow: CollectionCentresTableRow
    ): Promise<UpdateCollectionCentreResult> => {
        const { error: updateCollectionCentreError } = await updateDbCollectionCentre(newRow);
        const baseAuditLog = getBaseAuditLogForCollectionCentreAction(
            "update a collection centre",
            newRow
        );

        if (updateCollectionCentreError) {
            setErrorMessage(
                `Failed to update the collection centre. Log ID: ${updateCollectionCentreError.logId}`
            );
            await sendAuditLog({
                ...baseAuditLog,
                wasSuccess: false,
                logId: updateCollectionCentreError.logId,
            });
            setIsLoading(false);
            return { error: updateCollectionCentreError };
        }

        await sendAuditLog({ ...baseAuditLog, wasSuccess: true });
        setIsLoading(false);
        return { error: null };
    };

    const processRowUpdate = async (
        newRow: CollectionCentresTableRow
    ): Promise<CollectionCentresTableRow> => {
        setErrorMessage(null);
        setIsLoading(true);

        if (newRow.isNew) {
            const { data: newCollectionCentreData, error: newCollectionCentreError } =
                await addNewCollectionCentre({
                    ...newRow,
                });
            if (newCollectionCentreError) {
                return { ...newRow, name: "", acronym: "", isShown: false };
            }
            return { ...newRow, id: newCollectionCentreData.collectionCentreId, isNew: false };
        } else {
            const { error: updateCollectionCentreError } = await updateCollectionCentre(newRow);
            if (updateCollectionCentreError) {
                if (existingRowData) {
                    const rowToReturn = { ...existingRowData };
                    setExistingRowData(null);
                    return rowToReturn;
                }
            }
            return newRow;
        }
    };

    const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            //prevents default behaviour of saving the edited state when clicking away from row being edited, force user to use save or cancel buttons
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => () => {
        const existingRowIndex = rows.map((row) => row.id).indexOf(id.toString());
        setExistingRowData(rows[existingRowIndex]);
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.Edit },
        }));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        }));

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow === undefined) {
            const logId = logErrorReturnLogId(
                "Edited row in collection centre admin table is undefined onCancelClick"
            );
            setErrorMessage(`Table error, please try again. Log ID: ${logId}`);
        } else if (editedRow.isNew) {
            setRows((currentValue) => currentValue.filter((row) => row.id !== id));
        }
        setExistingRowData(null);
    };

    const collectionCentreColumns: GridColDef[] = [
        {
            field: "name",
            headerName: "Collection Centre Name",
            flex: 1,
            minWidth: 400,
            editable: true,
            renderHeader: (params) => <Header {...params} />,
        },
        {
            field: "acronym",
            headerName: "Acronym",
            flex: 1,
            editable: true,
            renderHeader: (params) => <Header {...params} />,
        },
        {
            field: "isShown",
            type: "boolean",
            headerName: "Show",
            flex: 1,
            editable: true,
            renderHeader: (params) => <Header {...params} />,
        },
        {
            field: "collectionSlot",
            type: "actions",
            headerName: "Collection Slots",
            flex: 1,
            renderHeader: (params) => <Header {...params} />,
            renderCell: (params) => {
                const handleEditCollectionCentreTimeSlot = (): void => {
                    const row = params.row as CollectionCentresTableRow;
                    const formattedTimeSlotData = formatCollectionCentreTimeSlotDbData(row);
                    setTimeSlotModalData(formattedTimeSlotData);
                    setTimeSlotModalCentreName(row.name);
                    setTimeSlotModalIsOpen(true);
                };

                return (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleEditCollectionCentreTimeSlot}
                        disabled={params.row.isNew || params.row.isDelivery}
                    >
                        Edit Collection Slots
                    </Button>
                );
            },
        },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 1,
            cellClassName: "actions",
            renderHeader: (params) => <Header {...params} />,
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: "primary.main",
                            }}
                            onClick={handleSaveClick(id)}
                            key="Save"
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                            key="Cancel"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                        key="Edit"
                    />,
                ];
            },
        },
    ];

    return (
        <>
            {errorMessage && (
                <FloatingToast
                    message={errorMessage}
                    severity="warning"
                    variant="filled"
                ></FloatingToast>
            )}
            {rows && (
                <StyledDataGrid
                    rows={rows}
                    aria-label="Collection Centres Table"
                    columns={collectionCentreColumns}
                    editMode="row"
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={setRowModesModel}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={processRowUpdate}
                    slots={{
                        toolbar: EditToolbar,
                        loadingOverlay: LinearProgress,
                    }}
                    slotProps={{
                        toolbar: { setRows, setRowModesModel, rows },
                    }}
                    loading={isLoading}
                    getRowClassName={(params) =>
                        (params.indexRelativeToCurrentPage + 1) % 2 === 0
                            ? "datagrid-row-even"
                            : "datagrid-row-odd"
                    }
                    hideFooter
                />
            )}
            {timeSlotModalIsOpen && (
                <Modal
                    header={
                        <>
                            <Icon icon={faShoePrints} color={theme.primary.largeForeground[2]} />{" "}
                            Edit Collection Centre Time Slots
                        </>
                    }
                    isOpen={timeSlotModalIsOpen}
                    onClose={() => {
                        setTimeSlotModalIsOpen(false);
                    }}
                    headerId="expandedCollectionCentreTimeSlotsModal"
                    footer={
                        <SpaceBetween>
                            {!editableIsShown && (
                                <Button onClick={handleAddSlotClick} variant="contained">
                                    Add a new slot
                                </Button>
                            )}
                            {editableIsShown && (
                                <>
                                    <Centerer>
                                        <DesktopTimePicker
                                            label="New Collection Slot"
                                            views={["hours", "minutes"]}
                                            format="HH:mm"
                                            value={dayjs(collectionTimeSlotValue)}
                                            onChange={(value) =>
                                                value !== null && setCollectionTimeSlotValue(value)
                                            }
                                        />
                                        <Button onClick={handleSaveSlotClick} variant="contained">
                                            Save slot
                                        </Button>
                                    </Centerer>
                                    {addCollectionTimeSlotError && (
                                        <ErrorTextModalFooter>
                                            {addCollectionTimeSlotError}
                                        </ErrorTextModalFooter>
                                    )}
                                </>
                            )}
                            <Button onClick={handleModalSaveClick} variant="contained">
                                Save
                            </Button>
                        </SpaceBetween>
                    }
                >
                    <OutsideDiv>
                        <ContentDiv>
                            <Centerer>
                                <Heading>{timeSlotModalCentreName}</Heading>
                            </Centerer>
                            <Centerer>
                                <ModalTimeSlotsContainer>
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
                                                                    toggleTimeSlotInModalData(
                                                                        timeSlot.time
                                                                    )
                                                                }
                                                            />
                                                            <StyledIconButton
                                                                onClick={() =>
                                                                    deleteTimeSlotFromModalData(
                                                                        timeSlot.time
                                                                    )
                                                                }
                                                                aria-label="delete"
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
            )}
        </>
    );
};

export default CollectionCentresTable;
