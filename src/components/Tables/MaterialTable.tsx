import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_PaginationState,
    MRT_Row,
    MRT_RowData,
    MRT_ShowHideColumnsButton,
    MRT_SortingState,
    useMaterialReactTable,
} from "material-react-table";
import { PaginationType as PaginationTypeEnum } from "@/components/Tables/Filters";
import React, { useEffect, useMemo, useState } from "react";
import {
    ColumnDisplayFunctions,
    DefaultSortConfig,
    PaginationConfig,
    SortConfig,
    TableHeaders,
} from "@/components/Tables/Table";
import { mapHeadersToMRTColumns } from "@/components/Tables/materialTable/materialTableMethods";
import { Box } from "@mui/material";
import { ClientSideSortMethod, ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { SortOrder } from "react-data-table-component";

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
    sortConfig: SortConfig<
        Data,
        PaginationType extends PaginationTypeEnum.Client
            ? ClientSideSortMethod
            : ServerSideSortMethod<DbData>
    >;
    defaultSortConfig?: DefaultSortConfig;

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
    paginationConfig,
    sortConfig,
    defaultSortConfig,
    onRowClick,
    onColumnFiltersChange,
}: MRTTableProps<PaginationType, Data, DbData>): React.ReactElement => {
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: paginationConfig.enablePagination
            ? paginationConfig.defaultRowsPerPage ?? 10
            : 10,
    });
    const headerKeys = useMemo(
        () => headerKeysAndLabels.map(([key]) => key),
        [headerKeysAndLabels]
    );
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(headerKeys.map((key) => [key, defaultShownHeaders.includes(key)]))
    );

    const columns = useMemo<MRT_ColumnDef<Data>[]>(
        () =>
            mapHeadersToMRTColumns(
                headerKeysAndLabels,
                toggleableHeaders,
                sortConfig.sortPossible ? sortConfig.sortableColumns : [],
                columnDisplayFunctions
            ),
        [columnDisplayFunctions, headerKeysAndLabels, sortConfig, toggleableHeaders]
    );

    useEffect(() => {
        if (paginationConfig.enablePagination) {
            paginationConfig.onPageChange?.(pagination.pageIndex);
            paginationConfig.onPerPageChange?.(pagination.pageSize);
        }
    }, [pagination, paginationConfig]);

    useEffect(() => {
        if (!sortConfig.sortPossible) {
            return;
        }

        if (sorting.length === 0) {
            sortConfig.setSortState({ sortEnabled: false });
            return;
        }

        const sortingItem = sorting[0];
        if (!sortingItem?.id) {
            return;
        }

        const column = sortConfig.sortableColumns.find(
            (col) => col.key.toString() === sortingItem.id
        );
        if (!column) {
            return;
        }

        const sortDirection = sortingItem.desc ? "desc" : "asc";

        sortConfig.setSortState({
            sortEnabled: true,
            column: column,
            sortDirection: sortDirection as SortOrder,
        });
    }, [sorting]);

    const table = useMaterialReactTable({
        columns,
        data: data,
        getRowId: (_row, index) => `parcelRow-${pagination.pageIndex}-${index}`,
        state: { isLoading: isLoading, columnVisibility, pagination, sorting },
        enableRowOrdering: enableRowOrdering,
        enableRowSelection: enableRowSelection,
        manualPagination: paginationConfig.enablePagination,
        manualSorting: sortConfig.sortPossible,
        muiPaginationProps: {
            rowsPerPageOptions: paginationConfig.enablePagination
                ? paginationConfig.rowsPerPageOptions
                : undefined,
        },
        rowCount: paginationConfig.enablePagination ? paginationConfig.filteredCount : undefined,
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
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
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
    <MaterialTable<PaginationTypeEnum.Client, Data, DbData> {...props} manualFiltering={false} />
);

// Server-side pagination/sorting/filtering
export const ServerPaginatedMaterialTable = <
    Data extends MRT_RowData,
    DbData extends Record<string, unknown>,
>(
    props: MRTTableProps<PaginationTypeEnum.Server, Data, DbData>
): React.ReactElement => (
    <MaterialTable<PaginationTypeEnum.Server, Data, DbData> {...props} manualFiltering />
);
