// TODO: VFB-492

import React from "react";
import DataViewerFallback from "@/components/DataViewer/DataViewerFallback";
import EventTable from "@/app/parcels/EventTable";

const clientDetailFields = ["TYPE", "PACKING DATE", "HUB", "AMOUNT"];

const ExpandedEmergencyBagDetailsFallback: React.FC = () => {
    return (
        <>
            <DataViewerFallback fieldPlaceholders={clientDetailFields} />;
            <EventTable tableData={[]} />
        </>
    );
};

export default ExpandedEmergencyBagDetailsFallback;
