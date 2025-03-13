import { buildServerSideTextFilter } from "@/components/Tables/TextFilter";
import clientsHeaders from "./headers";
import { ClientsFilter, ClientsFilterMethod } from "./types";
import {
    familySearch,
    fullNameSearch,
    phoneSearch,
    postcodeSearch,
} from "@/common/databaseFilters";
import { DbClientRow } from "@/databaseUtils";

const clientsFullNameSearch: ClientsFilterMethod = fullNameSearch<DbClientRow>(
    "full_name",
    "is_active"
);

const clientsPostcodeSearch: ClientsFilterMethod = postcodeSearch<DbClientRow>(
    "address_postcode",
    "is_active"
);

const clientsPhoneSearch: ClientsFilterMethod = phoneSearch<DbClientRow>(
    "phone_number",
    "is_active"
);

const clientsFamilySearch: ClientsFilterMethod = familySearch("family_count", "is_active");

const clientsFilters: ClientsFilter[] = [
    buildServerSideTextFilter({
        key: "fullName",
        label: "Name",
        headers: clientsHeaders,
        method: clientsFullNameSearch,
    }),
    buildServerSideTextFilter({
        key: "familyCategory",
        label: "Family Size",
        headers: clientsHeaders,
        method: clientsFamilySearch,
    }),
    buildServerSideTextFilter({
        key: "addressPostcode",
        label: "Postcode",
        headers: clientsHeaders,
        method: clientsPostcodeSearch,
    }),
    buildServerSideTextFilter({
        key: "phoneNumber",
        label: "Phone",
        headers: clientsHeaders,
        method: clientsPhoneSearch,
    }),
];

export default clientsFilters;
