import { TableHeaders } from "@/components/Tables/materialTable/tableTypes";
import { ClientsTableRow } from "./types";

const clientsHeaders: TableHeaders<ClientsTableRow> = [
    ["fullName", "Name"],
    ["familyCategory", "Family Size"],
    ["addressPostcode", "Postcode"],
    ["phoneNumber", "Phone"],
    ["email", "Email"],
];

export default clientsHeaders;
