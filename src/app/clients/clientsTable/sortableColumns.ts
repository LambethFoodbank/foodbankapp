import { SortOptions } from "@/components/Tables/Table";
import { ClientsSortMethod, ClientsTableRow } from "./types";
const clientsSortableColumns: SortOptions<ClientsTableRow, ClientsSortMethod>[] = [
    {
        key: "fullName",
        sortMethod: (sortDirection, query) =>
            query.order("full_name", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familyCategory",
        sortMethod: (sortDirection, query) =>
            query.order("family_count", { ascending: sortDirection === "asc" }),
    },
    {
        key: "addressPostcode",
        sortMethod: (sortDirection, query) =>
            query.order("sorted_address_postcode", {
                ascending: sortDirection === "asc",
            }),
    },
    {
        key: "phoneNumber",
        sortMethod: (sortDirection, query) =>
            query.order("phone_number", { ascending: sortDirection === "asc" }),
    },
    {
        key: "email",
        sortMethod: (sortDirection, query) =>
            query.order("email", { ascending: sortDirection === "asc" }),
    },
];

export default clientsSortableColumns;
