import React from "react";
import DataViewerFallback from "@/components/DataViewer/DataViewerFallback";
import EventTable from "@/app/parcels/EventTable";

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

const ExpandedEmergencyBagDetailsFallback: React.FC = () => {
    return (
        <>
            <DataViewerFallback fieldPlaceholders={clientDetailFields} />;
            <EventTable tableData={[]} />
        </>
    );
};

export default ExpandedEmergencyBagDetailsFallback;
