"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useMemo, useState } from "react";
import { useLocalStorage } from "@/app/batch-create/useLocalStorage";
import { BatchTableDataState } from "@/app/batch-create/types";
import batchParcelsReducer from "@/app/batch-create/batchParcelsReducer";
import { tableStateToBatchDisplayRows } from "@/app/batch-create/helpers/displayHelpers";
import { getEmptyBatchEditData, getEmptyOverrideData } from "@/app/batch-create/emptyData";
import { DefaultTheme, useTheme } from "styled-components";
import getCenteredBatchGridDisplayColumns from "@/app/batch-create/getCenteredBatchGridDisplayColumns";
import ActionButtons from "@/app/batch-create/ActionButtons";

export interface BatchGridDisplayRow {
    [key: string]: string | number | null;
    id: number;
    fullName: string;
    phoneNumber: string;
    address: string;
    adults: number | null;
    children: number | null;
    listType: string;
    dietaryRequirements: string;
    babyProducts: string;
    petFood: string;
    otherItems: string;
    deliveryInstructions: string;
    extraInformation: string;
    attentionFlag: string;
    signpostingCall: string;
    notes: string;
    voucherNumber: string;
    packingDate: string;
    packingSlot: string;
    shippingMethod: string;
    collectionInfo: string;
}

export const defaultTableState: BatchTableDataState = {
    overrideDataRow: {
        data: getEmptyOverrideData(),
    },
    batchDataRows: [
        {
            id: 1,
            clientId: null,
            data: getEmptyBatchEditData(),
        },
    ],
    clientOverrides: [],
    parcelOverrides: [],
};

const BatchParcelDataGrid: React.FC = () => {
    const [tableState, dispatch] = useLocalStorage(batchParcelsReducer, defaultTableState);

    const displayRows = useMemo(() => {
        return tableStateToBatchDisplayRows(tableState);
    }, [tableState]);

    const theme: DefaultTheme = useTheme();
    const [isRowCollection, setIsRowCollection] = useState<{ [key: number]: boolean }>({});
    const centeredBatchGridDisplayColumns: GridColDef[] = getCenteredBatchGridDisplayColumns(
        tableState,
        dispatch,
        isRowCollection,
        setIsRowCollection
    );

    return (
        <>
            <DataGrid
                rows={displayRows}
                columns={centeredBatchGridDisplayColumns}
                // only dispatches if a validated string field is updated
                processRowUpdate={(newRow: BatchGridDisplayRow, oldRow: BatchGridDisplayRow) => {
                    if (newRow.fullName !== oldRow.fullName) {
                        dispatch({
                            type: "update_cell",
                            updateCellPayload: {
                                rowId: newRow.id,
                                newValueAndFieldName: {
                                    type: "client",
                                    newValue: newRow.fullName,
                                    fieldName: "fullName",
                                },
                            },
                        });
                    }
                    if (newRow.voucherNumber !== oldRow.voucherNumber) {
                        dispatch({
                            type: "update_cell",
                            updateCellPayload: {
                                rowId: newRow.id,
                                newValueAndFieldName: {
                                    type: "parcel",
                                    newValue: newRow.voucherNumber,
                                    fieldName: "voucherNumber",
                                },
                            },
                        });
                    }
                    return newRow;
                }}
                // using sx rather than styled-components as otherwise throws an error when iterating through columns
                sx={{
                    "& .MuiDataGrid-cell": {
                        border: "1px solid",
                        borderColor: `${theme.main.border}`,
                        "& .MuiInputBase-root": {
                            height: "100%",
                        },
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        borderBottom: "3px solid",
                        borderTop: "2px solid",
                        borderColor: `${theme.main.border}`,
                    },
                    "& .MuiDataGrid-columnHeader": {
                        borderLeft: "1px solid",
                        borderRight: "1px solid",
                        borderColor: `${theme.main.border}`,
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                        fontWeight: "bold",
                    },
                    "& .Mui-error": {
                        backgroundColor: `${theme.error}`,
                        color: `${theme.text}`,
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        overflowY: "scroll",
                    },
                    border: "1px solid",
                    borderColor: `${theme.main.border}`,
                    margin: "1rem",
                    maxHeight: "80vh",
                }}
                hideFooter
            />
            <ActionButtons tableState={tableState} dispatch={dispatch} />
        </>
    );
};

export default BatchParcelDataGrid;
