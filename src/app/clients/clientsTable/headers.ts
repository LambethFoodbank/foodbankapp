import { TableHeaders } from "@/components/Tables/Table";
import { ClientsTableRow } from "./types";

export const clientsHeaders: TableHeaders<ClientsTableRow> = [
    ["iconsColumn", ""],
    ["fullName", "Name"],
    ["familyCategory", "Family Size"],
    ["addressPostcode", "Postcode"],
    ["phoneNumber", "Phone"],
];

export default clientsHeaders;
