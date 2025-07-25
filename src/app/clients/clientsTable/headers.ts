import { TableHeaders } from "@/components/Tables/Table";
import { ClientsTableRow } from "./types";

export const clientsHeaders: TableHeaders<ClientsTableRow> = [
    ["fullName", "Name"],
    ["familyCategory", "Family Size"],
    ["addressColumn", "Postcode"],
    ["phoneNumber", "Phone"],
];

export default clientsHeaders;
