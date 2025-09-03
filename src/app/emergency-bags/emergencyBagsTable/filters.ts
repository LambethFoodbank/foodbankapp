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
import { buildServerSideTextFilter } from "@/components/Tables/TextFilter";
import { amountSearch, typeSearch } from "@/common/databaseFilters";
import { serverSideDateFilter } from "@/components/Tables/DateFilter";
import { getDbDate } from "@/common/format";
import { Dayjs } from "dayjs";

const emergencyBagTypeSearchMethod: EmergencyBagsFilterMethod<string> =
    typeSearch<DbEmergencyBagRow>("type");

const emergencyBagAmountSearchMethod: EmergencyBagsFilterMethod<bigint> =
    amountSearch<DbEmergencyBagRow>("amount");
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
        shouldPersistOnClear: true,
        isHidden: true,
        isHiddenInUrl: false,
    });
};

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
        buildServerSideTextFilter({
            key: "amount",
            label: "Amount",
            method: typeSearch<DbEmergencyBagRow>("type"),
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
            } else if (["type", "amount"].includes(filter.key)) {
                return {
                    ...filter,
                    state: paramValForFilter,
                } as EmergencyBagsFilter<string>;
            } else if (filter.key === "deliveryCollection") {
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
