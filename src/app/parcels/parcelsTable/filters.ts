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
    ParcelsTableRow,
    packingSlotOptionsSet,
} from "./types";
import { buildServerSideTextFilter } from "@/components/Tables/TextFilter";
import dayjs from "dayjs";
import { parcelTableHeaderKeysAndLabels } from "./headers";
import { DbParcelRow } from "@/databaseUtils";
import {
    dbFilterWithSubstringQueries,
    familySearch,
    fullNameSearch,
    phoneSearch,
    postcodeSearch,
} from "@/common/databaseFilters";

const parcelsFullNameSearch: ParcelsFilterMethod<string> = fullNameSearch<DbParcelRow>(
    "client_full_name",
    "client_is_active"
);

const parcelsPostcodeSearch: ParcelsFilterMethod<string> = postcodeSearch<DbParcelRow>(
    "client_address_postcode",
    "client_is_active"
);

const parcelsFamilySearch: ParcelsFilterMethod<string> = familySearch(
    "family_count",
    "client_is_active"
);

const parcelsPhoneSearch: ParcelsFilterMethod<string> = phoneSearch<DbParcelRow>(
    "client_phone_number",
    "client_is_active"
);

const voucherSearch: ParcelsFilterMethod<string> = dbFilterWithSubstringQueries<DbParcelRow>(
    (substring) => {
        const voucherColumnLabel = "voucher_number";
        if (substring === "?") {
            return `${voucherColumnLabel}.ilike.""`;
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
        filterLabel: "Last Status",
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
        filterLabel: "Packing Slot",
        itemLabelsAndKeys: optionsSet.map((option) => [option.value, option.key]),
        initialCheckedKeys: [],
        method: packingSlotSearch,
    });
};

const buildFilters = async (): Promise<{
    primaryFilters: ParcelsFilters;
    additionalFilters: ParcelsFilters;
}> => {
    const today = dayjs();
    const dateFilter = buildDateFilter({
        from: today,
        to: today,
    });
    const primaryFilters: ParcelsFilters = [
        dateFilter,
        buildServerSideTextFilter({
            key: "fullName",
            label: "Name",
            headers: parcelTableHeaderKeysAndLabels,
            method: parcelsFullNameSearch,
        }),
        buildServerSideTextFilter({
            key: "addressPostcode",
            label: "Postcode",
            headers: parcelTableHeaderKeysAndLabels,
            method: parcelsPostcodeSearch,
        }),
        await buildDeliveryCollectionFilter(),
        await buildPackingSlotFilter(),
        await buildLastStatusFilter(),
    ];

    const additionalFilters: ParcelsFilters = [
        buildServerSideTextFilter({
            key: "familyCategory",
            label: "Family",
            headers: parcelTableHeaderKeysAndLabels,
            method: parcelsFamilySearch,
        }),
        buildServerSideTextFilter({
            key: "phoneNumber",
            label: "Phone",
            headers: parcelTableHeaderKeysAndLabels,
            method: parcelsPhoneSearch,
        }),
        buildServerSideTextFilter({
            key: "voucherNumber",
            label: "Voucher",
            headers: parcelTableHeaderKeysAndLabels,
            method: voucherSearch,
        }),
    ];
    return { primaryFilters: primaryFilters, additionalFilters: additionalFilters };
};

export default buildFilters;
