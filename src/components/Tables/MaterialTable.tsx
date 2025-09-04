import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_PaginationState,
    MRT_Row,
    MRT_RowData,
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
    BreakPointConfig,
    CheckboxConfig,
    ColumnDisplayFunctions,
    ColumnStyles,
    DefaultSortConfig,
    EditableConfig,
    FilterConfig,
    PaginationConfig,
    SortConfig,
    TableHeaders,
    ToggleableColumnGroup,
} from "@/components/Tables/materialTable/tableTypes";
import { mapHeadersToMRTColumns } from "@/components/Tables/materialTable/materialTableMethods";
import { Box, IconButton } from "@mui/material";
import { ClientSideSortMethod, ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { SortOrder } from "react-data-table-component";
import { useTheme } from "styled-components";
import TableFiltersBar from "@/components/Tables/TableFiltersBar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getDividingLineStyleOptions } from "@/app/parcels/parcelsTable/conditionalStyling";
import ColumnTogglePopup from "@/components/Tables/ColumnTogglePopup";
import {
    ColumnSelectorContainer,
    defaultColumnStyleOptions,
    displayColumnDefOptions,
    EditAndReorderArrowDiv,
    muiTableBodyCellProps,
    muiTableBodyProps,
    muiTableHeadCellProps,
    muiTablePaperProps,
    muiTableProps,
    RelativeContainerForTable,
} from "@/components/Tables/materialTable/tableStyles";

type OnRowClickFunction<Data extends MRT_RowData> = (
    row: MRT_Row<Data>,
    event: React.MouseEvent<Element, MouseEvent>
) => void;

type OnRowReorderFunction<Data extends MRT_RowData> = (row1: Data, row2: Data) => Promise<void>;

interface MRTTableProps<
    PaginationType,
    FilterState,
    Data extends MRT_RowData,
    DbData extends Record<string, unknown>,
> {
    data: Data[];
    setData?: React.Dispatch<React.SetStateAction<Data[]>>;
    headerKeysAndLabels: TableHeaders<Data>;
    testId?: string;
    columnDisplayFunctions?: ColumnDisplayFunctions<Data>;
    defaultShownHeaders?: readonly (keyof Data)[];
    toggleableHeaders?: readonly (keyof Data | string)[];
    toggleableColumnGroups?: ToggleableColumnGroup[];
    isLoading?: boolean;
    checkboxConfig: CheckboxConfig<Data>;
    onRowClick?: OnRowClickFunction<Data>;
    enableRowOrdering?: boolean;
    onRowReorder?: OnRowReorderFunction<Data>;
    manualPagination: boolean;
    paginationConfig: PaginationConfig;
    manualSorting: boolean;
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
    rowActionsConfig: EditableConfig<Data>;
    columnStyleOptions?: ColumnStyles<Data>;
    rowBreakPointConfigs?: BreakPointConfig[];
}

const MaterialTable = <
    PaginationType extends PaginationTypeEnum,
    FilterState,
    Data extends MRT_RowData,
    DbData extends Record<string, unknown> = Record<string, never>,
>({
    data,
    headerKeysAndLabels,
    testId = undefined,
    defaultShownHeaders = [],
    columnDisplayFunctions,
    toggleableHeaders = [],
    toggleableColumnGroups = [],
    isLoading = false,
    enableRowOrdering = false,
    onRowReorder,
    paginationConfig,
    sortConfig,
    onRowClick,
    checkboxConfig,
    filterConfig,
    rowActionsConfig,
    columnStyleOptions = defaultColumnStyleOptions as ColumnStyles<Data>,
    manualPagination,
    manualSorting,
    rowBreakPointConfigs,
}: MRTTableProps<PaginationType, FilterState, Data, DbData>): React.ReactElement => {
    const theme = useTheme();
    const dividingLineStyleOptions = getDividingLineStyleOptions(theme);
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
                sortConfig.sortPossible ? sortConfig.sortableColumns : [],
                columnDisplayFunctions,
                columnStyleOptions
            ),
        [columnDisplayFunctions, columnStyleOptions, headerKeysAndLabels, sortConfig]
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
        manualPagination: manualPagination,
        manualSorting: manualSorting,
        enableRowOrdering: enableRowOrdering,
        enableRowSelection: checkboxConfig.displayed,
        enableSorting: sortConfig.sortPossible,
        enablePagination: paginationConfig.enablePagination,
        muiPaginationProps: {
            rowsPerPageOptions: paginationConfig.enablePagination
                ? paginationConfig.rowsPerPageOptions
                : undefined,
        },
        rowCount: paginationConfig.enablePagination ? paginationConfig.filteredCount : undefined,
        renderToolbarInternalActions: () => <Box></Box>,
        enableRowActions: rowActionsConfig.editable,
        positionActionsColumn: "first",
        renderRowActions: ({ row }) =>
            rowActionsConfig.editable && (
                <EditAndReorderArrowDiv>
                    {rowActionsConfig.onEdit && (
                        <IconButton
                            onClick={() => rowActionsConfig.onEdit?.(row.index)}
                            aria-label="edit"
                            data-testid={`button-edit-row-${row.index}`}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                    {rowActionsConfig.onDelete &&
                        (rowActionsConfig.isDeletable
                            ? rowActionsConfig.isDeletable(row.original)
                            : true) && (
                            <IconButton
                                onClick={() => {
                                    if (rowActionsConfig.onDelete) {
                                        rowActionsConfig.onDelete(row.index);
                                    }
                                }}
                                aria-label="delete"
                                data-testid={`button-delete-row-${row.index}`}
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                </EditAndReorderArrowDiv>
            ),
        muiTablePaperProps: muiTablePaperProps,
        muiTableProps: muiTableProps,
        muiTableHeadCellProps: muiTableHeadCellProps(theme),
        muiTableBodyProps: muiTableBodyProps(theme),
        muiTableBodyRowProps: ({ row }) => {
            const rowIndex = row.index;

            const dividingConfig = rowBreakPointConfigs?.find((config) =>
                config.breakPoints.includes(rowIndex)
            );

            let borderStyle = {};
            if (dividingConfig) {
                const style = dividingLineStyleOptions[dividingConfig.dividingLineStyle];
                borderStyle = {
                    borderTop: `${style.thickness} solid ${style.colour}`,
                };
            }

            return {
                onClick: (event) => onRowClick?.(row, event),
                sx: {
                    cursor: "pointer",
                    "&.MuiTableRow-root:hover > td": {
                        backgroundColor: `${theme.primary.background[1]}`,
                    },
                    ...(checkboxConfig.displayed &&
                        checkboxConfig.isRowChecked(row.original) && {
                            "&.MuiTableRow-root > td": {
                                backgroundColor: `${theme.primary.background[1]} !important`,
                            },
                        }),
                    ...borderStyle,
                },
            };
        },
        muiTableBodyCellProps: muiTableBodyCellProps,
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
                    const draggingRowData = draggingRow.original;
                    const hoveredRowData = hoveredRow.original;

                    if (hoveredRowData) {
                        onRowReorder?.(draggingRowData, hoveredRowData).then();
                    }
                }
            },
        }),
        displayColumnDefOptions: displayColumnDefOptions,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
    });

    return (
        <div aria-live="polite" data-testid={testId}>
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
                {toggleableHeaders.length > 0 && (
                    <ColumnSelectorContainer>
                        <ColumnTogglePopup
                            toggleableHeaders={toggleableHeaders}
                            headers={headerKeysAndLabels}
                            columnVisibility={columnVisibility}
                            setColumnVisibility={setColumnVisibility}
                            toggleableColumnGroups={toggleableColumnGroups}
                        />
                    </ColumnSelectorContainer>
                )}
                <MaterialReactTable table={table} />
            </RelativeContainerForTable>
        </div>
    );
};

// Client-side pagination (default MRT mode)
export const ClientPaginatedMaterialTable = <Data extends MRT_RowData, FilterState>(
    props: Omit<
        MRTTableProps<PaginationTypeEnum.Client, FilterState, Data, Record<string, never>>,
        "manualPagination" | "manualSorting"
    >
): React.ReactElement => (
    <MaterialTable<PaginationTypeEnum.Client, FilterState, Data>
        {...props}
        manualPagination={false}
        manualSorting={false}
    />
);

// Server-side pagination/sorting/filtering
export const ServerPaginatedMaterialTable = <
    Data extends MRT_RowData,
    DbData extends Record<string, unknown>,
    FilterState,
>(
    props: Omit<
        MRTTableProps<PaginationTypeEnum.Server, FilterState, Data, DbData>,
        "manualPagination" | "manualSorting"
    >
): React.ReactElement => (
    <MaterialTable<PaginationTypeEnum.Server, FilterState, Data, DbData>
        {...props}
        manualPagination={true}
        manualSorting={true}
    />
);
