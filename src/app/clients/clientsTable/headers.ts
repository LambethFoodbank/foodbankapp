import { TableHeaders } from "@/components/Tables/Table";
import { ClientsTableRow } from "./types";

const clientsHeaders: TableHeaders<ClientsTableRow> = [
    ["fullName", "Name"],
    ["familyCategory", "Family Size"],
    ["addressPostcode", "Postcode"],
    ["phoneNumber", "Phone"],
];

export default clientsHeaders;
