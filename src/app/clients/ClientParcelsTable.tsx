"use client";

import React from "react";
import { TableHeaders } from "@/components/Tables/Table";
import TableSurface from "@/components/Tables/TableSurface";
import { useRouter } from "next/navigation";
import { ClientPaginatedMaterialTable } from "@/components/Tables/MaterialTable";

export interface ClientParcelTableRow {
    parcelId: string;
    voucherNumber: string;
    packingDate: string;
    collectionCentre: string;
}

const headers: TableHeaders<ClientParcelTableRow> = [
    ["voucherNumber", "Voucher Number"],
    ["packingDate", "Packing Date"],
    ["collectionCentre", "Method"],
];

export interface ClientParcelTableProps {
    parcelsData: ClientParcelTableRow[];
}

const ClientParcelsTable: React.FC<ClientParcelTableProps> = (props) => {
    const router = useRouter();
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
                onRowClick={(row) => router.push(`/parcels?parcelId=${row.original.parcelId}`)}
                rowActionsConfig={{ editable: false }}
            />
        </TableSurface>
    );
};

export default ClientParcelsTable;
