"use client";

import React from "react";
import { TableColumn } from "react-data-table-component";
import { SortOrder } from "react-data-table-component/dist/DataTable/types";
import { DividingLineStyleOptions } from "@/app/parcels/parcelsTable/conditionalStyling";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { Database } from "@/databaseTypesFile";
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

export type ToggleableColumnGroup = {
    commonKey: string;
    commonLabel: string;
    columnNames: string[];
};
