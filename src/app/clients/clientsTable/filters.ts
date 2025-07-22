import { buildServerSideTextFilter } from "@/components/Tables/TextFilter";
import { ClientsFilter, ClientsFilterMethod } from "./types";
import {
    familySearch,
    fullNameSearch,
    phoneSearch,
    emailSearch,
    postcodeSearch,
    deliveryAreaFilter,
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
    "additional_phone_numbers_text",
    "is_active"
);

const clientsEmailSearch: ClientsFilterMethod = emailSearch<DbClientRow>("email", "is_active");

const clientsFamilySearch: ClientsFilterMethod = familySearch("family_count", "is_active");

const clientsFilters: ClientsFilter[] = [
    buildServerSideTextFilter({
        key: "fullName",
        label: "Name",
        method: clientsFullNameSearch,
    }),
    buildServerSideTextFilter({
        key: "familyCategory",
        label: "Family Size",
        method: clientsFamilySearch,
    }),
    buildServerSideTextFilter({
        key: "addressPostcode",
        label: "Postcode",
        method: clientsPostcodeSearch,
    }),
    buildServerSideTextFilter({
        key: "phoneNumber",
        label: "Phone",
        method: clientsPhoneSearch,
    }),
    buildServerSideTextFilter({
        key: "email",
        label: "Email",
        method: clientsEmailSearch,
    }),
    deliveryAreaFilter("is_deliverable", "is_active") as unknown as ClientsFilter,
];

export default clientsFilters;
