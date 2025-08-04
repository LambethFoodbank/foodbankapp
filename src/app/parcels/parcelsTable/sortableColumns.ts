import { DefaultSortConfig, SortOptions } from "@/components/Tables/Table";
import { ParcelsTableRow, ParcelsSortMethod } from "./types";
import { SortOrder } from "react-data-table-component";

const parcelsSortableColumns: SortOptions<ParcelsTableRow, ParcelsSortMethod>[] = [
    {
        key: "fullName",
        sortMethod: (sortDirection, query) =>
            query
                .order("client_is_active", { ascending: sortDirection !== "asc" })
                .order("client_full_name", { ascending: sortDirection === "asc" })
                .order("packing_date")
                .order("packing_slot_order")
                .order("is_delivery", { ascending: false })
                .order("collection_centre_name")
                .order("client_address_postcode")
                .order("parcel_id"),
    },
    {
        key: "familyCategory",
        sortMethod: (sortDirection, query) =>
            query
                .order("client_is_active", { ascending: sortDirection !== "asc" })
                .order("family_count", { ascending: sortDirection === "asc" })
                .order("packing_date")
                .order("packing_slot_order")
                .order("is_delivery", { ascending: false })
                .order("collection_centre_name")
                .order("client_address_postcode")
                .order("parcel_id"),
    },
    {
        key: "addressColumn",
        sortMethod: (sortDirection, query) =>
            query
                .order("client_is_active", { ascending: sortDirection !== "asc" })
                .order("client_address_postcode", { ascending: sortDirection === "asc" })
                .order("packing_date")
                .order("packing_slot_order")
                .order("is_delivery", { ascending: false })
                .order("collection_centre_name")
                .order("parcel_id"),
    },
    {
        key: "phoneNumber",
        sortMethod: (sortDirection, query) =>
            query
                .order("client_is_active", { ascending: sortDirection !== "asc" })
                .order("client_phone_number", { ascending: sortDirection === "asc" })
                .order("packing_date")
                .order("packing_slot_order")
                .order("is_delivery", { ascending: false })
                .order("collection_centre_name")
                .order("client_address_postcode")
                .order("parcel_id"),
    },
    {
        key: "email",
        sortMethod: (sortDirection, query) =>
            query
                .order("client_is_active", { ascending: sortDirection !== "asc" })
                .order("client_email", { ascending: sortDirection === "asc" })
                .order("packing_date")
                .order("packing_slot_order")
                .order("is_delivery", { ascending: false })
                .order("collection_centre_name")
                .order("client_address_postcode")
                .order("parcel_id"),
    },
    {
        key: "voucherNumber",
        sortMethod: (sortDirection, query) =>
            query
                .order("voucher_number", { ascending: sortDirection === "asc" })
                .order("packing_date")
                .order("packing_slot_order")
                .order("is_delivery", { ascending: false })
                .order("collection_centre_name")
                .order("client_is_active", { ascending: sortDirection !== "asc" })
                .order("client_address_postcode")
                .order("parcel_id"),
    },
    {
        key: "deliveryCollection",
        sortMethod: (sortDirection, query) =>
            query
                .order("is_delivery", { ascending: sortDirection === "asc" })
                .order("collection_centre_name")
                .order("packing_date")
                .order("packing_slot_order")
                .order("client_is_active", { ascending: sortDirection !== "asc" })
                .order("client_address_postcode")
                .order("parcel_id"),
    },
    {
        key: "packingDate",
        sortMethod: (sortDirection, query) =>
            query
                .order("packing_date", { ascending: sortDirection === "asc" })
                .order("packing_slot_order")
                .order("is_delivery", { ascending: false })
                .order("collection_centre_name")
                .order("client_is_active", { ascending: false })
                .order("client_address_postcode")
                .order("parcel_id"),
    },
    {
        key: "packingSlot",
        sortMethod: (sortDirection, query) =>
            query
                .order("packing_slot_order", { ascending: sortDirection === "asc" })
                .order("packing_date")
                .order("is_delivery", { ascending: false })
                .order("collection_centre_name")
                .order("client_is_active", { ascending: sortDirection !== "asc" })
                .order("client_address_postcode")
                .order("parcel_id"),
    },
    {
        key: "lastStatus",
        sortMethod: (sortDirection, query) =>
            query
                .order("last_status_workflow_order", { ascending: sortDirection === "asc" })
                .order("packing_date")
                .order("packing_slot_order")
                .order("is_delivery", { ascending: false })
                .order("collection_centre_name")
                .order("client_is_active", { ascending: sortDirection !== "asc" })
                .order("client_address_postcode")
                .order("parcel_id"),
    },
    {
        key: "createdAt",
        sortMethod: (sortDirection, query) =>
            query
                .order("created_at", { ascending: sortDirection === "asc" })
                .order("packing_date")
                .order("packing_slot_order")
                .order("is_delivery", { ascending: false })
                .order("collection_centre_name")
                .order("client_is_active", { ascending: sortDirection !== "asc" })
                .order("client_address_postcode")
                .order("parcel_id"),
    },
];

export const defaultParcelsSortConfig: DefaultSortConfig = {
    defaultColumnHeaderKey: "packingDate",
    defaultSortDirection: "asc" as SortOrder,
};

export const defaultParcelsSort: ParcelsSortMethod =
    parcelsSortableColumns.find(
        (column) => column.key === defaultParcelsSortConfig.defaultColumnHeaderKey
    )?.sortMethod ?? ((_, query) => query);

export default parcelsSortableColumns;
