"use client";

import React from "react";
import { TableHeaders } from "@/components/Tables/materialTable/tableTypes";
import TableSurface from "@/components/Tables/TableSurface";
import { ClientPaginatedMaterialTable } from "@/components/Tables/MaterialTable";

export interface ClientParcelStatsRow {
    totalParcels: number;
    totalSuccessful: number;
    lastSixMonthsSuccessful: number;
}

const headers: TableHeaders<ClientParcelStatsRow> = [
    ["totalParcels", "Total Parcels"],
    ["totalSuccessful", "Total Successful Parcels"],
    ["lastSixMonthsSuccessful", "Total Successful Parcels in the last 6 months"],
];

export interface ClientParcelStatsProps {
    parcelsData: ClientParcelStatsRow[];
}

const ClientParcelStats: React.FC<ClientParcelStatsProps> = (props) => {
    return (
        <TableSurface>
            <ClientPaginatedMaterialTable
                data={props.parcelsData}
                headerKeysAndLabels={headers}
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
    );
};

export default ClientParcelStats;
