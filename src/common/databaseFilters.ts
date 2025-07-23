import { ServerSideFilter, ServerSideFilterMethod } from "@/components/Tables/Filters";
import { displayPostcodeForHomelessClient } from "./format";
import { DbClientRow, DbParcelRow } from "@/databaseUtils";
import { parcelsPageDeletedClientDisplayName } from "@/app/parcels/parcelsTable/format";
import { ParcelsFilterMethod, ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { serverSideChecklistFilter } from "@/components/Tables/ChecklistFilter";

const textFilterDelimiter = ",";
const defaultQueryFilterRegex = /[^a-zA-Z0-9 '\-+?]/g;
const emailQueryFilterRegex = /[^a-zA-Z0-9+-~!#$&`./=^'{}|@]/g;

export const dbFilterWithSubstringQueries = <DbData extends DbClientRow | DbParcelRow>(
    substringToSubqueryMap: (value: string) => string,
    regex: RegExp = defaultQueryFilterRegex
): ServerSideFilterMethod<DbData, string> => {
    return (query, state) => {
        const substrings = state
            .split(textFilterDelimiter)
            .map((substring) => substring.trim().replace(regex, ""))
            .filter((substring) => substring.length > 0);

        if (substrings.length === 0) {
            return query;
        }

        return query.or(substrings.map(substringToSubqueryMap).join(","));
    };
};

export const fullNameSearch = <DbData extends DbClientRow | DbParcelRow>(
    fullNameColumnLabel: Extract<keyof DbData, "full_name" | "client_full_name">,
    clientIsActiveColumnLabel: Extract<keyof DbData, "is_active" | "client_is_active">
): ServerSideFilterMethod<DbData, string> => {
    return dbFilterWithSubstringQueries((substring) => {
        if (parcelsPageDeletedClientDisplayName.toLowerCase().includes(substring.toLowerCase())) {
            return `or(${fullNameColumnLabel}.ilike.%${substring}%, ${clientIsActiveColumnLabel}.is.false)`;
        }
        return `and(${clientIsActiveColumnLabel}.is.true, ${fullNameColumnLabel}.ilike.%${substring}%)`;
    });
};

export const postcodeSearch = <DbData extends DbClientRow | DbParcelRow>(
    postcodeColumnLabel: Extract<keyof DbData, "address_postcode" | "client_address_postcode">,
    clientIsActiveColumnLabel: Extract<keyof DbData, "is_active" | "client_is_active">
): ServerSideFilterMethod<DbData, string> => {
    return dbFilterWithSubstringQueries((substring) => {
        if (substring === "-") {
            return `${clientIsActiveColumnLabel}.is.false`;
        }
        if (displayPostcodeForHomelessClient.toLowerCase().includes(substring.toLowerCase())) {
            return `and(${clientIsActiveColumnLabel}.is.true, or(${postcodeColumnLabel}.ilike.%${substring}%, ${postcodeColumnLabel}.is.null))`;
        }
        return `and(${clientIsActiveColumnLabel}.is.true, ${postcodeColumnLabel}.ilike.%${substring}%)`;
    });
};

export const phoneSearch = <DbData extends DbClientRow | DbParcelRow>(
    phoneColumnLabel: Extract<keyof DbData, "phone_number" | "client_phone_number">,
    additionalPhoneColumnLabel: Extract<
        keyof DbData,
        "additional_phone_numbers_text" | "client_additional_phone_numbers_text"
    >,
    clientIsActiveColumnLabel: Extract<keyof DbData, "is_active" | "client_is_active">
): ServerSideFilterMethod<DbData, string> => {
    return dbFilterWithSubstringQueries((substring) => {
        if (substring === "-") {
            return `or(${clientIsActiveColumnLabel}.is.false, ${phoneColumnLabel}.ilike.%${substring}%)`;
        }
        const phoneColumnQueryActiveClient = `and(${clientIsActiveColumnLabel}.is.true, ${phoneColumnLabel}.ilike.%${substring}%)`;
        const additionalPhoneQueryActiveClient = `and(${clientIsActiveColumnLabel}.is.true, ${additionalPhoneColumnLabel}.ilike.%${substring}%)`;
        return `or(${phoneColumnQueryActiveClient}, ${additionalPhoneQueryActiveClient})`;
    });
};

export const emailSearch = <DbData extends DbClientRow | DbParcelRow>(
    emailColumnLabel: Extract<keyof DbData, "email" | "client_email">,
    clientIsActiveColumnLabel: Extract<keyof DbData, "is_active" | "client_is_active">
): ServerSideFilterMethod<DbData, string> => {
    return dbFilterWithSubstringQueries((substring) => {
        if (substring === "-") {
            return `${clientIsActiveColumnLabel}.is.false`;
        }
        return `and(${clientIsActiveColumnLabel}.is.true, ${emailColumnLabel}.ilike.%${substring.toLowerCase()}%)`;
    }, emailQueryFilterRegex);
};

export const familySearch = <DbData extends DbClientRow | DbParcelRow>(
    familyCountColumnLabel: Extract<keyof DbData, "family_count">,
    clientIsActiveColumnLabel: Extract<keyof DbData, "is_active" | "client_is_active">
): ServerSideFilterMethod<DbData, string> => {
    return dbFilterWithSubstringQueries((substring) => {
        if (substring === "-") {
            return `${clientIsActiveColumnLabel}.is.false`;
        }
        if ("single".includes(substring.toLowerCase())) {
            return `and(${clientIsActiveColumnLabel}.is.true, ${familyCountColumnLabel}.lte.1)`;
        }
        if ("family of".includes(substring.toLowerCase())) {
            return `and(${clientIsActiveColumnLabel}.is.true, ${familyCountColumnLabel}.gte.2)`;
        }

        const substringAsNumber = Number(substring);
        if (Number.isNaN(substringAsNumber) || substringAsNumber === 0) {
            return `and(${clientIsActiveColumnLabel}.is.true, ${familyCountColumnLabel}.eq.-1)`;
        }
        if (substringAsNumber >= 10) {
            return `and(${clientIsActiveColumnLabel}.is.true, ${familyCountColumnLabel}.gte.10)`;
        }
        return `and(${clientIsActiveColumnLabel}.is.true, ${familyCountColumnLabel}.eq.${substringAsNumber})`;
    });
};

export function deliveryAreaFilter(
    deliverableColumnLabel: string,
    clientIsActiveColumnLabel: string
): ServerSideFilter<ParcelsTableRow, string[], DbParcelRow> {
    const deliveryAreasSearch: ParcelsFilterMethod<string[]> = (query, state) => {
        if (state.length === 0) {
            return query;
        }
        return query.eq(clientIsActiveColumnLabel, true).in(deliverableColumnLabel, state);
    };

    const optionsSet = [
        {
            key: "Inside",
            value: true,
        },
        {
            key: "Outside",
            value: false,
        },
    ];

    optionsSet.sort();
    return serverSideChecklistFilter<ParcelsTableRow, DbParcelRow>({
        key: deliverableColumnLabel,
        filterLabel: "Delivery Area",
        itemLabelsAndKeys: optionsSet.map((option) => [option.key, String(option.value)]),
        initialCheckedKeys: ["true"],
        method: deliveryAreasSearch,
    });
}
