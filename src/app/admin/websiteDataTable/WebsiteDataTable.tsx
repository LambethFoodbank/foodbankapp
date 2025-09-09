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
import { getReadableWebsiteDataName } from "@/common/format";

export interface WebsiteDataRow {
    dbName: string;
    readableName: string;
    id: string;
    value: string;
    lastUpdated: string;
}

const WebsiteDataTable: React.FC = () => {
    const [rows, setRows] = useState<WebsiteDataRow[]>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const dataGridRef = useGridApiRef();
    const originalTimestampsRef = React.useRef<Record<string, string>>({});
    const [blockedSaveRows, setBlockedSaveRows] = useState<Set<GridRowId>>(new Set());
    const [rowErrors, setRowErrors] = useState<{ [id: string]: string }>({});

    const fetchAndSetWebsiteData = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        const { data: websiteData, error: websiteDataError } = await fetchWebsiteData();

        if (websiteDataError) {
            const message = `Failed to retrieve website data. Log ID: ${websiteDataError.logId}`;
            setErrorMessage(message);
            setRows([]);
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

    const refreshRow = async (id: string): Promise<WebsiteDataRow | null> => {
        const { data: latestData, error } = await supabase
            .from("website_data")
            .select("*")
            .eq("name", id)
            .single();

        if (error || !latestData) {
            const logId = await logErrorReturnLogId(
                `Failed to refresh row ${id}: ${error?.message}`
            );
            setErrorMessage(`Failed to refresh data. Log ID: ${logId}`);
            return null;
        }

        const refreshedRow: WebsiteDataRow = {
            id: latestData.name,
            dbName: latestData.name,
            readableName: getReadableWebsiteDataName(latestData.name),
            value: latestData.value,
            lastUpdated: latestData.last_updated,
        };

        setRows((prevRows) => prevRows.map((row) => (row.id === id ? refreshedRow : row)));

        return refreshedRow;
    };

    const processRowUpdate = async (newRow: WebsiteDataRow): Promise<WebsiteDataRow> => {
        setErrorMessage(null);
        setIsLoading(true);

        try {
            const { error } = await updateDbWebsiteData(
                newRow,
                originalTimestampsRef.current[newRow.id]
            );

            if (error) {
                let message = `Failed to update website data. Log ID: ${error.logId}`;

                if (error.type === "concurrentEditWebsiteData") {
                    message = "Record has been edited recently - please refresh the page. ";
                    setBlockedSaveRows((prev) => new Set(prev).add(newRow.id));
                }

                setRowErrors((prev) => ({ ...prev, [newRow.id]: message }));
                setErrorMessage(message);
                throw new Error(message);
            }

            // Clear any previous errors for this row
            setRowErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[newRow.id];
                return newErrors;
            });

            setBlockedSaveRows((prev) => {
                const newSet = new Set(prev);
                newSet.delete(newRow.id);
                return newSet;
            });

            return newRow;
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowEditStart: GridEventListener<"rowEditStart"> = (params) => {
        const row = rows.find((editedRow) => editedRow.id === params.id);
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
        const row = rows.find((editedRow) => editedRow.id === id);
        if (row) {
            originalTimestampsRef.current[id] = row.lastUpdated;
        }
        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.Edit },
        }));
    };

    const handleCancelClick = (id: GridRowId) => async () => {
        setRowErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
        });

        setBlockedSaveRows((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });

        setRowModesModel((currentValue) => ({
            ...currentValue,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        }));

        await refreshRow(id.toString());
        setErrorMessage(null);
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
                    onRowEditStart={handleRowEditStart}
                    onRowEditStop={handleRowEditStop}
                    onProcessRowUpdateError={(error) => {
                        setErrorMessage(error.message);
                    }}
                    onCellDoubleClick={(params, event) => {
                        event.defaultMuiPrevented = true;
                        handleEditClick(params.id)();
                    }}
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
                />
            )}
        </>
    );
};

export default WebsiteDataTable;
