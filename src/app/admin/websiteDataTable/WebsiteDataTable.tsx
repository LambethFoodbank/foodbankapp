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
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import Header from "./Header";
import StyledDataGrid from "../common/StyledDataGrid";

export interface WebsiteDataRow {
    dbName: string;
    readableName: string;
    id: string;
    value: string;
}

const WebsiteDataTable: React.FC = () => {
    const [rows, setRows] = useState<GridRowsProp<WebsiteDataRow>>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const dataGridRef = useGridApiRef();

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
                subscriptionStatusRequiresErrorMessage(status, err, "website_data") &&
                    setErrorMessage("Error fetching data, please reload");
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
        setErrorMessage(null);
        setIsLoading(true);

        const { error } = await updateDbWebsiteData(newRow);

        if (error) {
            switch (error.type) {
                case "failedToUpdateWebsiteData":
                    setErrorMessage(`Failed to update website data. Log ID ${error.logId}`);
                    break;
            }
        }

        setIsLoading(false);
        return newRow;
    };

    const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
        if (
            params.reason === GridRowEditStopReasons.rowFocusOut ||
            params.reason === GridRowEditStopReasons.enterKeyDown
        ) {
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
            {errorMessage && <ErrorSecondaryText>{errorMessage}</ErrorSecondaryText>}
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
                />
            )}
        </>
    );
};

export default WebsiteDataTable;
