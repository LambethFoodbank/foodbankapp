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
    GridSortModel,
} from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    insertNewDeliveryAreas,
    fetchDeliveryAreas,
    deleteDbDeliveryAreas,
    DeliveryAreasRow,
} from "@/app/admin/deliveryAreasTable/DeliveryAreasActions";
import { logErrorReturnLogId } from "@/logger/logger";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import Header from "../websiteDataTable/Header";
import StyledDataGrid from "../common/StyledDataGrid";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import FloatingToast from "@/components/FloatingToast";
import { prefixPostcodeRegex } from "@/common/format";
import { EditToolbar } from "./DeliveryAreasToolbar";

const isValidPostcode = (value: string): boolean => prefixPostcodeRegex.test(value);

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
    const [sortModel, setSortModel] = React.useState<GridSortModel>([
        { field: "postcodeSortKey", sort: "asc" },
    ]);
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

    const processRowUpdate = async (row: DeliveryAreasRow): Promise<DeliveryAreasRow> => {
        setErrorMessage(null);
        setIsLoading(true);

        if (!isValidPostcode(row.postcode)) {
            let errorString = "";
            setIsLoading(false);
            if (row.postcode.length === 0) {
                errorString = "Please specify a delivery area.";
            } else if (row.postcode.includes(" ")) {
                errorString = "The specified delivery area contains whitespaces.";
            } else {
                errorString =
                    "Invalid postcode format. Please enter a valid UK prefix postcode (e.g. EC1A).";
            }
            throw new Error(errorString);
        }

        row.postcode = row.postcode.toUpperCase();
        const { data: createdDeliveryAreas, error: insertDeliveryAreasError } =
            await insertNewDeliveryAreas(row);
        const baseAuditLog = getBaseAuditLogForDeliveryAreasAction("add a delivery area", row);

        if (insertDeliveryAreasError) {
            setIsLoading(false);
            throw new Error("The specified delivery area already exists.");
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
        setErrorMessage(null);
        setRows((currentValue) => currentValue.filter((row) => row.id !== id));
    };

    const handleRemoveClick = (id: GridRowId) => () => {
        const row = rows.find((row) => row.id === id);
        if (row != undefined) {
            deleteDbDeliveryAreas(row).then(() =>
                setRows((oldRows) => oldRows.filter((row) => row.id !== id))
            );
        }
    };

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.View },
        }));
    };

    const handleSortModelChange = (newModel: GridSortModel): void => {
        if (newModel.length > 0 && newModel[0].field === "postcode") {
            setSortModel([
                { field: "postcodeSortKey", sort: sortModel[0].sort === "asc" ? "desc" : "asc" },
            ]);
        }
    };

    const deliveryAreasColumns: GridColDef[] = [
        {
            field: "postcode",
            headerName: "Postcode",
            headerAlign: "center",
            flex: 1,
            editable: true,
            sortable: true,
            align: "center",
            renderHeader: (params) => <Header {...params} />,
            disableColumnMenu: true,
        },
        {
            field: "postcodeSortKey",
            headerName: "Postcode Sort Key",
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
                    columns={deliveryAreasColumns}
                    initialState={{
                        columns: {
                            columnVisibilityModel: {
                                postcodeSortKey: false,
                            },
                        },
                    }}
                    sortModel={sortModel}
                    onSortModelChange={handleSortModelChange}
                    sortingOrder={["asc", "desc"]}
                    editMode="row"
                    onCellDoubleClick={(params, event) => {
                        event.defaultMuiPrevented = true;
                        return false;
                    }}
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={setRowModesModel}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={(error) => {
                        setErrorMessage(error.message);
                    }}
                    slots={{
                        toolbar: EditToolbar,
                    }}
                    slotProps={{
                        toolbar: {
                            setDeliveryAreasRows: setRows,
                            setDeliveryAreasRowModesModel: setRowModesModel,
                            deliveryAreasRows: rows,
                        },
                        loadingOverlay: {
                            variant: "linear-progress",
                        },
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
