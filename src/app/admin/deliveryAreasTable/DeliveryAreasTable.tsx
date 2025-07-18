"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/supabaseClient";
import {
    GridActionsCellItem,
    GridColDef,
    GridEventListener,
    GridRowEditStopReasons,
    GridRowId,
    GridRowModes,
    GridRowModesModel,
    GridRowsProp,
    GridToolbarContainer,
} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import {
    insertNewDeliveryAreas,
    fetchDeliveryAreas,
    swapRows,
    updateDbDeliveryAreas,
} from "@/app/admin/deliveryAreasTable/DeliveryAreasActions";
import { LinearProgress } from "@mui/material";
import { logErrorReturnLogId } from "@/logger/logger";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import Header from "../websiteDataTable/Header";
import StyledDataGrid from "../common/StyledDataGrid";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import FloatingToast from "@/components/FloatingToast";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
    rows: DeliveryAreasRow[];
}

export interface DeliveryAreasRow {
    id: string;
    postcode: string;
    isDeliverable: boolean;
    order: number;
    isNew: boolean;
}

function EditToolbar(props: EditToolbarProps): React.JSX.Element {
    const { setRows, setRowModesModel, rows } = props;

    const handleClick = (): void => {
        const id = rows.length + 1;
        setRows((oldRows) => [
            ...oldRows,
            { id, name: "", isShown: false, order: id, isNew: true },
        ]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add new area
            </Button>
        </GridToolbarContainer>
    );
}

function getBaseAuditLogForDeliveryAreasAction(
    action: string,
    deliveryAreasRow: DeliveryAreasRow,
    options?: {
        excludeDeliveryAreasId?: boolean;
    }
): Pick<AuditLog, "action" | "content" | "deliveryAreasId"> {
    return {
        action,
        content: {
            currentDeliveryAreasOrder: deliveryAreasRow.order,
            deliveryAreasName: deliveryAreasRow.name,
            deliveryAreasIsShown: deliveryAreasRow.isShown,
        },
        deliveryAreasId: options?.excludeDeliveryAreasId ? undefined : deliveryAreasRow.id,
    };
}

const DeliveryAreasTable: React.FC = () => {
    const [rows, setRows] = useState<DeliveryAreasRow[]>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setErrorMessage(null);
        fetchDeliveryAreas()
            .then((response) => setRows(response))
            .catch((error) => {
                void logErrorReturnLogId("Error with fetch: Packing slots", error);
                setErrorMessage("Error fetching data, please reload");
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        // This requires that the DB table has Realtime turned on
        const subscriptionChannel = supabase
            .channel("packing-slot-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "delivery_areas" },
                async () => {
                    setErrorMessage(null);
                    try {
                        const deliveryAreas = await fetchDeliveryAreas();
                        setRows(deliveryAreas);
                    } catch (error) {
                        setRows([]);
                        setErrorMessage("Error fetching data, please reload");
                        if (error instanceof Error) {
                            void logErrorReturnLogId(
                                "Error with fetch: Packing slots subscription",
                                {},
                                error
                            );
                        }
                    }
                }
            )
            .subscribe(async (status, error) => {
                if (subscriptionStatusRequiresErrorMessage(status, error, "packing_slots")) {
                    setErrorMessage("Error fetching data, please reload");
                } else {
                    setErrorMessage(null);
                }
            });

        return () => {
            void supabase.removeChannel(subscriptionChannel);
        };
    }, []);

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.View },
        }));
    };

    const processRowUpdate = async (newRow: DeliveryAreasRow): Promise<DeliveryAreasRow> => {
        setErrorMessage(null);
        setIsLoading(true);

        if (newRow.isNew) {
            const { data: createdDeliveryAreas, error: insertDeliveryAreasError } =
                await insertNewDeliveryAreas(newRow);
            const baseAuditLog = getBaseAuditLogForDeliveryAreasAction(
                "add a new packing slot",
                newRow,
                { excludeDeliveryAreasId: true }
            );

            if (insertDeliveryAreasError) {
                setErrorMessage(
                    `Failed to add the packing slot. Log ID: ${insertDeliveryAreasError.logId}`
                );
                setRows((rows) => rows.slice(0, -1));
                void sendAuditLog({
                    ...baseAuditLog,
                    wasSuccess: false,
                    logId: insertDeliveryAreasError.logId,
                });
            } else {
                void sendAuditLog({
                    ...baseAuditLog,
                    deliveryAreasId: createdDeliveryAreas.deliveryAreasId,
                    wasSuccess: true,
                });
            }
        } else {
            const { error: updateDeliveryAreasError } = await updateDbDeliveryAreas(newRow);
            const baseAuditLog = getBaseAuditLogForDeliveryAreasAction(
                "update a packing slot",
                newRow
            );

            if (updateDeliveryAreasError) {
                setErrorMessage(
                    `Failed to update the packing slot. Log ID: ${updateDeliveryAreasError.logId}`
                );
                void sendAuditLog({
                    ...baseAuditLog,
                    wasSuccess: false,
                    logId: updateDeliveryAreasError.logId,
                });
            } else {
                void sendAuditLog({ ...baseAuditLog, wasSuccess: true });
            }
        }

        setIsLoading(false);

        return newRow;
    };

    const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            //prevents default behaviour of saving the edited state when clicking away from row being edited, force user to use save or cancel buttons
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => () => {
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
            void logErrorReturnLogId(
                "Edited row in packing slots admin table is undefined onCancelClick"
            );
            setErrorMessage("Table error, please try again");
        } else if (editedRow.isNew) {
            setRows((currentValue) => currentValue.filter((row) => row.id !== id));
        }
    };

    const handleUpClick = (id: GridRowId, row: DeliveryAreasRow) => async () => {
        const rowIndex = row.order - 1;
        if (rowIndex > 0) {
            setIsLoading(true);

            const rowOne = rows[rowIndex];
            const rowTwo = rows[rowIndex - 1];
            const { error: swapRowsError } = await swapRows(rowOne, rowTwo);

            const baseAuditLog = getBaseAuditLogForDeliveryAreasAction(
                "move a packing slot up",
                row
            );

            if (swapRowsError) {
                setErrorMessage(
                    `Failed to move packing slot (${row.name}) up. Log ID: ${swapRowsError.logId}`
                );
                void sendAuditLog({
                    ...baseAuditLog,
                    wasSuccess: false,
                    logId: swapRowsError.logId,
                });
            } else {
                void sendAuditLog({ ...baseAuditLog, wasSuccess: true });
            }

            setIsLoading(false);
        }
    };

    const handleDownClick = (id: GridRowId, row: DeliveryAreasRow) => async () => {
        const rowIndex = row.order - 1;
        if (rowIndex < rows.length - 1) {
            setIsLoading(true);

            const clickedRow = rows[rowIndex];
            const rowBelow = rows[rowIndex + 1];
            const { error: swapRowsError } = await swapRows(clickedRow, rowBelow);

            const baseAuditLog = getBaseAuditLogForDeliveryAreasAction(
                "move a packing slot down",
                row
            );

            if (swapRowsError) {
                setErrorMessage(
                    `Failed to move packing slot (${row.name}) down. Log ID: ${swapRowsError.logId}`
                );
                void sendAuditLog({
                    ...baseAuditLog,
                    wasSuccess: false,
                    logId: swapRowsError.logId,
                });
            } else {
                void sendAuditLog({ ...baseAuditLog, wasSuccess: true });
            }

            setIsLoading(false);
        }
    };

    const deliveryAreassColumns: GridColDef[] = [
        {
            field: "order",
            type: "actions",
            headerName: "Order",
            width: 100,
            cellClassName: "actions",
            renderHeader: (params) => <Header {...params} />,
            getActions: ({ id, row }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [];
                }

                if (row.order === 1) {
                    return [
                        <GridActionsCellItem
                            icon={<ArrowCircleDownIcon />}
                            label="Down"
                            onClick={handleDownClick(id, row)}
                            color="inherit"
                            key="Down"
                        />,
                    ];
                }

                if (rows && row.order === rows.length) {
                    return [
                        <GridActionsCellItem
                            icon={<ArrowCircleUpIcon />}
                            label="Up"
                            className="textPrimary"
                            onClick={handleUpClick(id, row)}
                            color="inherit"
                            key="Up"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<ArrowCircleUpIcon />}
                        label="Up"
                        className="textPrimary"
                        onClick={handleUpClick(id, row)}
                        color="inherit"
                        key="Up"
                    />,
                    <GridActionsCellItem
                        icon={<ArrowCircleDownIcon />}
                        label="Down"
                        onClick={handleDownClick(id, row)}
                        color="inherit"
                        key="Down"
                    />,
                ];
            },
        },
        {
            field: "name",
            headerName: "Slot Name",
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
                    columns={deliveryAreassColumns}
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
        </>
    );
};

export default DeliveryAreasTable;
