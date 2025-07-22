"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/supabaseClient";
import {
    GridActionsCellItem,
    GridColDef,
    GridEventListener,
    GridRemoveIcon,
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
import DeleteIcon from "@mui/icons-material/Delete";
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
import { Delete } from "@mui/icons-material";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
    rows: DeliveryAreasRow[];
}

export interface DeliveryAreasRow {
    id: string;
    postcode: string;
    isDeliverable: boolean;
    isNew: boolean;
}

const formatPostcode = (value: string): string => {
    value = value.toUpperCase().slice(0, 4);
    if (!value.charAt(0).match(/[A-Z]/)) {
        value = value.slice(0, 0);
    }
    return value;
};

function EditToolbar(props: EditToolbarProps): React.JSX.Element {
    const { setRows, setRowModesModel, rows } = props;

    const handleClick = (): void => {
        const id = rows.length + 1;
        setRows((oldRows) => [...oldRows, { id, postcode: "", isNew: true }]);
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
            deliveryAreasPostcode: deliveryAreasRow.postcode,
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
                void logErrorReturnLogId("Error with fetch: Delivery areas", error);
                setErrorMessage("Error fetching data, please reload");
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        // This requires that the DB table has Realtime turned on
        const subscriptionChannel = supabase
            .channel("delivery-areas-table-changes")
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
                                "Error with fetch: Delivery areas subscription",
                                {},
                                error
                            );
                        }
                    }
                }
            )
            .subscribe(async (status, error) => {
                if (subscriptionStatusRequiresErrorMessage(status, error, "delivery_areas")) {
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
                "add a new delivery area",
                newRow,
                { excludeDeliveryAreasId: true }
            );

            if (insertDeliveryAreasError) {
                setErrorMessage(
                    `Failed to add the delivery area. Log ID: ${insertDeliveryAreasError.logId}`
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
                "update a delivery area",
                newRow
            );

            if (updateDeliveryAreasError) {
                setErrorMessage(
                    `Failed to update the delivery area. Log ID: ${updateDeliveryAreasError.logId}`
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

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        }));

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow === undefined) {
            void logErrorReturnLogId(
                "Edited row in delivery areas admin table is undefined onCancelClick"
            );
            setErrorMessage("Table error, please try again");
        } else if (editedRow.isNew) {
            setRows((currentValue) => currentValue.filter((row) => row.id !== id));
        }
    };

    const handleRemoveClick = (id: GridRowId) => () => {
        setRows((oldRows) => oldRows.filter((row) => row.id !== id));
    };

    const deliveryAreassColumns: GridColDef[] = [
        {
            field: "postcode",
            headerName: "Postcode",
            headerAlign: "center",
            flex: 1,
            editable: true,
            align: "center",
            valueParser: (params) => {
                return formatPostcode(params);
            },
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
                        icon={<DeleteIcon />}
                        label="Remove"
                        className="textPrimary"
                        onClick={handleRemoveClick(id)}
                        color="inherit"
                        key="Remove"
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
                    initialState={{
                        sorting: {
                            sortModel: [{ field: "postcode", sort: "asc" }],
                        },
                    }}
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
