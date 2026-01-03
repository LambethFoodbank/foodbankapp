"use client";

import React from "react";
import { ClientPaginatedTable, TableHeaders } from "@/components/Tables/Table";
import TableSurface from "@/components/Tables/TableSurface";

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
                <ClientPaginatedTable
                    dataPortion={props.tableData}
                    headerKeysAndLabels={eventsTableHeaderKeysAndLabels}
                    testId="EventTable"
                    columnDisplayFunctions={eventsTableColumnDisplayFunctions}
                    defaultShownHeaders={defaultShownHeaders}
                    checkboxConfig={{ displayed: false }}
                    filterConfig={{
                        primaryFiltersShown: false,
                        additionalFiltersShown: false,
                    }}
                    sortConfig={{ sortPossible: false }}
                    paginationConfig={{ enablePagination: false }}
                    editableConfig={{ editable: false }}
                />
            </TableSurface>
        </>
    );
};

export default EventTable;
