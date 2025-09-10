"use client";

import CancelIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { LinearProgress } from "@mui/material";
import Button from "@mui/material/Button";
import {
    GridActionsCellItem,
    GridColDef,
    GridEventListener,
    GridRowEditStopReasons,
    GridRowId,
    GridRowModes,
    GridRowModesModel,
} from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";
import {
    CollectionCentresTableRow,
    fetchCollectionCentresForTable,
    FormattedAvailableDaysWithPrimaryKey,
    FormattedTimeSlotsWithPrimaryKey,
    InsertCollectionCentreResult,
    insertNewCollectionCentre,
    UpdateCollectionCentreResult,
    updateDbCollectionCentre,
} from "@/app/admin/collectionCentresTable/CollectionCentreActions";
import { EditToolbar } from "@/app/admin/collectionCentresTable/CollectionCentresTableToolbar";
import StyledDataGrid from "@/app/admin/common/StyledDataGrid";
import Header from "@/app/admin/websiteDataTable/Header";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import FloatingToast from "@/components/FloatingToast";
import { logErrorReturnLogId } from "@/logger/logger";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import supabase from "@/supabaseClient";
import CollectionCentreTimeSlotsModal from "./CollectionCentreTimeSlotsModal";
import CollectionCentreAvailableDaysModal from "./CollectionCentreAvailableDaysModal";

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
            collectionCentreLastUpdated: collectionCentreRow.lastUpdated,
        },
        collectionCentreId: options?.excludeCollectionCentreId ? undefined : collectionCentreRow.id,
    };
}

