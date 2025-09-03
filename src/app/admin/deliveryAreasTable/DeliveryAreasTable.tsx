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
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    insertNewDeliveryAreas,
    fetchDeliveryAreas,
    deleteDbDeliveryAreas,
} from "@/app/admin/deliveryAreasTable/DeliveryAreasActions";
import { LinearProgress } from "@mui/material";
import { logErrorReturnLogId } from "@/logger/logger";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import Header from "../websiteDataTable/Header";
import StyledDataGrid from "../common/StyledDataGrid";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import FloatingToast from "@/components/FloatingToast";
import { prefixPostcodeRegex } from "@/common/format";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
    rows: DeliveryAreasRow[];
}

export interface DeliveryAreasRow {
    id: string;
    postcode: string;
    isNew: boolean;
}

const isValidPostcode = (value: string): boolean => prefixPostcodeRegex.test(value);

function EditToolbar(props: EditToolbarProps): React.JSX.Element {
    const { setRows, setRowModesModel } = props;
    // The id was initialized as `number of rows+1`, which raised some issues and now it is generated randomly below
    const handleClick = (): void => {
        const id = `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setRows((oldRows) => [...oldRows, { id, postcode: "", isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: "postcode", editable: true },
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
    deliveryAreasRow: DeliveryAreasRow
): Pick<AuditLog, "action" | "content" | "deliveryAreasId"> {
    return {
        action,
        content: {
            deliveryAreasPostcode: deliveryAreasRow.postcode,
        },
        deliveryAreasId: deliveryAreasRow.isNew ? undefined : deliveryAreasRow.id,
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
                        setRows((prevRows) => {
                            const unsavedLocalRows = prevRows.filter((row) => row.isNew);
                            return [
                                ...deliveryAreas,
                                ...unsavedLocalRows.filter(
                                    (localRow) =>
                                        !deliveryAreas.some((dbRow) => dbRow.id === localRow.id)
                                ),
                            ];
                        });
                    } catch (error) {
                        setRows([]);
                        if (error instanceof Error) {
                            void logErrorReturnLogId(
                                "Error with fetch: Delivery areas subscription",
                                {},
                                error
                            );
                            setErrorMessage("Error fetching data, please reload");
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

    const processRowUpdate = async (row: DeliveryAreasRow): Promise<DeliveryAreasRow> => {
        setErrorMessage(null);
        setIsLoading(true);

        if (!isValidPostcode(row.postcode)) {
            setIsLoading(false);
            if (row.postcode.length === 0) {
                setErrorMessage("Please specify a delivery area.");
            } else if (row.postcode.includes(" ")) {
                setErrorMessage("The specified delivery area contains whitespaces.");
            } else {
                setErrorMessage(
                    "Invalid postcode format. Please enter a valid UK prefix postcode (e.g. EC1A)."
                );
            }
            throw new Error("Invalid postcode format");
        }

        row.postcode = row.postcode.toUpperCase();

        if (row.isNew) {
            const { data: createdDeliveryAreas, error: insertDeliveryAreasError } =
                await insertNewDeliveryAreas(row);
            const baseAuditLog = getBaseAuditLogForDeliveryAreasAction(
                "add a new delivery area",
                row
            );

            if (insertDeliveryAreasError) {
                setErrorMessage(
                    `The specified delivery area already exists. Log ID: ${insertDeliveryAreasError.logId}`
                );
                setRows((prevRows) => prevRows.filter((prevRow) => prevRow.id !== row.id));
                void sendAuditLog({
                    ...baseAuditLog,
                    wasSuccess: false,
                    logId: insertDeliveryAreasError.logId,
                });
            } else {
                setRows((prevRows) => prevRows.filter((prevRow) => prevRow.id !== row.id));
                setRowModesModel((prev) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [String(row.id)]: removed, ...rest } = prev;
                    return rest;
                });
                void sendAuditLog({
                    ...baseAuditLog,
                    deliveryAreasId: createdDeliveryAreas.deliveryAreasId,
                    wasSuccess: true,
                });
            }
        }

        setIsLoading(false);
        return row;
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
        const editedRow = rows.find((row) => row.id === id);
        if (editedRow != undefined) {
            deleteDbDeliveryAreas(editedRow).then(() =>
                setRows((oldRows) => oldRows.filter((row) => row.id !== id))
            );
        }
    };

    const deliveryAreasColumns: GridColDef[] = [
        {
            field: "postcode",
            headerName: "Postcode",
            headerAlign: "center",
            flex: 1,
            editable: true,
            align: "center",
            valueParser: (value) => value,
            renderHeader: (params) => <Header {...params} />,
            disableColumnMenu: true,
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
                    aria-label="Delivery Areas Table"
                    initialState={{
                        sorting: {
                            sortModel: [{ field: "postcode", sort: "asc" }],
                        },
                    }}
                    sortingOrder={["asc", "desc"]}
                    columns={deliveryAreasColumns}
                    editMode="row"
                    onCellDoubleClick={(params, event) => {
                        event.defaultMuiPrevented = true;
                        return false;
                    }}
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
