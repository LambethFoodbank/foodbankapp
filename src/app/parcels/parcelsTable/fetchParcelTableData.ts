import { Supabase } from "@/supabaseUtils";
import { AbortError, DatabaseError, EdgeFunctionError } from "../../errorClasses";
import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import { DbParcelRow } from "@/databaseUtils";
import {
    ParcelsFilters,
    ParcelsSortState,
    GetDbParcelDataResult,
    GetParcelDataAndCountResult,
    GetParcelDataAndCountErrorType,
    ParcelsTableRow,
    ParcelStatusesReturnType,
    FetchClientIdResult,
    ParcelPostcodeResult,
    ParcelsFiltersAllStates,
} from "./types";
import { checkForCongestionCharge, CongestionChargeReturnType } from "@/common/congestionCharges";
import convertParcelDbtoParcelRow from "./convertParcelDBtoParcelRow";
import { StatusType } from "@/app/parcels/ActionBar/saveStatus";
import { defaultParcelsSort, defaultParcelsSortConfig } from "./sortableColumns";
import { DbQuery } from "@/components/Tables/Filters";

const getCongestionChargeDetailsForParcelsTable = async (
    processingData: DbParcelRow[]
): Promise<CongestionChargeReturnType> => {
    const postcodes = [];
    for (const parcel of processingData) {
        postcodes.push(parcel.client_address_postcode);
    }

    return await checkForCongestionCharge(postcodes);
};

const getParcelsQuery = (
    supabase: Supabase,
    filters: ParcelsFilters,
    sortState: ParcelsSortState
): DbQuery<DbParcelRow> => {
    let query = supabase.from("parcels_plus").select("*") as DbQuery<DbParcelRow>;

    filters.forEach((filter: ParcelsFiltersAllStates) => {
        // We know that filter.method and filter.state are compatible, but it doesn't work with filter defined
        // through interfaces. Ideally we would rewrite filters to be classes so it's all consistent.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = filter.method(query, filter.state as any);
    });

    if (sortState.sortEnabled && sortState.column.sortMethod) {
        query = sortState.column.sortMethod(sortState.sortDirection, query);
    } else {
        query = defaultParcelsSort(defaultParcelsSortConfig.defaultSortDirection, query);
    }

    query = query.order("parcel_id");

    return query;
};

const fetchParcelsDbRows = async (
    supabase: Supabase,
    filters: ParcelsFilters,
    sortState: ParcelsSortState,
    abortSignal: AbortSignal,
    startIndex: number,
    endIndex: number
): Promise<GetDbParcelDataResult> => {
    let query = getParcelsQuery(supabase, filters, sortState);
    query = query.range(startIndex, endIndex);
    query = query.abortSignal(abortSignal);

    const { data, error } = (await query) as {
        data: DbParcelRow[];
        error: Error | null;
    };

    if (error) {
        const logId = abortSignal.aborted
            ? await logInfoReturnLogId("Aborted fetch: parcel table", {}, error)
            : await logErrorReturnLogId("Error with fetch: parcel table", {}, error);

        return {
            parcels: null,
            error: {
                type: abortSignal.aborted ? "abortedFetch" : "failedToFetchParcelTable",
                logId,
            },
        };
    }

    return {
        parcels: data,
        error: null,
    };
};

export const getParcelsDataAndCount = async (
    supabase: Supabase,
    filters: ParcelsFilters,
    sortState: ParcelsSortState,
    abortSignal: AbortSignal,
    startIndex: number,
    endIndex: number
): Promise<GetParcelDataAndCountResult> => {
    const { parcels, error: getDbParcelsError } = await fetchParcelsDbRows(
        supabase,
        filters,
        sortState,
        abortSignal,
        startIndex,
        endIndex
    );

    if (getDbParcelsError) {
        let errorType: GetParcelDataAndCountErrorType;
        switch (getDbParcelsError.type) {
            case "abortedFetch":
                errorType = "abortedFetch";
                break;
            case "failedToFetchParcelTable":
                errorType = "failedToFetchParcels";
                break;
        }

        return {
            data: null,
            error: {
                type: errorType,
                logId: getDbParcelsError.logId,
            },
        };
    }

    const { data: congestionChargeData, error: congestionChargeError } =
        await getCongestionChargeDetailsForParcelsTable(parcels);

    if (congestionChargeError) {
        return {
            data: null,
            error: congestionChargeError,
        };
    }

    const { parcelTableRows, error } = await convertParcelDbtoParcelRow(
        parcels,
        congestionChargeData
    );

    if (error) {
        switch (error.type) {
            case "invalidInputLengths":
                return {
                    data: null,
                    error: {
                        type: "unknownError",
                        logId: error.logId,
                    },
                };
        }
    }

    const count = await getParcelsCount(supabase, filters, abortSignal);

    return {
        data: {
            parcelTableRows,
            count,
        },
        error: null,
    };
};

