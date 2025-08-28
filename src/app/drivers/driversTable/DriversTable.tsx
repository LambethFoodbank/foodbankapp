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
    GridPaginationModel,
} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    insertNewDrivers,
    fetchDrivers,
    deleteDbDrivers,
    updateDbDrivers,
} from "@/app/drivers/driversTable/DriversActions";
import { LinearProgress } from "@mui/material";
import { logErrorReturnLogId } from "@/logger/logger";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import Header from "@/app/admin/websiteDataTable/Header";
import StyledDataGrid from "@/app/admin/common/StyledDataGrid";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import FloatingToast from "@/components/FloatingToast";
import EditIcon from "@mui/icons-material/Edit";
import TableSurface from "@/components/Tables/TableSurface";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
    rows: DriversRow[];
    setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
}

export interface DriversRow {
    id: string;
    circuitID: string | null;
    name: string;
    isNew: boolean;
    lastUpdated: string;
}

export interface DriverRowWithOriginalLastUpdated extends DriversRow {
    originalLastUpdated: string;
}

function EditToolbar(props: EditToolbarProps): React.JSX.Element {
    const { setRows, setRowModesModel, rows, setPaginationModel } = props;

    const handleClick = (): void => {
        const id = rows.length + 1;
        setRows((oldRows) => [...oldRows, { id, name: "", circuitID: "", isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: "name", editable: true },
        }));
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add new driver
            </Button>
        </GridToolbarContainer>
    );
}

function getBaseAuditLogForDriversAction(
    action: string,
    DriversRow: DriversRow
): Pick<AuditLog, "action" | "content" | "driversId"> {
    return {
        action,
        content: {
            driversName: DriversRow.name,
            driversCircuitID: DriversRow.circuitID,
            driversLastUpdated: DriversRow.lastUpdated,
        },
        driversId: DriversRow.id,
    };
}

