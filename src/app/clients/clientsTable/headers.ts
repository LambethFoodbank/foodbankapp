import { TableHeaders } from "@/components/Tables/Table";
import { ClientsTableRow } from "./types";

const clientsHeaders: TableHeaders<ClientsTableRow> = [
    ["fullName", "Name"],
    ["familyCategory", "Family Size"],
    ["addressColumn", "Postcode"],
    ["phoneNumber", "Phone"],
    ["email", "Email"],
];

export default clientsHeaders;
