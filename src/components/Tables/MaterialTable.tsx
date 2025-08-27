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
import {
    DistributeClientFilter,
    DistributeServerFilter,
    PaginationType as PaginationTypeEnum,
} from "@/components/Tables/Filters";
import React, { useEffect, useMemo, useState } from "react";
import {
    CheckboxConfig,
    ColumnDisplayFunctions,
    ColumnStyles,
    DefaultSortConfig,
    FilterConfig,
    PaginationConfig,
    SortConfig,
    TableHeaders,
} from "@/components/Tables/Table";
import { mapHeadersToMRTColumns } from "@/components/Tables/materialTable/materialTableMethods";
import { Box } from "@mui/material";
import { ClientSideSortMethod, ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { SortOrder } from "react-data-table-component";
import styled, { useTheme } from "styled-components";
import TableFiltersBar from "@/components/Tables/TableFiltersBar";

const RelativeContainerForTable = styled.div`
    position: relative;
`;

type OnRowClickFunction<Data extends MRT_RowData> = (
    row: MRT_Row<Data>,
    event: React.MouseEvent<Element, MouseEvent>
) => void;

interface MRTTableProps<
    PaginationType,
    FilterState,
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
    checkboxConfig: CheckboxConfig<Data>;
    onRowClick?: OnRowClickFunction<Data>;
    enableRowOrdering?: boolean;
    paginationConfig: PaginationConfig;
    sortConfig: SortConfig<
        Data,
        PaginationType extends PaginationTypeEnum.Client
            ? ClientSideSortMethod
            : ServerSideSortMethod<DbData>
    >;
    defaultSortConfig?: DefaultSortConfig;
    filterConfig: FilterConfig<
        PaginationType extends PaginationTypeEnum.Client
            ? DistributeClientFilter<Data, FilterState>
            : DistributeServerFilter<Data, FilterState, DbData>
    >;
    columnStyleOptions?: ColumnStyles<Data>;
}

const MaterialTable = <
    PaginationType extends PaginationTypeEnum,
    FilterState,
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
    onRowClick,
    checkboxConfig,
    filterConfig,
}: MRTTableProps<PaginationType, FilterState, Data, DbData>): React.ReactElement => {
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
        Object.fromEntries(
            headerKeys.map((key) => [
                key,
                defaultShownHeaders.length > 0 ? defaultShownHeaders.includes(key) : true,
            ])
        )
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
        getRowId: (row, index) => `row-${index}-${pagination.pageIndex}`,
        state: { isLoading, columnVisibility, pagination, sorting },
        enableColumnFilters: false,
        enableColumnActions: false,
        enableRowOrdering: enableRowOrdering,
        enableRowSelection: checkboxConfig.displayed,
        muiPaginationProps: {
            rowsPerPageOptions: paginationConfig.enablePagination
                ? paginationConfig.rowsPerPageOptions
                : undefined,
        },
        manualPagination: paginationConfig.enablePagination,
        manualSorting: sortConfig.sortPossible,
        rowCount: paginationConfig.enablePagination ? paginationConfig.filteredCount : undefined,
        renderToolbarInternalActions: ({ table }) => (
            <Box>{toggleableHeaders.length > 0 && <MRT_ShowHideColumnsButton table={table} />}</Box>
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
                enableSorting: false,
            },
        },
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
    });

    return (
        <div aria-live="polite">
            {(filterConfig.primaryFiltersShown || filterConfig.additionalFiltersShown) && (
                <TableFiltersBar<
                    Data,
                    PaginationType extends PaginationTypeEnum.Client
                        ? DistributeClientFilter<Data, FilterState>
                        : DistributeServerFilter<Data, FilterState, DbData>,
                    FilterState
                >
                    setPrimaryFilters={
                        filterConfig.primaryFiltersShown
                            ? filterConfig.setPrimaryFilters
                            : undefined
                    }
                    primaryFilters={
                        filterConfig.primaryFiltersShown ? filterConfig.primaryFilters : undefined
                    }
                    additionalFilters={
                        filterConfig.additionalFiltersShown
                            ? filterConfig.additionalFilters
                            : undefined
                    }
                    setAdditionalFilters={
                        filterConfig.additionalFiltersShown
                            ? filterConfig.setAdditionalFilters
                            : undefined
                    }
                />
            )}
            <RelativeContainerForTable>
                <MaterialReactTable table={table} />
            </RelativeContainerForTable>
        </div>
    );
};

// Client-side pagination (default MRT mode)
export const ClientPaginatedMaterialTable = <
    Data extends MRT_RowData,
    DbData extends Record<string, unknown>,
    FilterState,
>(
    props: Omit<
        MRTTableProps<PaginationTypeEnum.Client, FilterState, Data, DbData>,
        "manualPagination" | "manualSorting" | "manualFiltering"
    >
): React.ReactElement => (
    <MaterialTable<PaginationTypeEnum.Client, FilterState, Data, DbData> {...props} />
);

// Server-side pagination/sorting/filtering
export const ServerPaginatedMaterialTable = <
    Data extends MRT_RowData,
    DbData extends Record<string, unknown>,
    FilterState,
>(
    props: MRTTableProps<PaginationTypeEnum.Server, FilterState, Data, DbData>
): React.ReactElement => (
    <MaterialTable<PaginationTypeEnum.Server, FilterState, Data, DbData> {...props} />
);
