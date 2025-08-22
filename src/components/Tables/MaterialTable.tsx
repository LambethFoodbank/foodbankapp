import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_Row,
    MRT_RowData,
    MRT_ShowHideColumnsButton,
    useMaterialReactTable,
} from "material-react-table";
import { PaginationType as PaginationTypeEnum } from "@/components/Tables/Filters";
import React, { useMemo, useState } from "react";
import { ColumnDisplayFunctions, PaginationConfig, TableHeaders } from "@/components/Tables/Table";
import { mapHeadersToMRTColumns } from "@/components/Tables/materialTable/materialTableMethods";
import { Box } from "@mui/material";

interface MRTTableProps<
    PaginationType,
    Data extends MRT_RowData,
    DbData extends Record<string, unknown>,
> {
    data: Data[];
    setData: React.Dispatch<React.SetStateAction<Data[]>>;
    headerKeysAndLabels: TableHeaders<Data>;
    columnDisplayFunctions?: ColumnDisplayFunctions<Data>;
    defaultShownHeaders?: readonly (keyof Data)[];
    toggleableHeaders?: readonly (keyof Data | string)[];
    isLoading?: boolean;
    onRowClick?: (row: Data) => void;
    // row selection
    enableRowSelection?: boolean;

    // row ordering
    enableRowOrdering?: boolean;

    // pagination
    paginationConfig: PaginationConfig;

    // sorting
    manualSorting?: boolean;
    onSortingChange?: (updater: any) => void;

    // filtering
    manualFiltering?: boolean;
    onColumnFiltersChange?: (updater: any) => void;
}

const MaterialTable = <
    PaginationType extends PaginationTypeEnum,
    Data extends MRT_RowData,
    DbData extends Record<string, unknown> = Record<string, never>,
>({
    data,
    setData,
    headerKeysAndLabels,
    defaultShownHeaders = [],
    columnDisplayFunctions,
    toggleableHeaders = [],
    isLoading = false,
    enableRowOrdering = false,
    enableRowSelection = false,
    onRowClick,
    enablePagination = true,
    manualPagination,
    rowCount,
    onPaginationChange,
    manualSorting,
    onSortingChange,
    manualFiltering,
    onColumnFiltersChange,
}: MRTTableProps<PaginationType, Data, DbData>): React.ReactElement => {
    const headerKeys = useMemo(
        () => headerKeysAndLabels.map(([key]) => key),
        [headerKeysAndLabels]
    );
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(headerKeys.map((key) => [key, defaultShownHeaders.includes(key)]))
    );

    const toggleableHeadersAndLabels = headerKeysAndLabels.filter(([key]) =>
        toggleableHeaders.includes(key)
    );

    const columns = useMemo<MRT_ColumnDef<Data>[]>(
        () =>
            mapHeadersToMRTColumns(
                toggleableHeadersAndLabels,
                columnVisibility,
                columnDisplayFunctions
            ),
        [columnDisplayFunctions, columnVisibility, toggleableHeadersAndLabels]
    );

    const table = useMaterialReactTable({
        columns,
        data: data as unknown as Data[],
        state: { isLoading: isLoading, columnVisibility },
        enableRowOrdering: enableRowOrdering,
        enableRowSelection: enableRowSelection,
        renderToolbarInternalActions: ({ table }) => (
            <Box>
                <MRT_ShowHideColumnsButton table={table} />
            </Box>
        ),
        muiRowDragHandleProps: ({ table }) => ({
            onDragEnd: () => {
                const { draggingRow, hoveredRow } = table.getState();
                if (hoveredRow && draggingRow) {
                    data.splice(
                        (hoveredRow as MRT_Row<Data>).index,
                        0,
                        data.splice(draggingRow.index, 1)[0]
                    );
                    setData([...data]);
                }
            },
        }),
        displayColumnDefOptions: {
            "mrt-row-drag": {
                header: "",
                size: 0,
                enableColumnActions: false,
                enableSorting: false,
            },
        },
        onColumnVisibilityChange: setColumnVisibility,
    });

    return <MaterialReactTable table={table} />;
};

// Client-side pagination (default MRT mode)
export const ClientPaginatedMaterialTable = <
    Data extends MRT_RowData,
    DbData extends Record<string, unknown>,
>(
    props: Omit<
        MRTTableProps<PaginationTypeEnum.Client, Data, DbData>,
        "manualPagination" | "manualSorting" | "manualFiltering"
    >
): React.ReactElement => (
    <MaterialTable<PaginationTypeEnum.Client, Data, DbData>
        {...props}
        manualSorting={false}
        manualFiltering={false}
    />
);

// Server-side pagination/sorting/filtering
export const ServerPaginatedMaterialTable = <
    Data extends MRT_RowData,
    DbData extends Record<string, unknown>,
>(
    props: MRTTableProps<PaginationTypeEnum.Server, Data, DbData>
): React.ReactElement => (
    <MaterialTable<PaginationTypeEnum.Server, Data, DbData>
        {...props}
        manualSorting
        manualFiltering
    />
);
