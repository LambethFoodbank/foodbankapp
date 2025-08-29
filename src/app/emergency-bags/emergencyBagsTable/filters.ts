"use client";

import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import { serverSideDateFilter } from "@/components/Tables/DateFilter";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import { DatabaseError } from "@/app/errorClasses";
import { serverSideChecklistFilter } from "@/components/Tables/ChecklistFilter";
import { getDbDate } from "@/common/format";
import {
    CollectionCentresOptions,
    ParcelsFilter,
    ParcelsFilterMethod,
    ParcelsFilters,
    ParcelsFiltersAllStates,
    ParcelsTableRow,
    packingSlotOptionsSet,
} from "./types";
import { buildServerSideTextFilter } from "@/components/Tables/TextFilter";
import { serverSideButtonGroupFilter } from "@/components/Tables/ButtonFilter";
import { Dayjs } from "dayjs";
import { UrlQueryParamsRecord } from "@/common/urlQueryParams";
import { DbParcelRow } from "@/databaseUtils";
import {
    dbFilterWithSubstringQueries,
    emailSearch,
    familySearch,
    fullNameSearch,
    phoneSearch,
    postcodeSearch,
} from "@/common/databaseFilters";
import {
    packingManagerParcelStatuses,
    shouldFilterBeDisabledInPackingManagerView,
} from "./packingManagerHelpers";
import { pageViewTypePackingManager, pageViewTypeQueryParam } from "@/common/constants";

const parcelsFullNameSearchMethod: ParcelsFilterMethod<string> = fullNameSearch<DbParcelRow>(
    "client_full_name",
    "client_is_active"
);

const parcelsPostcodeSearchMethod: ParcelsFilterMethod<string> = postcodeSearch<DbParcelRow>(
    "client_address_postcode",
    "client_is_active"
);

const parcelsFamilySearchMethod: ParcelsFilterMethod<string> = familySearch(
    "family_count",
    "client_is_active"
);

const parcelsPhoneSearchMethod: ParcelsFilterMethod<string> = phoneSearch<DbParcelRow>(
    "client_phone_number",
    "client_is_active"
);
const parcelsEmailSearchMethod: ParcelsFilterMethod<string> = emailSearch<DbParcelRow>(
    "client_email",
    "client_is_active"
);

const voucherSearchMethod: ParcelsFilterMethod<string> = dbFilterWithSubstringQueries<DbParcelRow>(
    (substring) => {
        const voucherColumnLabel = "voucher_number";
        if (substring === "?") {
            return `or(${voucherColumnLabel}.not.ilike.E%, ${voucherColumnLabel}.ilike."", ${voucherColumnLabel}.is.null)`;
        }
        return `${voucherColumnLabel}.ilike.%${substring}%`;
    }
);

const buildDateFilter = (initialState: DateRangeState): ParcelsFilter<DateRangeState> => {
    const dateSearch: ParcelsFilterMethod<DateRangeState> = (query, state) => {
        return query
            .gte("packing_date", getDbDate(state.from))
            .lte("packing_date", getDbDate(state.to));
    };
    return serverSideDateFilter<ParcelsTableRow, DbParcelRow>({
        key: "packingDate",
        label: "",
        method: dateSearch,
        initialState: initialState,
    });
};

const buildDeliveryCollectionFilter = async (): Promise<ParcelsFilter<string[]>> => {
    const deliveryCollectionSearch: ParcelsFilterMethod<string[]> = (query, state) => {
        return state.length === 0 ? query : query.in("collection_centre_acronym", state);
    };

    const { data: collection_centres, error } = await supabase
        .from("collection_centres")
        .select("name, acronym, is_shown");
    if (error) {
        const logId = await logErrorReturnLogId(
            "Error with fetch: Collection centre filter options",
            error
        );
        throw new DatabaseError("fetch", "collection centre filter options", logId);
    }
    const optionsSet: CollectionCentresOptions[] = collection_centres.map((row) => ({
        key: row.acronym,
        value: row.is_shown ? row.name : `${row.name} (inactive)`,
    }));

    return serverSideChecklistFilter<ParcelsTableRow, DbParcelRow>({
        key: "deliveryCollection",
        filterLabel: "Method",
        itemLabelsAndKeys: optionsSet.map((option) => [option.value, option.key]),
        initialCheckedKeys: [],
        method: deliveryCollectionSearch,
    });
};

