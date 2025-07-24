import { TableHeaders } from "@/components/Tables/Table";
import { ClientsTableRow } from "./types";

export const clientsHeaders: TableHeaders<ClientsTableRow> = [
    ["iconsColumn", ""],
    ["fullName", "Name"],
    ["familyCategory", "Family Size"],
    ["addressPostcode", "Postcode"],
    ["phoneNumber", "Phone"],
    ["email", "Email"],
];

export default clientsHeaders;
