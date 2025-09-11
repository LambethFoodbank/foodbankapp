import { Supabase } from "@/supabaseUtils";
import { DatabaseError } from "../../errorClasses";
import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import { DbEmergencyBagRow } from "@/databaseUtils";
import {
    EmergencyBagsFilters,
    EmergencyBagsSortState,
    EmergencyBagsFiltersAllStates,
    GetDbEmergencyBagDataResult,
    GetEmergencyBagDataAndCountErrorType,
    EmergencyBagsTableRow,
    GetEmergencyBagDataAndIdsResult,
    EmergencyBagStatusesReturnType,
} from "./types";
import convertEmergencyBagDBtoEBRow from "./convertEmergencyBagDBtoEBRow";
import { defaultEmergencyBagsSort, defaultEmergencyBagsSortConfig } from "./sortableColumns";
import { DbQuery } from "@/components/Tables/Filters";

const getEmergencyBagsQuery = (
    supabase: Supabase,
    filters: EmergencyBagsFilters,
    sortState: EmergencyBagsSortState,
    selectString = "*"
): DbQuery<DbEmergencyBagRow> => {
    let query = supabase
        .from("emergency_bags_plus")
        .select(selectString) as DbQuery<DbEmergencyBagRow>;

    filters.forEach((filter: EmergencyBagsFiltersAllStates) => {
        // We know that filter.method and filter.state are compatible, but it doesn't work with filter defined
        // through interfaces. Ideally we would rewrite filters to be classes so it's all consistent.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = filter.method(query, filter.state as any);
    });

    if (sortState.sortEnabled && sortState.column.sortMethod) {
        query = sortState.column.sortMethod(sortState.sortDirection, query);
    } else {
        query = defaultEmergencyBagsSort(
            defaultEmergencyBagsSortConfig.defaultSortDirection,
            query
        );
    }

    query = query.order("emergency_bag_id");

    return query;
};

const fetchEmergencyBagsDbRows = async (
    supabase: Supabase,
    filters: EmergencyBagsFilters,
    sortState: EmergencyBagsSortState,
    abortSignal: AbortSignal,
    startIndex: number,
    endIndex: number
): Promise<GetDbEmergencyBagDataResult> => {
    let query = getEmergencyBagsQuery(supabase, filters, sortState);
    query = query.range(startIndex, endIndex);
    query = query.abortSignal(abortSignal);

    const { data, error } = (await query) as {
        data: DbEmergencyBagRow[];
        error: Error | null;
    };

    if (error) {
        const logId = abortSignal.aborted
            ? await logInfoReturnLogId("Aborted fetch: emergency bag table", {}, error)
            : await logErrorReturnLogId("Error with fetch: emergency bag table", {}, error);

        return {
            emergencyBags: null,
            error: {
                type: abortSignal.aborted ? "abortedFetch" : "failedToFetchEmergencyBagTable",
                logId,
            },
        };
    }

    return {
        emergencyBags: data,
        error: null,
    };
};

export const getEmergencyBagsTableDataAndAllIds = async (
    supabase: Supabase,
    filters: EmergencyBagsFilters,
    sortState: EmergencyBagsSortState,
    abortSignal: AbortSignal,
    startIndex: number,
    endIndex: number
): Promise<GetEmergencyBagDataAndIdsResult> => {
    const { emergencyBags, error: getDbEmergencyBagsError } = await fetchEmergencyBagsDbRows(
        supabase,
        filters,
        sortState,
        abortSignal,
        startIndex,
        endIndex
    );

    if (getDbEmergencyBagsError) {
        let errorType: GetEmergencyBagDataAndCountErrorType;
        switch (getDbEmergencyBagsError.type) {
            case "abortedFetch":
                errorType = "abortedFetch";
                break;
            case "failedToFetchEmergencyBagTable":
                errorType = "failedToFetchEmergencyBags";
                break;
        }

        return {
            data: null,
            error: {
                type: errorType,
                logId: getDbEmergencyBagsError.logId,
            },
        };
    }

    const { emergencyBagTableRows, error } = await convertEmergencyBagDBtoEBRow(emergencyBags);

    if (error) {
        return {
            data: null,
            error: {
                type: "failedToFetchEmergencyBags",
                logId: error.logId,
            },
        };
    }

    const allEmergencyBagIds = await getEmergencyBagIds(supabase, filters, sortState, abortSignal);

    return {
        data: {
            emergencyBagTableRows,
            allEmergencyBagIds,
        },
        error: null,
    };
};