const buildLastStatusFilter = async (): Promise<ParcelsFilter<string[]>> => {
    const labelForNoStatus = "No Status";

    const lastStatusSearch: ParcelsFilterMethod<string[]> = (query, state) => {
        if (state.length === 0) {
            // Default is to show everything that's not deleted
            return query.or(
                // eslint-disable-next-line quotes
                'last_status_event_name.neq."Parcel Deleted",last_status_event_name.is.null'
            );
        } else if (state.includes(labelForNoStatus)) {
            return query.or(
                `last_status_event_name.is.null,last_status_event_name.in.("",${state.join(",")})`
            );
        } else {
            return query.in("last_status_event_name", state);
        }
    };

    const keySet = new Set();
    const { data, error } = await supabase.from("status_order").select("event_name");
    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Last status filter options");
        throw new DatabaseError("fetch", "last status filter options", logId);
    }
    const optionsResponse = data ?? [];
    const optionsSet: string[] = optionsResponse.reduce<string[]>((filteredOptions, row) => {
        if (row.event_name && !keySet.has(row.event_name)) {
            keySet.add(row.event_name);
            filteredOptions.push(row.event_name);
        }
        return filteredOptions.sort();
    }, []);
    data && optionsSet.push(labelForNoStatus);

    return serverSideChecklistFilter<ParcelsTableRow, DbParcelRow>({
        key: "lastStatus",
        filterLabel: "Status",
        itemLabelsAndKeys: optionsSet.map((value) => [value, value]),
        initialCheckedKeys: [],
        method: lastStatusSearch,
    });
};

const buildPackingSlotFilter = async (): Promise<ParcelsFilter<string[]>> => {
    const packingSlotSearch: ParcelsFilterMethod<string[]> = (query, state) => {
        return state.length === 0 ? query : query.in("packing_slot_name", state);
    };

    const keySet = new Set();

    const { data, error } = await supabase
        .from("packing_slots")
        .select("name, is_shown")
        .order("order");
    if (error) {
        const logId = await logErrorReturnLogId(
            "Error with fetch: Packing slot filter options",
            error
        );
        throw new DatabaseError("fetch", "packing slot filter options", logId);
    }

    const optionsResponse = data ?? [];

    const optionsSet = optionsResponse.reduce<packingSlotOptionsSet[]>((filteredOptions, row) => {
        if (!row.name || keySet.has(row.name)) {
            return filteredOptions;
        }

        if (row.is_shown) {
            keySet.add(row.name);
            filteredOptions.push({ key: row.name, value: row.name });
        } else {
            keySet.add(row.name);
            filteredOptions.push({ key: row.name, value: `${row.name} (inactive)` });
        }

        return filteredOptions;
    }, []);

    optionsSet.sort();

    return serverSideChecklistFilter<ParcelsTableRow, DbParcelRow>({
        key: "packingSlot",
        filterLabel: "Slot",
        itemLabelsAndKeys: optionsSet.map((option) => [option.value, option.key]),
        initialCheckedKeys: [],
        method: packingSlotSearch,
    });
};

const buildSpecialViewFilter = (today: Dayjs): ParcelsFilter<string> => {
    const yesterday = today.subtract(1, "day");

    const specialViewSearchMethod: ParcelsFilterMethod<string> = (query, state) => {
        if (state === pageViewTypePackingManager) {
            return query
                .or(
                    `and(packing_date.eq.${getDbDate(yesterday)}, packing_slot_name.eq."PM"), ` +
                        `and(packing_date.eq.${getDbDate(today)}, packing_slot_name.eq."AM")`
                )
                .in("last_status_event_name", packingManagerParcelStatuses);
        }

        return query;
    };

    return serverSideButtonGroupFilter({
        key: pageViewTypeQueryParam,
        filterLabel: "",
        itemLabelsAndKeys: [
            ["All parcels", ""],
            ["Packing manager view", pageViewTypePackingManager],
        ],
        initialActiveFilter: "",
        method: specialViewSearchMethod,
        shouldPersistOnClear: true,
        isHidden: true,
    });
};

