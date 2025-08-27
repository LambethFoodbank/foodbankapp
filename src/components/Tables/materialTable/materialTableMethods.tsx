import { MRT_ColumnDef } from "material-react-table";
import {
    ColumnDisplayFunctions,
    GenericSortMethod,
    SortOptions,
    TableHeaders,
} from "@/components/Tables/Table";

import React from "react";

const renderMRTCell = <Data extends object, K extends keyof Data>(
    value: Data[K],
    key: K,
    renderer?: ColumnDisplayFunctions<Data>[K]
): React.ReactElement => {
    const element: React.ReactElement = <>{renderer ? renderer(value) : value}</>;

    if (!React.isValidElement(element)) {
        throw new Error(
            `${String(element)} is not a valid React renderable, add a column display function for "${String(
                key
            )}"`
        );
    }

    return element;
};

export const mapHeadersToMRTColumns = <Data extends object, SortMethod extends GenericSortMethod>(
    headers: TableHeaders<Data>,
    toggleableHeaders: readonly (keyof Data | string)[],
    sortableColumns: SortOptions<Data, SortMethod>[],
    columnDisplayFunctions?: ColumnDisplayFunctions<Data>
): MRT_ColumnDef<Data>[] => {
    return headers.map(([key, label]) => {
        return {
            accessorKey: key as string,
            header: label,
            Cell: ({ row }) => {
                const value = row.original[key];
                const renderer = columnDisplayFunctions?.[key];

                return renderMRTCell(value, key, renderer);
            },
            ...(toggleableHeaders.length > 0 && {
                visibleInShowHideMenu: toggleableHeaders.includes(key),
            }),
            enableSorting: !!sortableColumns.find((column) => column.key === key),
        };
    });
};
