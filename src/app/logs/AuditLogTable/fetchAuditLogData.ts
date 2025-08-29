import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import { Supabase } from "@/supabaseUtils";
import { DatabaseError} from "../../errorClasses";
import { GetAuditLogDataAndIdsResult, AuditLogSortState, GetAuditLogDataResult, AuditLogErrorType, convertAuditLogPlusRowsToAuditLogRows, AuditLogRow } from "./types";
import { DbQuery } from "@/components/Tables/Filters";
import { DbAuditLogRow } from "@/databaseUtils";
import { defaultAuditLogSort, defaultAuditLogSortConfig } from "./sortFunctions";

const getAuditLogQuery = (
    supabase: Supabase,
    sortState: AuditLogSortState,
    selectString = "*"
): DbQuery<DbAuditLogRow> => {
    let query = supabase.from("audit_log_plus").select(selectString) as DbQuery<DbAuditLogRow>;

    if (sortState.sortEnabled && sortState.column.sortMethod) {
        query = sortState.column.sortMethod(sortState.sortDirection, query);
    } else{
        query = defaultAuditLogSort(defaultAuditLogSortConfig.defaultSortDirection, query);
    }

    query = query.order("log_id"); // maybe comment this

    return query;
}

const fetchAuditLogDbRows = async (
    supabase: Supabase,
    sortState: AuditLogSortState,
    abortSignal: AbortSignal,
    startIndex: number,
    endIndex: number
): Promise<GetAuditLogDataResult> => {
    let query = getAuditLogQuery(supabase, sortState);
    query = query.range(startIndex, endIndex);
    query = query.abortSignal(abortSignal);

    const { data, error } = (await query) as {
        data: DbAuditLogRow[];
        error: Error | null;
    };

    console.log(error);

    if (error) {
        const logId = abortSignal.aborted
            ? await logInfoReturnLogId("Aborted fetch: audit log table", {}, error)
            : await logErrorReturnLogId("Error with fetch: audit log table", {}, error);
        return {
            logs: null,
            error: {
                type: abortSignal.aborted ? "abortedFetch" : "failedToFetchAuditLogTable",
                logId,
            },
        };
    }
    return {
        logs: data,
        error: null,
    };
};

export const getAuditLogTableDataAndAllIds = async (
    supabase: Supabase,
    sortState: AuditLogSortState,
    abortSignal: AbortSignal,
    startIndex: number,
    endIndex: number,
): Promise<GetAuditLogDataAndIdsResult> => {
    const { logs, error: getDbLogsError} = await fetchAuditLogDbRows(
        supabase,
        sortState,
        abortSignal,
        startIndex,
        endIndex
    );

    if (getDbLogsError) {
        let errorType: AuditLogErrorType;
        switch (getDbLogsError.type) {
            case "abortedFetch":
                errorType = "abortedFetch";
                break;
            case "failedToFetchAuditLogTable":
                errorType = "failedToFetchAuditLogs";
                break;
        }

        return {
            data: null,
            error: {
                type: errorType,
                logId: getDbLogsError.logId,
            },
        };
    }

    const allAuditLogIds = await getAuditLogIds(supabase, sortState, abortSignal);

    const auditLogTableRows = convertAuditLogPlusRowsToAuditLogRows(logs);

    return {
        data: {
            auditLogTableRows: auditLogTableRows,
            allAuditLogIds: allAuditLogIds,
        },
        error: null,
    };
};

export const getAuditLogIds = async (
    supabase: Supabase,
    sortState: AuditLogSortState,
    abortSignal: AbortSignal | null = null
): Promise<string[]> => {
    const query = getAuditLogQuery(supabase, sortState, "log_id");

    if (abortSignal) {
        query.abortSignal(abortSignal);
    }

    const { data, error } = (await query) as {
        data: { log_id: string }[];
        error: Error | null;
    };

    if (error) {
        if (abortSignal && abortSignal.aborted) {
            await logInfoReturnLogId("Aborted fetch: audit log IDs", {}, error);
            return [];
        } else {
            const logId = await logErrorReturnLogId("Error with fetch", {}, error);
            throw new DatabaseError("fetch", "audit logs", logId);
        }
    }

    return data.map((log) => log.log_id);
};

export const getAuditLogByIds = async (
    supabase: Supabase,
    auditLogIds: string[]
): Promise<AuditLogRow[]> => {
    const query = supabase
        .from("audit_log_plus")
        .select("*")
        .in("log_id", auditLogIds) as DbQuery<DbAuditLogRow>;

    return runAuditLogQueryAndConvertToAuditLogRows(query);
};

const runAuditLogQueryAndConvertToAuditLogRows = async (
    query: DbQuery<DbAuditLogRow>
): Promise<AuditLogRow[]> => {
    const { data, error } = (await query) as {
        data: DbAuditLogRow[];
        error: Error | null;
    };
    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: audit log table", {}, error);
        throw new DatabaseError("fetch", "audit log table", logId);
    }

    const auditLogTableRows = convertAuditLogPlusRowsToAuditLogRows(data);
    return auditLogTableRows;
};