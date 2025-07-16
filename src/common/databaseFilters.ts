import { ServerSideFilterMethod } from "@/components/Tables/Filters";
import { displayPostcodeForHomelessClient } from "./format";
import { DbClientRow, DbParcelRow } from "@/databaseUtils";
import { parcelsPageDeletedClientDisplayName } from "@/app/parcels/parcelsTable/format";

const textFilterDelimiter = ",";

export const dbFilterWithSubstringQueries = <DbData extends DbClientRow | DbParcelRow>(
    substringToSubqueryMap: (value: string) => string
): ServerSideFilterMethod<DbData, string> => {
    return (query, state) => {
        const substrings = state
            .split(textFilterDelimiter)
            .map((substring) => substring.trim().replace(/[^a-zA-Z0-9 '\-+?]/g, ""))
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
    clientIsActiveColumnLabel: Extract<keyof DbData, "is_active" | "client_is_active">
): ServerSideFilterMethod<DbData, string> => {
    return dbFilterWithSubstringQueries((substring) => {
        if ("-".includes(substring.toLowerCase())) {
            return `or(${clientIsActiveColumnLabel}.is.false, ${phoneColumnLabel}.ilike.%${substring}%)`;
        }
        return `and(${clientIsActiveColumnLabel}.is.true, ${phoneColumnLabel}.ilike.%${substring}%)`;
    });
};

export const emailSearch = <DbData extends DbClientRow | DbParcelRow>(
    emailColumnLabel: Extract<keyof DbData, "email" | "client_email">,
    clientIsActiveColumnLabel: Extract<keyof DbData, "is_active" | "client_is_active">
): ServerSideFilterMethod<DbData, string> => {
    return dbFilterWithSubstringQueries((substring) => {
        if ("-".includes(substring.toLowerCase())) {
            return `or(${clientIsActiveColumnLabel}.is.false, ${emailColumnLabel}.ilike.%${substring}%)`;
        }
        return `and(${clientIsActiveColumnLabel}.is.true, ${emailColumnLabel}.ilike.%${substring}%)`;
    });
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
