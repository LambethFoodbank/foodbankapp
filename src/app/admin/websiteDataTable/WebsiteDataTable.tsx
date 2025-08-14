"use client";

import React, { useCallback, useEffect, useState } from "react";
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
    useGridApiRef,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { LinearProgress } from "@mui/material";
import { fetchWebsiteData, updateDbWebsiteData } from "./fetchWebsiteData";
import EditableTextAreaForDataGrid from "./EditableTextAreaForDataGrid";
import { logErrorReturnLogId } from "@/logger/logger";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import Header from "./Header";
import StyledDataGrid from "../common/StyledDataGrid";
import FloatingToast from "@/components/FloatingToast";

export interface WebsiteDataRow {
    dbName: string;
    readableName: string;
    id: string;
    value: string;
    lastUpdated: string;
}

const WebsiteDataTable: React.FC = () => {
    const [rows, setRows] = useState<GridRowsProp<WebsiteDataRow>>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const dataGridRef = useGridApiRef();
    const [lastEditedRowTimestamps, setLastEditedRowTimestamps] = useState<{
        [rowId: string]: string | undefined;
    }>({});
    const [blockedSaveRows, setBlockedSaveRows] = useState<Set<GridRowId>>(new Set());
    const [rowErrors, setRowErrors] = useState<{ [id: string]: string }>({});

    const fetchAndSetWebsiteData = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        const { data: websiteData, error: websiteDataError } = await fetchWebsiteData();
        if (websiteDataError) {
            setRows([]);
            switch (websiteDataError.type) {
                case "failedToFetchWebsiteData":
                    setErrorMessage(
                        `Failed to retrieve website data. Log ID ${websiteDataError.logId}`
                    );
                    break;
            }
        } else {
            setRows(websiteData);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        void fetchAndSetWebsiteData();
    }, [fetchAndSetWebsiteData]);

    useEffect(() => {
        // This requires that the DB table has Realtime turned on
        const subscriptionChannel = supabase
            .channel("website-data-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "website_data" },
                fetchAndSetWebsiteData
            )
            .subscribe((status, err) => {
                if (subscriptionStatusRequiresErrorMessage(status, err, "website_data")) {
                    setErrorMessage("Error fetching data, please reload");
                } else {
                    setErrorMessage(null);
                }
            });
        return () => {
            void supabase.removeChannel(subscriptionChannel);
        };
    }, [fetchAndSetWebsiteData]);

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.View },
        }));
    };

    const processRowUpdate = async (newRow: WebsiteDataRow): Promise<WebsiteDataRow> => {
        setIsLoading(true);

        const oldTimestamp = lastEditedRowTimestamps[newRow.id] ?? newRow.lastUpdated;

        const { error } = await updateDbWebsiteData(newRow, oldTimestamp);

        if (error) {
            let errorMessageTmp = "";
            switch (error.type) {
                case "failedToUpdateWebsiteData":
                    errorMessageTmp = `Failed to update website data. Log ID ${error.logId}`;
                    break;

                case "concurrentEditWebsiteData":
                    errorMessageTmp = `Record has been edited recently - please refresh the page. Log ID: ${error.logId}`;
                    setBlockedSaveRows((prev) => new Set(prev).add(newRow.id));
                    break;
            }

            setRowModesModel((prev) => ({
                ...prev,
                [newRow.id]: { mode: GridRowModes.Edit },
            }));

            setRowErrors((prev) => ({ ...prev, [newRow.id]: errorMessageTmp }));

            setErrorMessage(errorMessageTmp);

            setIsLoading(false);

            throw new Error("Failed to save row, keep in edit mode");
        }

        setErrorMessage(null);
        setIsLoading(false);

        setRowErrors((prev) => {
            const copy = { ...prev };
            delete copy[newRow.id];
            return copy;
        });

        setBlockedSaveRows((prev) => {
            const copyBlockedRows = new Set(prev);
            copyBlockedRows.delete(newRow.id);
            return copyBlockedRows;
        });

        return newRow;
    };

    const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
        if (
            params.reason === GridRowEditStopReasons.rowFocusOut ||
            params.reason === GridRowEditStopReasons.enterKeyDown
        ) {
            // prevents default behaviour of saving the edited state when clicking away from row being edited, force user to use save or cancel buttons
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.Edit },
        }));

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow === undefined) {
            {
                void logErrorReturnLogId(
                    "Edited row in website data admin table is undefined onEditClick"
                );
                setErrorMessage("Table error, please try again");
            }
        }
        setLastEditedRowTimestamps((prev) => ({ ...prev, [id]: editedRow?.lastUpdated }));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        }));

        setBlockedSaveRows((prev) => {
            const copyBlockedRows = new Set(prev);
            copyBlockedRows.delete(id);
            return copyBlockedRows;
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow === undefined) {
            {
                void logErrorReturnLogId(
                    "Edited row in website data admin table is undefined onCancelClick"
                );
                setErrorMessage("Table error, please try again");
            }
        }
    };

    const handleValueChange = (value: string, id: GridRowId, field: string): void => {
        dataGridRef.current.setEditCellValue({ id, field, value });
    };

    const websiteDataColumns: GridColDef<WebsiteDataRow>[] = [
        {
            field: "readableName",
            headerName: "Field",
            flex: 1,
            editable: false,
            renderHeader: (params) => <Header {...params} />,
        },
        {
            field: "value",
            headerName: "Value",
            flex: 3,
            editable: true,
            renderHeader: (params) => <Header {...params} />,
            renderCell: (params) => (
                <EditableTextAreaForDataGrid
                    {...params}
                    editMode={false}
                    value={params.row.value}
                    handleValueChange={handleValueChange}
                />
            ),
            renderEditCell: (params) => (
                <EditableTextAreaForDataGrid
                    {...params}
                    editMode={true}
                    value={params.row.value}
                    handleValueChange={handleValueChange}
                />
            ),
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
                const isBlocked = blockedSaveRows.has(id);
                const rowError = rowErrors[id];

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: "primary.main",
                            }}
                            onClick={() => {
                                if (isBlocked && rowError) {
                                    setErrorMessage(rowError);
                                } else {
                                    handleSaveClick(id)();
                                }
                            }}
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
                    columns={websiteDataColumns}
                    editMode="row"
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={setRowModesModel}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={processRowUpdate}
                    slots={{
                        loadingOverlay: LinearProgress,
                    }}
                    slotProps={{
                        toolbar: { setRows, setRowModesModel, rows },
                    }}
                    loading={isLoading}
                    getRowHeight={() => 150}
                    apiRef={dataGridRef}
                    getRowClassName={(params) =>
                        (params.indexRelativeToCurrentPage + 1) % 2 === 0
                            ? "datagrid-row-even"
                            : "datagrid-row-odd"
                    }
                    hideFooter
                    onCellDoubleClick={(params) => handleEditClick(params.id)()}
                />
            )}
        </>
    );
};

export default WebsiteDataTable;
