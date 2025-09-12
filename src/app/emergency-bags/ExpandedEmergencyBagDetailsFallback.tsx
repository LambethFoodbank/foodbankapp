// TODO: VFB-492

import React from "react";
import DataViewerFallback from "@/components/DataViewer/DataViewerFallback";

const detailFields = ["TYPE", "PACKING DATE", "HUB", "AMOUNT"];

const ExpandedEmergencyBagDetailsFallback: React.FC = () => {
    return (
        <>
            <DataViewerFallback fieldPlaceholders={detailFields} />;
        </>
    );
};

export default ExpandedEmergencyBagDetailsFallback;
