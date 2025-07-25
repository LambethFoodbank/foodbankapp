"use client";

import React from "react";
import { ClientPaginatedTable, TableHeaders } from "@/components/Tables/Table";
import TableSurface from "@/components/Tables/TableSurface";
import { useRouter } from "next/navigation";

export interface ClientParcelStatsRow {
    totalParcels: number;
    totalSuccessful: number;
    lastSixMonthsSuccessful: number;
}

const headers: TableHeaders<ClientParcelStatsRow> = [
    ["totalParcels", "Total Parcels"],
    ["totalSuccessful", "Successful Parceles"],
    ["lastSixMonthsSuccessful", "Successful in the last 6 months"],
];

export interface ClientParcelStatsProps {
    parcelsData: ClientParcelStatsRow[];
}

const ClientParcelStats: React.FC<ClientParcelStatsProps> = (props) => {
    const router = useRouter();
    return (
        <TableSurface>
            <ClientPaginatedTable
                dataPortion={props.parcelsData}
                headerKeysAndLabels={headers}
                paginationConfig={{ enablePagination: false }}
                sortConfig={{ sortPossible: false }}
                filterConfig={{
                    primaryFiltersShown: false,
                    additionalFiltersShown: false,
                }}
                checkboxConfig={{ displayed: false }}
                editableConfig={{ editable: false }}
                pointerOnHover={true}
            />
        </TableSurface>
    );
};

export default ClientParcelStats;
