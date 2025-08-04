import React from "react";
import DataViewerFallback from "@/components/DataViewer/DataViewerFallback";
import ClientParcelsTable from "@/app/clients/ClientParcelsTable";

const clientDetailFields = [
    "VOUCHER #",
    "FULL NAME",
    "ADDRESS",
    "PHONE NUMBER",
    "EMAIL",
    "DELIVERY_INSTRUCTIONS",
    "HOUSEHOLD",
    "CHILDREN",
    "PACKING DATE",
    "PACKING TIME",
    "COLLECTION",
];

const ExpandedClientDetailsFallback: React.FC = () => {
    return (
        <>
            <DataViewerFallback fieldPlaceholders={clientDetailFields} />;
            <ClientParcelsTable parcelsData={[]} />
        </>
    );
};

export default ExpandedClientDetailsFallback;
