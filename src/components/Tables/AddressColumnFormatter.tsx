import React from "react";
import { ClientsTableRow } from "@/app/clients/clientsTable/types";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import ClientOutsideDeliveryAreaIcon from "@/components/Icons/ClientsOutsideDeliveryAreaIcon";
import { getDisplayPostcode } from "@/common/format";

export const rowToAddressColumn = ({
    postcode,
    isDeliverable,
}: ClientsTableRow["addressPostcode"] | ParcelsTableRow["addressPostcode"]): React.ReactElement<any> => {
    const postcodeRow: React.ReactNode[] = [];
    postcodeRow.push(getDisplayPostcode(postcode));
    if (!isDeliverable && postcode !== "-") {
        postcodeRow.push(
            <span style={{ paddingLeft: "0.3rem" }}>
                <>
                    <ClientOutsideDeliveryAreaIcon />
                </>
            </span>
        );
    }
    return <>{postcodeRow}</>;
};