const DriversTable: React.FC = () => {
    const [rows, setRows] = useState<DriversRow[]>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const originalTimestampsRef = React.useRef<Record<string, string>>({});
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 10,
        page: 0,
    });

    useEffect(() => {
        setErrorMessage(null);
        fetchDrivers()
            .then((response) => setRows(response))
            .catch((error) => {
                void logErrorReturnLogId("Error with fetch: Drivers", error);
                setErrorMessage("Error fetching data, please reload");
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        // This requires that the DB table has Realtime turned on
        const subscriptionChannel = supabase
            .channel("drivers-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "drivers" },
                async () => {
                    setErrorMessage(null);
                    try {
                        const drivers = await fetchDrivers();
                        setRows((prevRows) => {
                            const unsavedLocalRows = prevRows.filter((row) => row.isNew);
                            return [
                                ...drivers,
                                ...unsavedLocalRows.filter(
                                    (localRow) => !drivers.some((dbRow) => dbRow.id === localRow.id)
                                ),
                            ];
                        });
                    } catch (error) {
                        setRows([]);
                        if (error instanceof Error) {
                            void logErrorReturnLogId(
                                "Error with fetch: Drivers subscription",
                                {},
                                error
                            );
                            setErrorMessage("Error fetching data, please reload");
                        }
                    }
                }
            )
            .subscribe(async (status, error) => {
                if (subscriptionStatusRequiresErrorMessage(status, error, "drivers")) {
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

    const processRowUpdate = async (row: DriversRow): Promise<DriversRow> => {
        setErrorMessage(null);
        setIsLoading(true);

        const originalLastUpdated = originalTimestampsRef.current[row.id];
        const rowWithOriginal = {
            ...row,
            originalLastUpdated,
        };

        try {
            if (row.isNew) {
                const sorted = [
                    ...rows.filter((rowToBeCompared) => rowToBeCompared.id !== row.id),
                    row,
                ].sort((first, second) => {
                    const newFirst = first.name ?? "";
                    const newSecond = second.name ?? "";
                    return newFirst.localeCompare(newSecond);
                });
                const targetIndex = sorted.findIndex(
                    (rowToBeCompared) => rowToBeCompared.id === row.id
                );
                if (targetIndex >= 0 && paginationModel.pageSize > 0) {
                    const targetPage = Math.floor(targetIndex / paginationModel.pageSize);
                    setPaginationModel((prev) => ({ ...prev, page: targetPage }));
                }
                const { data: createdDrivers, error: insertDriversError } =
                    await insertNewDrivers(row);
                const baseAuditLog = getBaseAuditLogForDriversAction("add a driver", row);

                if (insertDriversError) {
                    setErrorMessage(`Failed to add driver. Log ID: ${insertDriversError.logId}`);
                    setRows((prevRows) => prevRows.filter((prevRow) => prevRow.id !== row.id));
                    void sendAuditLog({
                        ...baseAuditLog,
                        wasSuccess: false,
                        logId: insertDriversError.logId,
                    });
                    throw new Error("Insert failed");
                } else {
                    setRows((prevRows) => prevRows.filter((prevRow) => prevRow.id !== row.id));
                    setRowModesModel((prev) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [String(row.id)]: removed, ...rest } = prev;
                        return rest;
                    });
                    void sendAuditLog({
                        ...baseAuditLog,
                        driversId: createdDrivers.driversId,
                        wasSuccess: true,
                    });
                }
            } else {
                const { error: updateDriverError } = await updateDbDrivers(rowWithOriginal);

                const baseAuditLog = getBaseAuditLogForDriversAction("update a driver", row);

                if (updateDriverError) {
                    let message = `Failed to update the packing slot. Log ID: ${updateDriverError.logId}`;

                    if (updateDriverError.type === "ConcurrentEditDrivers") {
                        message = "Record has been edited recently - please refresh the page.";
                    }

                    setErrorMessage(message);

                    void sendAuditLog({
                        ...baseAuditLog,
                        wasSuccess: false,
                        logId: updateDriverError.logId,
                    });

                    throw new Error(message);
                } else {
                    void sendAuditLog({
                        ...baseAuditLog,
                        wasSuccess: true,
                    });
                }
            }

            return { ...row, isNew: false };
        } finally {
            setIsLoading(false);
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
            deleteDbDrivers(editedRow).then(() =>
                setRows((oldRows) => oldRows.filter((row) => row.id !== id))
            );
            const baseAuditLog = getBaseAuditLogForDriversAction("delete a driver", editedRow);
            void sendAuditLog({
                ...baseAuditLog,
                driversId: editedRow.id,
                wasSuccess: true,
            });
        }
    };

    const driversColumns: GridColDef[] = [
        {
            field: "name",
            headerName: "Driver Name",
            headerAlign: "center",
            flex: 1,
            editable: true,
            align: "center",
            valueParser: (value) => value,
            renderHeader: (params) => <Header {...params} />,
            disableColumnMenu: true,
        },
        {
            field: "circuitID",
            headerName: "Circuit ID",
            headerAlign: "center",
            flex: 1,
            editable: true,
            align: "center",
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
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                        key="Edit"
                    />,
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
                <TableSurface>
                    <StyledDataGrid
                        rows={rows}
                        aria-label="Delivery Areas Table"
                        initialState={{
                            sorting: {
                                sortModel: [{ field: "name", sort: "asc" }],
                            },
                        }}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        sortingOrder={["asc", "desc"]}
                        columns={driversColumns}
                        editMode="row"
                        onCellDoubleClick={(params, event) => {
                            event.defaultMuiPrevented = true;
                            return false;
                        }}
                        rowModesModel={rowModesModel}
                        onRowModesModelChange={setRowModesModel}
                        onRowEditStart={handleRowEditStart}
                        onRowEditStop={handleRowEditStop}
                        processRowUpdate={processRowUpdate}
                        slots={{
                            toolbar: EditToolbar,
                            loadingOverlay: LinearProgress,
                        }}
                        slotProps={{
                            toolbar: { setRows, setRowModesModel, rows, setPaginationModel },
                        }}
                        loading={isLoading}
                        getRowClassName={(params) =>
                            (params.indexRelativeToCurrentPage + 1) % 2 === 0
                                ? "datagrid-row-even"
                                : "datagrid-row-odd"
                        }
                        rowSelection={false}
                    />
                </TableSurface>
            )}
        </>
    );
};

export default DriversTable;