export const getEmergencyBagIds = async (
    supabase: Supabase,
    filters: EmergencyBagsFilters,
    sortState: EmergencyBagsSortState,
    abortSignal: AbortSignal | null = null
): Promise<string[]> => {
    const query = getEmergencyBagsQuery(supabase, filters, sortState, "emergency_bag_id");

    if (abortSignal) {
        query.abortSignal(abortSignal);
    }

    const { data, error } = (await query) as {
        data: { emergency_bag_id: string }[];
        error: Error | null;
    };

    if (error) {
        if (abortSignal && abortSignal.aborted) {
            await logInfoReturnLogId("Aborted fetch: emergency bag IDs", {}, error);
            return [];
        } else {
            const logId = await logErrorReturnLogId("Error with fetch", {}, error);
            throw new DatabaseError("fetch", "emergency bags", logId);
        }
    }

    return data.map((emergencyBag) => emergencyBag.emergency_bag_id);
};

export const getEmergencyBagsByIds = async (
    supabase: Supabase,
    emergencyBagIds: string[]
): Promise<EmergencyBagsTableRow[]> => {
    const query = supabase
        .from("emergency_bags_plus")
        .select("*")
        .in("emergency_bags_id", emergencyBagIds) as DbQuery<DbEmergencyBagRow>;

    return runEmergencyBagsQueryAndConvertToEmergencyBagTableRows(query);
};

export const getEmergencyBagsByIdsWithFiltersAndSorting = async (
    supabase: Supabase,
    filters: EmergencyBagsFilters,
    sortState: EmergencyBagsSortState,
    emergencyBagIds: string[]
): Promise<EmergencyBagsTableRow[]> => {
    const query = getEmergencyBagsQuery(supabase, filters, sortState);
    if (emergencyBagIds) {
        query.in("emergency_bag_id", emergencyBagIds);
    }

    return runEmergencyBagsQueryAndConvertToEmergencyBagTableRows(query);
};

const runEmergencyBagsQueryAndConvertToEmergencyBagTableRows = async (
    query: DbQuery<DbEmergencyBagRow>
): Promise<EmergencyBagsTableRow[]> => {
    const { data, error } = (await query) as {
        data: DbEmergencyBagRow[];
        error: Error | null;
    };

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: emergency bag table", {}, error);
        throw new DatabaseError("fetch", "emergency bag table", logId);
    }

    const { emergencyBagTableRows, error: processEmergencyBagDataError } =
        await convertEmergencyBagDBtoEBRow(data);

    if (processEmergencyBagDataError) {
        throw new Error("Failed to process emergency bags.", {
            cause: processEmergencyBagDataError,
        });
    }
    return emergencyBagTableRows;
};

export const fetchEmergencyBagStatuses = async (): Promise<EmergencyBagStatusesReturnType> => {
    const { data: emergencyBagStatusesListData, error: statusOrderError } = await supabase
        .from("status_order")
        .select("event_name")
        .order("workflow_order");

    if (statusOrderError) {
        const logId = await logErrorReturnLogId("failed to fetch statuses", {
            error: statusOrderError,
        });
        return { data: null, error: { type: "failedToFetchStatuses", logId } };
    }

    const emergencyBagStatusesList = emergencyBagStatusesListData.map((status) => {
        return status.event_name;
    });

    return { data: emergencyBagStatusesList, error: null };
};
