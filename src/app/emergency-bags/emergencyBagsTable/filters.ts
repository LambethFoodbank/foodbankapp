"use client";

import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import { DatabaseError } from "@/app/errorClasses";
import { serverSideChecklistFilter } from "@/components/Tables/ChecklistFilter";
import {
    CollectionCentresOptions,
    EmergencyBagsFilter,
    EmergencyBagsFilterMethod,
    EmergencyBagsFilters,
    EmergencyBagsFiltersAllStates,
    EmergencyBagsTableRow,
} from "./types";
import { UrlQueryParamsRecord } from "@/common/urlQueryParams";
import { DbEmergencyBagRow } from "@/databaseUtils";
import { pageViewTypeQueryParam } from "@/common/constants";
import { ParcelsFilters } from "@/app/parcels/parcelsTable/types";
import { buildServerSideTextFilter } from "@/components/Tables/TextFilter";
import { typeSearch } from "@/common/databaseFilters";
import { serverSideDateFilter } from "@/components/Tables/DateFilter";
import { getDbDate } from "@/common/format";
import { Dayjs } from "dayjs";

const emergencyBagTypeSearchMethod: EmergencyBagsFilterMethod<string> =
    typeSearch<DbEmergencyBagRow>("type");

const buildDeliveryCollectionFilter = async (): Promise<EmergencyBagsFilter<string[]>> => {
    const deliveryCollectionSearch: EmergencyBagsFilterMethod<string[]> = (query, state) => {
        return state.length === 0 ? query : query.in("collection_centre_acronym", state);
    };

    const { data: collection_centres, error } = await supabase
        .from("collection_centres")
        .select("name, acronym, is_shown, is_delivery")
        .eq("is_delivery", false);
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

    return serverSideChecklistFilter<EmergencyBagsTableRow, DbEmergencyBagRow>({
        key: "deliveryCollection",
        filterLabel: "Hub",
        itemLabelsAndKeys: optionsSet.map((option) => [option.value, option.key]),
        initialCheckedKeys: [],
        method: deliveryCollectionSearch,
    });
};

const buildHiddenDateFilter = (
    initialState: DateRangeState
): EmergencyBagsFilter<DateRangeState> => {
    const dateSearch: EmergencyBagsFilterMethod<DateRangeState> = (query, state) => {
        return query
            .gte("packing_date", getDbDate(state.from))
            .lte("packing_date", getDbDate(state.to));
    };

    return serverSideDateFilter<EmergencyBagsTableRow, DbEmergencyBagRow>({
        key: "packingDate",
        label: "",
        method: dateSearch,
        initialState: initialState,
        isHidden: true,
        isHiddenInUrl: false,
    });
};
//
// const buildLastStatusFilter = async (): Promise<EmergencyBagsFilter<string[]>> => {
//     const labelForNoStatus = "No Status";
//
//     const lastStatusSearch: EmergencyBagsFilterMethod<string[]> = (query, state) => {
//         if (state.length === 0) {
//             // Default is to show everything that's not deleted
//             return query.or(
//                 // eslint-disable-next-line quotes
//                 'last_status_event_name.neq."Emergency Bag Deleted",last_status_event_name.is.null'
//             );
//         } else if (state.includes(labelForNoStatus)) {
//             return query.or(
//                 `last_status_event_name.is.null,last_status_event_name.in.("",${state.join(",")})`
//             );
//         } else {
//             return query.in("last_status_event_name", state);
//         }
//     };
//
//     const keySet = new Set();
//     const { data, error } = await supabase.from("status_order").select("event_name");
//     if (error) {
//         const logId = await logErrorReturnLogId("Error with fetch: Last status filter options");
//         throw new DatabaseError("fetch", "last status filter options", logId);
//     }
//     const optionsResponse = data ?? [];
//     const optionsSet: string[] = optionsResponse.reduce<string[]>((filteredOptions, row) => {
//         if (row.event_name && !keySet.has(row.event_name)) {
//             keySet.add(row.event_name);
//             filteredOptions.push(row.event_name);
//         }
//         return filteredOptions.sort();
//     }, []);
//     data && optionsSet.push(labelForNoStatus);
//
//     return serverSideChecklistFilter<EmergencyBagsTableRow, DbEmergencyBagRow>({
//         key: "lastStatus",
//         filterLabel: "Status",
//         itemLabelsAndKeys: optionsSet.map((value) => [value, value]),
//         initialCheckedKeys: [],
//         method: lastStatusSearch,
//     });
// };

export const buildEmergencyBagFilters = async (
    today: Dayjs
): Promise<{
    primaryFilters: EmergencyBagsFilters;
    additionalFilters: EmergencyBagsFilters;
}> => {
    const primaryFilters: EmergencyBagsFilters = [
        buildHiddenDateFilter({ from: today, to: today }),
        buildServerSideTextFilter({
            key: "type",
            label: "Type",
            method: emergencyBagTypeSearchMethod,
        }),
        await buildDeliveryCollectionFilter(),
    ];

    const additionalFilters: EmergencyBagsFilters = [];
    return { primaryFilters: primaryFilters, additionalFilters: additionalFilters };
};

export const updateEmergencyBagFiltersFromQueryParams = (
    urlParams: UrlQueryParamsRecord,
    primaryFilters: EmergencyBagsFilters,
    additionalFilters: EmergencyBagsFilters
): {
    primaryFilters: EmergencyBagsFilters;
    additionalFilters: EmergencyBagsFilters;
} => {
    primaryFilters = primaryFilters.map((filter) => {
        const paramValForFilter = filter.readStateFromUrlQueryParams(urlParams);
        if (paramValForFilter !== null) {
            if (filter.key === "packingDate") {
                return {
                    ...filter,
                    state: paramValForFilter,
                } as EmergencyBagsFilter<DateRangeState>;
            } else if (
                ["fullName", "addressPostcode", pageViewTypeQueryParam].includes(filter.key)
            ) {
                return {
                    ...filter,
                    state: paramValForFilter,
                } as EmergencyBagsFilter<string>;
            } else if (["deliveryCollection", "packingSlot"].includes(filter.key)) {
                return {
                    ...filter,
                    state: paramValForFilter,
                } as EmergencyBagsFilter<string[]>;
            }
        }

        return filter;
    });

    additionalFilters = additionalFilters.map((filter) => {
        const paramValForFilter = filter.readStateFromUrlQueryParams(urlParams);
        if (paramValForFilter !== null) {
            if (["lastStatus"].includes(filter.key)) {
                return {
                    ...filter,
                    state: paramValForFilter,
                } as EmergencyBagsFilter<string>;
            }
        }

        return filter;
    });

    return { primaryFilters, additionalFilters };
};

export const buildQueryParamsFromEmergencyBagFilters = (
    appliedFilters: EmergencyBagsFilters
): UrlQueryParamsRecord => {
    let params: UrlQueryParamsRecord = {};

    appliedFilters.forEach((filter: EmergencyBagsFiltersAllStates) => {
        params = { ...params, ...filter.generateUrlParam() };
    });

    return params;
};