const getParcelsCount = async (
    supabase: Supabase,
    filters: ParcelsFilters,
    abortSignal: AbortSignal
): Promise<number> => {
    let query = supabase
        .from("parcels_plus")
        .select("*", { count: "exact", head: true }) as DbQuery<DbParcelRow>;

    filters.forEach((filter: ParcelsFiltersAllStates) => {
        // We know that filter.method and filter.state are compatible, but it doesn't work with filter defined
        // through interfaces. Ideally we would rewrite filters to be classes so it's all consistent.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = filter.method(query, filter.state as any);
    });

    query = query.abortSignal(abortSignal);

    const { count, error } = await query;

    if (error) {
        const logId = abortSignal.aborted
            ? await logInfoReturnLogId("Aborted fetch: parcel table count", error)
            : await logErrorReturnLogId("Error with fetch: parcel table count", error);
        if (abortSignal.aborted) {
            throw new AbortError("fetch", "parcel table", logId);
        }

        throw new DatabaseError("fetch", "parcel table", logId);
    }

    if (count === null) {
        const logId = await logErrorReturnLogId("Error with fetch: Parcels, count is null");
        throw new DatabaseError("fetch", "parcels", logId);
    }
    return count;
};

export const getParcelIds = async (
    supabase: Supabase,
    filters: ParcelsFilters,
    sortState: ParcelsSortState
): Promise<string[]> => {
    const query = getParcelsQuery(supabase, filters, sortState);

    const { data, error } = (await query) as {
        data: DbParcelRow[];
        error: Error | null;
    };
    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch", {}, error);
        throw new DatabaseError("fetch", "parcels", logId);
    }

    return data.reduce<string[]>((reducedData, parcel) => {
        parcel.parcel_id && reducedData.push(parcel.parcel_id);
        return reducedData;
    }, []);
};

export const getParcelsByIds = async (
    supabase: Supabase,
    parcelIds: string[]
): Promise<ParcelsTableRow[]> => {
    const query = supabase
        .from("parcels_plus")
        .select("*")
        .in("parcel_id", parcelIds) as DbQuery<DbParcelRow>;

    return runParcelsQueryAndConvertToParcelTableRows(query);
};

export const getParcelsByIdsWithFiltersAndSorting = async (
    supabase: Supabase,
    filters: ParcelsFilters,
    sortState: ParcelsSortState,
    parcelIds: string[]
): Promise<ParcelsTableRow[]> => {
    const query = getParcelsQuery(supabase, filters, sortState);
    if (parcelIds) {
        query.in("parcel_id", parcelIds);
    }

    return runParcelsQueryAndConvertToParcelTableRows(query);
};

const runParcelsQueryAndConvertToParcelTableRows = async (
    query: DbQuery<DbParcelRow>
): Promise<ParcelsTableRow[]> => {
    const { data, error } = (await query) as {
        data: DbParcelRow[];
        error: Error | null;
    };
    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: parcel table", {}, error);
        throw new DatabaseError("fetch", "parcel table", logId);
    }

    const { data: congestionChargeDetails, error: congestionChargeError } =
        await getCongestionChargeDetailsForParcelsTable(data);

    if (congestionChargeError) {
        const logId = await logErrorReturnLogId(
            "Error retrieving congestion charge details",
            congestionChargeError
        );
        throw new EdgeFunctionError("congestion charge check", logId);
    }

    const { parcelTableRows, error: processParcelDataError } = await convertParcelDbtoParcelRow(
        data,
        congestionChargeDetails
    );

    if (processParcelDataError) {
        throw new Error("Failed to process parcels.", { cause: processParcelDataError });
    }

    return parcelTableRows;
};

export const fetchParcelStatuses = async (): Promise<ParcelStatusesReturnType> => {
    const { data: parcelStatusesListData, error: statusOrderError } = await supabase
        .from("status_order")
        .select("event_name")
        .order("workflow_order");

    if (statusOrderError) {
        const logId = await logErrorReturnLogId("failed to fetch statuses", {
            error: statusOrderError,
        });
        return { data: null, error: { type: "failedToFetchStatuses", logId } };
    }

    const parcelStatusesList = parcelStatusesListData.map((status) => {
        return status.event_name;
    });

    return { data: parcelStatusesList, error: null };
};

export const getClientIdAndIsActive = async (parcelId: string): Promise<FetchClientIdResult> => {
    const { data, error } = await supabase
        .from("parcels")
        .select("client_id, client:clients(is_active)")
        .eq("primary_key", parcelId)
        .single();

    if (error) {
        const message = `Failed to fetch client ID and is active for a parcel with ID ${parcelId}`;
        const logId = await logErrorReturnLogId(message, { error });
        return { data: null, error: { type: "failedClientIdAndIsActiveFetch", logId } };
    }

    if (data.client === null) {
        const message = `Failed to find matching client for a parcel with ID ${parcelId}`;
        const logId = await logErrorReturnLogId(message, { error });
        return { data: null, error: { type: "noMatchingClient", logId } };
    }

    return {
        data: { clientId: data.client_id, isClientActive: data?.client?.is_active },
        error: null,
    };
};

export const getParcelPostcodesByEvent = async (
    targetEventName: StatusType,
    parcelIds: string[]
): Promise<ParcelPostcodeResult> => {
    const { data, error } = await supabase
        .from("parcels_plus")
        .select("client_address_postcode, events!inner(new_parcel_status)")
        .in("parcel_id", parcelIds)
        .eq("events.new_parcel_status", targetEventName);

    if (error) {
        const logId = await logErrorReturnLogId("Failed to fetch parcels with events", error);
        return { postcodes: null, error: { type: "failedToFetchParcelTable", logId: logId } };
    }

    const postcodes = data.map((parcel) => parcel.client_address_postcode);
    const uniquePostcodes = Array.from(new Set(postcodes));

    return { postcodes: uniquePostcodes, error: null };
};
