import { DefaultSortConfig, SortOptions } from "@/components/Tables/Table";
import { EmergencyBagsSortMethod, EmergencyBagsTableRow } from "./types";
import { SortOrder } from "react-data-table-component";

const emergencyBagsSortableColumns: SortOptions<EmergencyBagsTableRow, EmergencyBagsSortMethod>[] =
    [
        {
            key: "type",
            sortMethod: (sortDirection, query) =>
                query
                    .order("packing_date")
                    .order("collection_centre_name")
                    .order("emergency_bag_id"),
        },
        {
            key: "amount",
            sortMethod: (sortDirection, query) =>
                query
                    .order("amount", { ascending: sortDirection === "asc" })
                    .order("packing_date")
                    .order("collection_centre_name")
                    .order("emergency_bag_id"),
        },
        {
            key: "deliveryCollection",
            sortMethod: (sortDirection, query) =>
                query
                    .order("collection_centre_name")
                    .order("packing_date")
                    .order("emergency_bag_id"),
        },
        {
            key: "packingDate",
            sortMethod: (sortDirection, query) =>
                query
                    .order("packing_date", { ascending: sortDirection === "asc" })
                    .order("collection_centre_name")
                    .order("emergency_bag_id"),
        },
        {
            key: "createdAt",
            sortMethod: (sortDirection, query) =>
                query
                    .order("created_at", { ascending: sortDirection === "asc" })
                    .order("packing_date")
                    .order("collection_centre_name")
                    .order("emergency_bag_id"),
        },
    ];

export const defaultEmergencyBagsSortConfig: DefaultSortConfig = {
    defaultColumnHeaderKey: "packingDate",
    defaultSortDirection: "asc" as SortOrder,
};

export const defaultEmergencyBagsSort: EmergencyBagsSortMethod =
    emergencyBagsSortableColumns.find(
        (column) => column.key === defaultEmergencyBagsSortConfig.defaultColumnHeaderKey
    )?.sortMethod ?? ((_, query) => query);

export default emergencyBagsSortableColumns;