export const buildParcelFilters = async (
    today: Dayjs
): Promise<{
    primaryFilters: ParcelsFilters;
    additionalFilters: ParcelsFilters;
}> => {
    const dateFilter = buildDateFilter({
        from: today,
        to: today,
    });
    const primaryFilters: ParcelsFilters = [
        dateFilter,
        buildServerSideTextFilter({
            key: "fullName",
            label: "Name",
            method: parcelsFullNameSearchMethod,
        }),
        buildServerSideTextFilter({
            key: "addressPostcode",
            label: "Postcode",
            method: parcelsPostcodeSearchMethod,
        }),
        await buildDeliveryCollectionFilter(),
        await buildPackingSlotFilter(),
        await buildLastStatusFilter(),
        buildSpecialViewFilter(today),
    ];

    const additionalFilters: ParcelsFilters = [
        buildServerSideTextFilter({
            key: "familyCategory",
            label: "Family Size",
            method: parcelsFamilySearchMethod,
        }),
        buildServerSideTextFilter({
            key: "phoneNumber",
            label: "Phone",
            method: parcelsPhoneSearchMethod,
        }),
        buildServerSideTextFilter({
            key: "email",
            label: "Email",
            method: parcelsEmailSearchMethod,
        }),
        buildServerSideTextFilter({
            key: "voucherNumber",
            label: "Voucher",
            method: voucherSearchMethod,
        }),
    ];
    return { primaryFilters: primaryFilters, additionalFilters: additionalFilters };
};

export const buildPackingManagerPrimaryFilters = (
    primaryFilters: ParcelsFilters,
    today: Dayjs,
    yesterday: Dayjs
): ParcelsFilters => {
    return primaryFilters.map((filter) => {
        if (shouldFilterBeDisabledInPackingManagerView(filter)) {
            if (filter.key === "packingDate") {
                return {
                    ...filter,
                    state: { from: yesterday, to: today },
                    isDisabled: true,
                    isHiddenInUrl: true,
                } as ParcelsFilter<DateRangeState>;
            } else if (["packingSlot", "lastStatus"].includes(filter.key)) {
                return {
                    ...filter,
                    state: [] as string[],
                    isDisabled: true,
                    isHiddenInUrl: true,
                } as ParcelsFilter<string[]>;
            } else if (filter.key === pageViewTypeQueryParam) {
                return {
                    ...filter,
                    state: pageViewTypePackingManager,
                    isDisabled: true,
                    isHidden: true,
                    isHiddenInUrl: false,
                } as ParcelsFilter<string>;
            } else {
                return { ...filter, isDisabled: true, isHiddenInUrl: true };
            }
        }

        return { ...filter };
    });
};

export const updateFiltersFromQueryParams = (
    urlParams: UrlQueryParamsRecord,
    primaryFilters: ParcelsFilters,
    additionalFilters: ParcelsFilters
): {
    primaryFilters: ParcelsFilters;
    additionalFilters: ParcelsFilters;
} => {
    primaryFilters = primaryFilters.map((filter) => {
        const paramValForFilter = filter.readStateFromUrlQueryParams(urlParams);
        if (paramValForFilter !== null) {
            if (filter.key === "packingDate") {
                return {
                    ...filter,
                    state: paramValForFilter,
                } as ParcelsFilter<DateRangeState>;
            } else if (
                ["fullName", "addressPostcode", pageViewTypeQueryParam].includes(filter.key)
            ) {
                return {
                    ...filter,
                    state: paramValForFilter,
                } as ParcelsFilter<string>;
            } else if (["deliveryCollection", "packingSlot", "lastStatus"].includes(filter.key)) {
                return {
                    ...filter,
                    state: paramValForFilter,
                } as ParcelsFilter<string[]>;
            }
        }

        return filter;
    });

    additionalFilters = additionalFilters.map((filter) => {
        const paramValForFilter = filter.readStateFromUrlQueryParams(urlParams);
        if (paramValForFilter !== null) {
            if (["familyCategory", "phoneNumber", "email", "voucherNumber"].includes(filter.key)) {
                return {
                    ...filter,
                    state: paramValForFilter,
                } as ParcelsFilter<string>;
            }
        }

        return filter;
    });

    return { primaryFilters, additionalFilters };
};

export const buildQueryParamsFromFilters = (
    appliedFilters: ParcelsFilters
): UrlQueryParamsRecord => {
    let params: UrlQueryParamsRecord = {};

    appliedFilters.forEach((filter: ParcelsFiltersAllStates) => {
        params = { ...params, ...filter.generateUrlParam() };
    });

    return params;
};
