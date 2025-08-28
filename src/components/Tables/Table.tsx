"use client";

import {
    DistributeClientFilter,
    DistributeServerFilter,
    PaginationType as PaginationTypeEnum,
} from "@/components/Tables/Filters";
import TableFiltersBar from "@/components/Tables/TableFiltersBar";
import {
    faAnglesDown,
    faAnglesUp,
    faPenToSquare,
    faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { StyledIcon, StyledIconButton } from "../Icons/IconButton";
import { Checkbox, CircularProgress, NoSsr } from "@mui/material";
import React, { useState } from "react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import styled, { useTheme } from "styled-components";
import { Primitive, SortOrder } from "react-data-table-component/dist/DataTable/types";
import { Centerer } from "../Modal/ModalFormStyles";
import { ClientSideSortMethod, ServerSideSortMethod } from "./sortMethods";
import {
    DividingLineStyleOptions,
    getDividingLineStyleOptions,
} from "@/app/parcels/parcelsTable/conditionalStyling";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { Database } from "@/databaseTypesFile";
import ColumnTogglePopup from "./ColumnTogglePopup";
import { MRT_Row, MRT_RowData } from "material-react-table";

export type TableHeaders<Data> = readonly (readonly [keyof Data, string])[];

export interface Row<Data> {
    rowId: number;
    data: Data;
}

export type ColumnDisplayFunction<T> = (data: T) => React.ReactNode;
export type ColumnDisplayFunctions<Data> = {
    [headerKey in keyof Data]?: ColumnDisplayFunction<Data[headerKey]>;
};

export type ColumnStyles<Data> = {
    [headerKey in keyof Data]?: ColumnStyleOptions;
};

export type OnRowClickFunction<Data extends MRT_RowData> = (
    row: MRT_Row<Data>,
    event: React.MouseEvent<Element, MouseEvent>
) => void;

export type ColumnStyleOptions = Omit<
    TableColumn<unknown>,
    "name" | "selector" | "sortable" | "sortFunction" | "cell"
>;

export type GenericSortMethod = (
    sortDirection: SortOrder,
    query: PostgrestFilterBuilder<Database["public"], Record<string, unknown>, unknown>
) => void;

export interface SortOptions<Data, SortMethod extends GenericSortMethod> {
    key: keyof Data;
    sortMethod: SortMethod;
}

export type SortState<Data, SortMethod extends GenericSortMethod> =
    | {
          sortEnabled: true;
          sortDirection: SortOrder;
          column: CustomColumn<Data, SortMethod>;
      }
    | {
          sortEnabled: false;
      };

export type SortConfig<Data, SortMethod extends GenericSortMethod> =
    | {
          sortPossible: true;
          sortableColumns: SortOptions<Data, SortMethod>[];
          setSortState: (sortState: SortState<Data, SortMethod>) => void;
      }
    | { sortPossible: false };

export interface DefaultSortConfig {
    defaultColumnHeaderKey: string;
    defaultSortDirection: SortOrder;
}

interface CustomColumn<Data, SortMethod extends GenericSortMethod> extends TableColumn<Row<Data>> {
    sortMethod?: SortMethod;
    headerKey?: keyof Data;
}

export type CheckboxConfig<Data> =
    | {
          displayed: true;
          selectedRowIds: string[];
          isAllCheckboxChecked: boolean;
          onCheckboxClicked: (row: Data) => void;
          onAllCheckboxClicked: (isAllCheckboxChecked: boolean) => void;
          isRowChecked: (data: Data) => boolean;
      }
    | {
          displayed: false;
      };

export type PaginationConfig =
    | {
          enablePagination: true;
          filteredCount: number;
          onPageChange: (newPage: number) => void;
          onPerPageChange: (perPage: number) => void;
          rowsPerPageOptions?: number[];
          defaultRowsPerPage?: number;
      }
    | {
          enablePagination: false;
      };

export type FilterConfig<Filter> =
    | {
          primaryFiltersShown: false;
          additionalFiltersShown: false;
      }
    | {
          primaryFiltersShown: true;
          primaryFilters: Filter[];
          setPrimaryFilters: (primaryFilters: Filter[]) => void;
          additionalFiltersShown: false;
      }
    | {
          primaryFiltersShown: true;
          primaryFilters: Filter[];
          setPrimaryFilters: (primaryFilters: Filter[]) => void;
          additionalFiltersShown: true;
          additionalFilters: Filter[];
          setAdditionalFilters: (additionalFilters: Filter[]) => void;
      };

export type EditableConfig<Data> =
    | {
          editable: true;
          setDataPortion?: (dataPortion: Data[]) => void;
          onEdit?: (data: number) => void;
          onDelete?: (data: number) => void;
          onSwapRows?: (row1: Data, row2: Data) => Promise<void>;
          isDeletable?: (row: Data) => boolean;
      }
    | { editable: false };

export type BreakPointConfig = {
    name: string;
    breakPoints: number[];
    dividingLineStyle: keyof DividingLineStyleOptions;
};

interface Props<Data, DbData extends Record<string, unknown>, PaginationType, FilterState> {
    dataPortion: Data[];
    headerKeysAndLabels: TableHeaders<Data>;
    testId?: string;
    isLoading?: boolean;
    checkboxConfig: CheckboxConfig<Data>;
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
    rowBreakPointConfigs?: BreakPointConfig[];
    defaultShownHeaders?: readonly (keyof Data)[];
    toggleableHeaders?: readonly (keyof Data | string)[];
    columnDisplayFunctions?: ColumnDisplayFunctions<Data>;
    columnStyleOptions?: ColumnStyles<Data>;
    editableConfig: EditableConfig<Data>;
    onRowClick?: OnRowClickFunction<Data>;
    pointerOnHover?: boolean;
    customStyles?: TableStyles;
}

interface CellProps<Data> {
    row: Row<Data>;
    columnDisplayFunctions: ColumnDisplayFunctions<Data>;
    headerKey: keyof Data;
}

const CustomCell = <Data,>({
    row,
    columnDisplayFunctions,
    headerKey,
}: CellProps<Data>): React.ReactElement => {
    const element: unknown = (
        <>
            {columnDisplayFunctions[headerKey]
                ? columnDisplayFunctions[headerKey]?.(row.data[headerKey])
                : row.data[headerKey]}
        </>
    );

    if (!React.isValidElement(element)) {
        throw new Error(
            `${element} is not a valid JSX element, add a column display function for ${String(
                headerKey
            )}`
        );
    }

    return element;
};

const defaultColumnStyleOptions = {
    grow: 1,
    minWidth: "2rem",
    maxWidth: "20rem",
} as const;

const Table = <
    Data,
    PaginationType extends PaginationTypeEnum,
    FilterState,
    DbData extends Record<string, unknown> = Record<string, never>,
>({
    dataPortion,
    headerKeysAndLabels,
    testId = undefined,
    isLoading = false,
    defaultShownHeaders,
    toggleableHeaders = [],
    onRowClick,
    columnDisplayFunctions = {},
    columnStyleOptions = {},
    checkboxConfig,
    sortConfig,
    defaultSortConfig,
    rowBreakPointConfigs,
    filterConfig,
    paginationConfig,
    editableConfig,
    pointerOnHover,
    customStyles,
}: Props<Data, DbData, PaginationType, FilterState>): React.ReactElement => {
    const [shownHeaderKeys, setShownHeaderKeys] = useState(
        defaultShownHeaders ?? headerKeysAndLabels.map(([key]) => key)
    );

    const shownHeaders = headerKeysAndLabels.filter(([key]) => shownHeaderKeys.includes(key));

    const theme = useTheme();

    const columns: CustomColumn<
        Data,
        PaginationType extends PaginationTypeEnum.Client
            ? ClientSideSortMethod
            : ServerSideSortMethod<DbData>
    >[] = shownHeaders.map(([headerKey, headerName]) => {
        const columnStyles = Object.assign(
            { ...defaultColumnStyleOptions },
            columnStyleOptions[headerKey] ?? {}
        );
        let sortMethod:
            | (PaginationType extends PaginationTypeEnum.Client
                  ? ClientSideSortMethod
                  : ServerSideSortMethod<DbData>)
            | undefined;
        if (sortConfig.sortPossible) {
            sortMethod = sortConfig.sortableColumns.find(
                (column) => column.key === headerKey
            )?.sortMethod;
        }
        const sortable = !!sortMethod;

        return {
            name: <>{headerName}</>,
            selector: (row) => row.data[headerKey] as Primitive, // The type cast here is needed as the type of selector is (row) => Primitive, but as we are using a custom cell, we can have it be anything
            sortable: sortable,
            cell: (row) => (
                <CustomCell
                    row={row}
                    columnDisplayFunctions={columnDisplayFunctions}
                    headerKey={headerKey}
                />
            ),
            sortField: headerKey.toString(),
            id: defaultSortConfig ? headerKey.toString() : undefined,
            headerKey: headerKey,
            sortMethod: sortMethod,
            ...columnStyles,
        };
    });

    const handleSort = async (
        column: CustomColumn<
            Data,
            PaginationType extends PaginationTypeEnum.Client
                ? ClientSideSortMethod
                : ServerSideSortMethod<DbData>
        >,
        sortDirection: SortOrder
    ): Promise<void> => {
        if (sortConfig.sortPossible && Object.keys(column).length) {
            sortConfig.setSortState({
                sortEnabled: true,
                column: column,
                sortDirection: sortDirection,
            });
        }
    };

    const [isSwapping, setIsSwapping] = useState(false);

    if (editableConfig.editable) {
        const swapRows = (rowIndex1: number, upwards: boolean): void => {
            if (isSwapping) {
                return;
            }
            setIsSwapping(true);

            const rowIndex2 = rowIndex1 + (upwards ? -1 : 1);

            if (
                rowIndex1 < 0 ||
                rowIndex2 < 0 ||
                rowIndex1 >= dataPortion.length ||
                rowIndex2 >= dataPortion.length
            ) {
                setIsSwapping(false);
                return;
            }

            const clientSideRefresh = (): void => {
                // Update viewed table data once specific functions are done (without re-fetch)
                const newData = [...dataPortion];
                const temp = newData[rowIndex1];
                newData[rowIndex1] = newData[rowIndex2];
                newData[rowIndex2] = temp;

                editableConfig.setDataPortion(newData);
                setIsSwapping(false);
            };

            if (editableConfig.onSwapRows) {
                editableConfig
                    .onSwapRows(dataPortion[rowIndex1], dataPortion[rowIndex2])
                    .then(clientSideRefresh);
            } else {
                clientSideRefresh();
            }
        };
        columns.unshift({
            name: "",
            cell: (row: Row<Data>) => {
                const isRowDeletable = editableConfig.isDeletable
                    ? editableConfig.isDeletable(row.data)
                    : true;
                return (
                    <EditAndReorderArrowDiv>
                        {editableConfig.onSwapRows && (
                            <StyledIconButton
                                onClick={() => swapRows(row.rowId, true)}
                                aria-label="reorder row upwards"
                                disabled={isSwapping}
                                data-testid={`button-move-row-up-${row.rowId}`}
                            >
                                <StyledIcon icon={faAnglesUp} />
                            </StyledIconButton>
                        )}
                        {editableConfig.onEdit && (
                            <StyledIconButton
                                onClick={() => editableConfig.onEdit?.(row.rowId)}
                                aria-label="edit"
                                data-testid={`button-edit-row-${row.rowId}`}
                            >
                                <StyledIcon icon={faPenToSquare} />
                            </StyledIconButton>
                        )}
                        {editableConfig.onSwapRows && (
                            <StyledIconButton
                                onClick={() => swapRows(row.rowId, false)}
                                aria-label="reorder row downwards"
                                disabled={isSwapping}
                                data-testid={`button-move-row-down-${row.rowId}`}
                            >
                                <StyledIcon icon={faAnglesDown} />
                            </StyledIconButton>
                        )}
                        {editableConfig.onDelete && isRowDeletable && (
                            <StyledIconButton
                                onClick={() => {
                                    if (editableConfig.onDelete) {
                                        editableConfig.onDelete(row.rowId);
                                    }
                                }}
                                aria-label="delete"
                                data-testid={`button-delete-row-${row.rowId}`}
                            >
                                <StyledIcon icon={faTrashAlt} />
                            </StyledIconButton>
                        )}
                    </EditAndReorderArrowDiv>
                );
            },
            width: "5rem",
        });
    }

    if (checkboxConfig.displayed) {
        columns.unshift({
            name: (
                <Checkbox
                    inputProps={{ "aria-label": "Select all rows" }}
                    checked={checkboxConfig.isAllCheckboxChecked}
                    onChange={() =>
                        checkboxConfig.onAllCheckboxClicked(checkboxConfig.isAllCheckboxChecked)
                    }
                />
            ),
            cell: (row: Row<Data>) => (
                <Checkbox
                    inputProps={{ "aria-label": `Select row ${row.rowId}` }}
                    checked={checkboxConfig.isRowChecked(row.data)}
                    onChange={() => checkboxConfig.onCheckboxClicked(row.data)}
                    sx={{
                        "&.MuiButtonBase-root": { position: "absolute" },
                    }}
                />
            ),
            width: "47px",
            ignoreRowClick: true,
        });
    }

    const rows = dataPortion.map((data, index) => ({ rowId: index, data }));

    const conditionalRowStyles = [
        {
            when: (row: Row<Data>) =>
                checkboxConfig.displayed && checkboxConfig.isRowChecked(row.data),
            style: {
                backgroundColor: `${theme.primary.background[1]} !important`,
            },
        },
    ];

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
                            shownHeaderKeys={shownHeaderKeys}
                            setShownHeaderKeys={setShownHeaderKeys}
                            headers={headerKeysAndLabels}
                        />
                    </ColumnSelectorContainer>
                )}

                <TableStyling
                    $rowBreakPointConfigs={rowBreakPointConfigs ?? []}
                    $dividingLineStyleOptions={getDividingLineStyleOptions(theme)}
                >
                    <NoSsr>
                        <DataTable
                            customStyles={customStyles}
                            columns={columns}
                            data={rows}
                            keyField="rowId"
                            pagination={paginationConfig.enablePagination}
                            persistTableHead
                            onRowClicked={onRowClick}
                            paginationServer={paginationConfig.enablePagination}
                            paginationTotalRows={
                                paginationConfig.enablePagination
                                    ? paginationConfig.filteredCount
                                    : undefined
                            }
                            paginationPerPage={
                                paginationConfig.enablePagination
                                    ? paginationConfig.defaultRowsPerPage
                                    : undefined
                            }
                            paginationRowsPerPageOptions={
                                paginationConfig.enablePagination
                                    ? paginationConfig.rowsPerPageOptions
                                    : undefined
                            }
                            paginationDefaultPage={
                                paginationConfig.enablePagination ? 1 : undefined
                            }
                            onChangePage={
                                paginationConfig.enablePagination
                                    ? paginationConfig.onPageChange
                                    : () => undefined
                            }
                            onChangeRowsPerPage={
                                paginationConfig.enablePagination
                                    ? paginationConfig.onPerPageChange
                                    : () => undefined
                            }
                            sortServer={sortConfig.sortPossible}
                            onSort={handleSort}
                            defaultSortFieldId={defaultSortConfig?.defaultColumnHeaderKey}
                            progressComponent={
                                <Centerer role="rowgroup">
                                    <CircularProgress
                                        role="row"
                                        aria-label="table-progress-bar"
                                        aria-busy={true}
                                    />
                                </Centerer>
                            }
                            progressPending={isLoading}
                            pointerOnHover={pointerOnHover}
                            conditionalRowStyles={conditionalRowStyles}
                            striped
                        />
                    </NoSsr>
                </TableStyling>
            </RelativeContainerForTable>
        </div>
    );
};

