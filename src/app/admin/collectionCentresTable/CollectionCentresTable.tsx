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
        if (errorMessage) {
            return;
        }
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
        const originalLastUpdated = originalTimestampsRef.current[newRow.id];
        const rowWithOriginal = {
            ...newRow,
            originalLastUpdated,
        };
        const { error: updateCollectionCentreError } =
            await updateDbCollectionCentre(rowWithOriginal);
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

        try {
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
                    let message = `Failed to update the collection centre. Log ID: ${updateCollectionCentreError.logId}`;

                    if (updateCollectionCentreError.type === "ConcurrentEditCollectionCentre") {
                        message =
                            "This packing slot was modified by someone else.\n" +
                            `Log ID: ${updateCollectionCentreError.logId}`;
                    }
                    setErrorMessage(message);
                    throw new Error("Update failed");
                }
            }
            return newRow;
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            //prevents default behaviour of saving the edited state when clicking away from row being edited, force user to use save or cancel buttons
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => () => {
        const row = rows.find((slot) => slot.id === id);
        if (row) {
            originalTimestampsRef.current[id] = row.lastUpdated;
        }
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
                    setSelectedRowForTimeSlotEdit(params.row as CollectionCentresTableRow);
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
                        console.error("Error while updating row:", error);
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
                ></CollectionCentreTimeSlotsModal>
            )}
        </>
    );
};

export default CollectionCentresTable;
