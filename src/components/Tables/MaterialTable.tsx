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
    CheckboxConfig,
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
import { useTheme } from "styled-components";

type OnRowClickFunction<Data extends MRT_RowData> = (
    row: MRT_Row<Data>,
    event: React.MouseEvent<Element, MouseEvent>
) => void;

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
    // row selection
    checkboxConfig: CheckboxConfig<Data>;
    onRowClick?: OnRowClickFunction<Data>;

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
    paginationConfig,
    sortConfig,
    defaultSortConfig,
    onRowClick,
    checkboxConfig,
}: MRTTableProps<PaginationType, Data, DbData>): React.ReactElement => {
    const theme = useTheme();
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
        getRowId: (row, index) => `parcelRow-${index}-${pagination.pageIndex}`,
        state: { isLoading, columnVisibility, pagination, sorting },
        enableRowOrdering: enableRowOrdering,
        enableRowSelection: checkboxConfig.displayed,
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
        muiTableBodyRowProps: ({ row }) => ({
            onClick: (event) => onRowClick?.(row, event),
            sx: {
                cursor: "pointer",
                "&:hover > td": {
                    backgroundColor: `${theme.primary.background[1]}`,
                },
                ...(checkboxConfig.displayed &&
                    checkboxConfig.isRowChecked(row.original) && {
                        "& > td": {
                            backgroundColor: `${theme.primary.background[1]}`,
                        },
                    }),
            },
        }),
        muiSelectCheckboxProps: ({ row }) => ({
            inputProps: { "aria-label": `Select row ${row.id}` },
            checked: checkboxConfig.displayed
                ? checkboxConfig.isRowChecked(row.original)
                : undefined,
            onChange: checkboxConfig.displayed
                ? () => {
                      checkboxConfig.onCheckboxClicked(row.original);
                  }
                : undefined,
        }),
        muiSelectAllCheckboxProps: () => ({
            inputProps: { "aria-label": "Select all rows" },
            checked: checkboxConfig.displayed ? checkboxConfig.isAllCheckboxChecked : undefined,
            onChange: checkboxConfig.displayed
                ? () => {
                      checkboxConfig.onAllCheckboxClicked(checkboxConfig.isAllCheckboxChecked);
                  }
                : undefined,
        }),
        muiRowDragHandleProps: ({ table }) => ({
            onDragEnd: () => {
                const { draggingRow, hoveredRow } = table.getState();
                if (hoveredRow && draggingRow) {
                    const updatedData = [...data];

                    const movedRow = updatedData.splice(draggingRow.index, 1)[0];
                    updatedData.splice((hoveredRow as MRT_Row<Data>).index, 0, movedRow);
                    setData(updatedData);
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