const CollectionCentresTable: React.FC = () => {
    const [rows, setRows] = useState<CollectionCentresTableRow[]>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [timeSlotModalIsOpen, setTimeSlotModalIsOpen] = useState<boolean>(false);
    const [selectedRowForTimeSlotEdit, setSelectedRowForTimeSlotEdit] =
        useState<CollectionCentresTableRow | null>(null);
    const [availableDaysModalIsOpen, setAvailableDaysModalIsOpen] = useState<boolean>(false);
    const [selectedRowForAvailableDaysEdit, setSelectedRowForAvailableDaysEdit] =
        useState<CollectionCentresTableRow | null>(null);
    const originalTimestampsRef = React.useRef<Record<string, string>>({});

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
        const rowWithOriginal = {
            ...newRow,
            originalLastUpdated: originalTimestampsRef.current[newRow.id],
        };
        const { error: updateCollectionCentreError } =
            await updateDbCollectionCentre(rowWithOriginal);
        const baseAuditLog = getBaseAuditLogForCollectionCentreAction(
            "update a collection centre",
            newRow
        );

        if (updateCollectionCentreError) {
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

    const refreshRow = async (id: string): Promise<CollectionCentresTableRow | null> => {
        const { data: latestRow, error } = await supabase
            .from("collection_centres")
            .select(
                `
      *,
      collection_centres_availability!inner(day_index, is_active, time_slots)
    `
            )
            .eq("primary_key", id)
            .single();

        if (error || !latestRow) {
            return null;
        }

        const mappedRow: CollectionCentresTableRow = {
            id: latestRow.primary_key,
            name: latestRow.name,
            acronym: latestRow.acronym,
            isDelivery: latestRow.is_delivery,
            isShown: latestRow.is_shown,
            availability: latestRow.collection_centres_availability
                .sort((first, second) => first.day_index - second.day_index)
                .map((day) => ({
                    dayIndex: day.day_index,
                    isActive: day.is_active,
                    timeSlots: day.time_slots || [],
                })),
            isNew: false,
            lastUpdated: latestRow.last_updated,
        };

        setRows((prev) => prev.map((row) => (row.id === id ? mappedRow : row)));
        setErrorMessage(null);
        return mappedRow;
    };

    const processRowUpdate = async (
        newRow: CollectionCentresTableRow
    ): Promise<CollectionCentresTableRow> => {
        setErrorMessage(null);
        setIsLoading(true);

        try {
            if (newRow.isNew) {
                const { data: newCollectionCentreData, error: newCollectionCentreError } =
                    await addNewCollectionCentre({
                        ...newRow,
                    });
                if (newCollectionCentreError) {
                    const message = `Failed to add the collection centre. Log ID: ${newCollectionCentreError.logId}`;
                    setErrorMessage(message);
                    throw new Error(message);
                }
                return { ...newRow, id: newCollectionCentreData.collectionCentreId, isNew: false };
            } else {
                const { error: updateCollectionCentreError } = await updateCollectionCentre(newRow);
                if (updateCollectionCentreError) {
                    let message = `Failed to update the collection centre. Log ID: ${updateCollectionCentreError.logId}`;

                    if (updateCollectionCentreError.type === "ConcurrentEditCollectionCentre") {
                        message =
                            "Record has been edited recently - please refresh the page." +
                            `Log ID: ${updateCollectionCentreError.logId}`;
                    }
                    setErrorMessage(message);
                    throw new Error(message);
                }
            }
            return newRow;
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowEditStart: GridEventListener<"rowEditStart"> = (params) => {
        const row = rows.find((slot) => slot.id === params.id);
        if (row) {
            originalTimestampsRef.current[params.id] = row.lastUpdated;
        }
    };

    const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            //prevents default behaviour of saving the edited state when clicking away from row being edited, force user to use save or cancel buttons
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => async () => {
        const row = rows.find((slot) => slot.id === id);
        if (row) {
            originalTimestampsRef.current[id] = row.lastUpdated;
        }
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.Edit },
        }));
    };

    const handleCancelClick = (id: GridRowId) => async () => {
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
        } else {
            await refreshRow(editedRow.id);
        }
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
                    handleEditClick(row.id)();
                    setRowModesModel((currentValue) => ({
                        ...currentValue,
                        [row.id]: { mode: GridRowModes.Edit },
                    }));
                    setSelectedRowForTimeSlotEdit(row);
                    setTimeSlotModalIsOpen(true);
                };
                return (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleEditCollectionCentreTimeSlot}
                        disabled={params.row.isNew || params.row.isDelivery}
                        aria-label={`Edit collection slots for ${params.row.name}`}
                    >
                        Edit Collection Slots
                    </Button>
                );
            },
        },
        {
            field: "collectionDays",
            type: "actions",
            headerName: "Collection Days",
            flex: 1,
            renderHeader: (params) => <Header {...params} />,
            renderCell: (params) => {
                const handleEditCollectionCentreAvailableDays = (): void => {
                    const row = params.row as CollectionCentresTableRow;
                    handleEditClick(row.id)();
                    setRowModesModel((currentValue) => ({
                        ...currentValue,
                        [row.id]: { mode: GridRowModes.Edit },
                    }));
                    setSelectedRowForAvailableDaysEdit(row);
                    setAvailableDaysModalIsOpen(true);
                };

                return (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleEditCollectionCentreAvailableDays}
                        disabled={params.row.isNew || params.row.isDelivery}
                        aria-label={`Edit available collection days for ${params.row.name}`}
                    >
                        Edit Collection Days
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
                    onProcessRowUpdateError={(error) => {
                        setErrorMessage(error.message);
                    }}
                    onRowModesModelChange={(newModel) => {
                        setRowModesModel(newModel);

                        const isEditing = Object.values(newModel).some(
                            (mode) => mode.mode === GridRowModes.Edit
                        );

                        if (!isEditing) {
                            setErrorMessage(null);
                        }
                    }}
                    onRowEditStart={handleRowEditStart}
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
                <CollectionCentreTimeSlotsModal
                    selectedCollectionCentreInfo={selectedRowForTimeSlotEdit}
                    isOpen={timeSlotModalIsOpen}
                    onClose={() => {
                        setTimeSlotModalIsOpen(false);
                    }}
                    onSave={async (payload: FormattedTimeSlotsWithPrimaryKey) => {
                        if (!selectedRowForTimeSlotEdit) {
                            return;
                        }
                        const mappedTimeSlots = payload.timeSlots.map((slot) => ({
                            time: slot.time
                                ? `${slot.time.length === 5 ? slot.time + ":00" : slot.time}`
                                : null,
                            is_active: slot.isActive ?? false,
                        }));

                        const updatedRow: CollectionCentresTableRow = {
                            ...selectedRowForTimeSlotEdit,
                            availability: selectedRowForTimeSlotEdit.availability.map((day) => ({
                                ...day,
                                timeSlots: mappedTimeSlots,
                            })),
                        };
                        setRows((prevRows) =>
                            prevRows.map((row) =>
                                row.id === updatedRow.id ? { ...row, ...updatedRow } : row
                            )
                        );
                    }}
                ></CollectionCentreTimeSlotsModal>
            )}
            {availableDaysModalIsOpen && (
                <CollectionCentreAvailableDaysModal
                    selectedCollectionCentreInfo={selectedRowForAvailableDaysEdit}
                    isOpen={availableDaysModalIsOpen}
                    onClose={() => {
                        setAvailableDaysModalIsOpen(false);
                    }}
                    onSave={async (payload: FormattedAvailableDaysWithPrimaryKey) => {
                        if (!selectedRowForAvailableDaysEdit) {
                            return;
                        }

                        const updatedRow: CollectionCentresTableRow = {
                            ...selectedRowForAvailableDaysEdit,
                            availableDays: payload.availableDays.map((availableDayObject) => ({
                                day: availableDayObject.day,
                                is_active: availableDayObject.isActive,
                            })),
                        };
                        setRows((prevRows) =>
                            prevRows.map((row) =>
                                row.id === updatedRow.id ? { ...row, ...updatedRow } : row
                            )
                        );
                    }}
                ></CollectionCentreAvailableDaysModal>
            )}
        </>
    );
};

export default CollectionCentresTable;