const EditAndReorderArrowDiv = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
    // this transform is necessary to make the buttons visually consistent with the rest of the table without redesigning the layout
    transform: translateX(-1.2rem);
`;

const RelativeContainerForTable = styled.div`
    position: relative;
`;

const ColumnSelectorContainer = styled.div`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 900;
`;

const TableStyling = styled.div<{
    $rowBreakPointConfigs: BreakPointConfig[];
    $dividingLineStyleOptions: DividingLineStyleOptions;
}>`
    // the component with the filter bars

    & > header {
        background-color: transparent;
        padding: 0;
    }

    // the entire table component including the header and the pagination bar

    & > div {
        border-radius: 1rem;
        background-color: transparent;

        :focus {
            border: 2px solid ${(props) => props.theme.main.foreground[0]};
            border-radius: 9px;
        }

        // the pagination bar

        > nav {
            background-color: transparent;
            color: ${(props) => props.theme.main.foreground[0]};
            border: none;
            margin-top: 0.5em;
            font-size: 1rem;

            & option {
                color: ${(props) => props.theme.main.foreground[0]};
                background-color: ${(props) => props.theme.main.background[0]};
            }
        }
    }

    // the icons in the pagination bar

    & svg {
        fill: ${(props) => props.theme.main.lighterForeground[0]};
    }

    // formatting all direct children to adhere to the theme

    & > div {
        background-color: ${(props) => props.theme.main.background[0]};
        color: ${(props) => props.theme.main.foreground[0]};
        border-color: ${(props) => props.theme.main.border};
    }

    // the filter bars

    & input[type="text"] {
        color: ${(props) => props.theme.main.lighterForeground[1]};
        background-color: ${(props) => props.theme.main.background[1]};
        border-radius: 0.5rem;
        border: solid 1px ${(props) => props.theme.main.lighterForeground[1]};

        &::placeholder {
            color: ${(props) => props.theme.main.lighterForeground[1]};
        }

        margin: 1px 2px 1px 2px;
        width: 10rem;
    }

    & div.rdt_TableCell,
    & div.rdt_TableCol {
        // important needed to override the inline style
        padding: 0 0 0 1rem;

        // allowing text overflow so the titles don't get unnecessarily clipped due to react-data-table's layout

        & > * {
            overflow: visible;
        }
    }

    // the table itself

    & .rdt_TableCell,
    & .rdt_TableCol_Sortable,
    & .rdt_TableHeadRow,
    & .rdt_TableCol,
    & .rdt_Table {
        text-align: start;
        font-size: 1rem;
        background-color: transparent;
        color: ${(props) => props.theme.main.foreground[2]};
    }

    & .rdt_Table {
        border-color: ${(props) => props.theme.main.border};
    }

    & div.rdt_TableRow {
        padding: 0.5rem 0.5rem;
        // important needed to override the inline style
        border-bottom-color: ${(props) => props.theme.main.border};
    }

    & div.rdt_TableRow:hover {
        background-color: ${(props) => props.theme.primary.background[1]};
    }

    & .rdt_TableHeadRow {
        padding: 0.5rem 0.5rem;
        background-color: ${(props) => props.theme.main.background[2]};
        border-color: ${(props) => props.theme.main.border};

        font-weight: bold;
    }

    & .rdt_TableCell {
        // the div containing the text

        & > div {
            white-space: normal;
        }
    }

    & .rdt_Table > div {
        background-color: transparent;
        color: ${(props) => props.theme.main.foreground[2]};
    }

    & .rdt_TableRow {
        text-align: start;
        font-size: 1rem;
        background-color: ${(props) => props.theme.main.background[1]};
    }

    & .rdt_TableRow:nth-child(odd) {
        background-color: ${(props) => props.theme.main.background[0]};
    }

    ${(props) =>
        props.$rowBreakPointConfigs
            .map((breakPointConfig) => {
                return breakPointConfig.breakPoints
                    .map(
                        (breakPoint) => `& .rdt_TableRow:nth-child(${breakPoint + 1}) {
                            border-top: ${props.$dividingLineStyleOptions[breakPointConfig.dividingLineStyle].thickness} solid ${props.$dividingLineStyleOptions[breakPointConfig.dividingLineStyle].colour};
                        }`
                    )
                    .join();
            })
            .join()}
`;
// The inside map creates a div line at each required index for a specific style, and the outside map does this for each style

export const ServerPaginatedTable = <Data, DbData extends Record<string, unknown>, FilterState>(
    props: Props<Data, DbData, PaginationTypeEnum.Server, FilterState>
): React.ReactElement => <Table<Data, PaginationTypeEnum.Server, FilterState, DbData> {...props} />;

export const ClientPaginatedTable = <Data, FilterState>(
    props: Props<Data, Record<string, never>, PaginationTypeEnum.Client, FilterState>
): React.ReactElement => <Table<Data, PaginationTypeEnum.Client, FilterState> {...props} />;
