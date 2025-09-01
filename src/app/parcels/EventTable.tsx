"use client";

import React from "react";
import { TableHeaders } from "@/components/Tables/materialTable/tableTypes";
import TableSurface from "@/components/Tables/TableSurface";
import { ClientPaginatedMaterialTable } from "@/components/Tables/MaterialTable";

export interface EventTableRow {
    eventInfo: string;
    timestamp: Date;
}

export const eventsTableHeaderKeysAndLabels: TableHeaders<EventTableRow> = [
    ["eventInfo", "Event"],
    ["timestamp", "Timestamp"],
];

const defaultShownHeaders: (keyof EventTableRow)[] = ["eventInfo", "timestamp"];

export interface EventTableProps {
    tableData: EventTableRow[];
}

const formatDatetimeAsDatetime = (datetime: Date): string => {
    return datetime.toLocaleString("en-GB");
};

const EventTable: React.FC<EventTableProps> = (props) => {
    const eventsTableColumnDisplayFunctions = {
        timestamp: formatDatetimeAsDatetime,
    };

    return (
        <>
            <TableSurface>
                <ClientPaginatedMaterialTable
                    data={props.tableData}
                    headerKeysAndLabels={eventsTableHeaderKeysAndLabels}
                    columnDisplayFunctions={eventsTableColumnDisplayFunctions}
                    defaultShownHeaders={defaultShownHeaders}
                    checkboxConfig={{ displayed: false }}
                    paginationConfig={{ enablePagination: false }}
                    sortConfig={{ sortPossible: false }}
                    filterConfig={{
                        primaryFiltersShown: false,
                        additionalFiltersShown: false,
                    }}
                    rowActionsConfig={{ editable: false }}
                />
            </TableSurface>
        </>
    );
};

export default EventTable;
