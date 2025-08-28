import { logErrorReturnLogId } from "@/logger/logger";
import { Supabase } from "@/supabaseUtils";
import { AuditLogCountResponse, AuditLogResponse, AuditLogSortState } from "./types";
import { DbQuery } from "@/components/Tables/Filters";
import { DbAuditLogRow } from "@/databaseUtils";

export const fetchAuditLog = async (
    supabase: Supabase,
    startIndex: number,
    endIndex: number,
    sortState: AuditLogSortState
): Promise<AuditLogResponse> => {
    let query = supabase
        .from("audit_log_plus")
        .select("*")
        .range(startIndex, endIndex) as DbQuery<DbAuditLogRow>;

    if (sortState.sortEnabled && sortState.column.sortMethod) {
        query = sortState.column.sortMethod(sortState.sortDirection, query);
    } else {
        query.order("created_at", { ascending: false });
    }

    const { data: auditLogs, error } = (await query) as {
        data: DbAuditLogRow[];
        error: Error | null;
    };

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Audit Log", {
            error: error,
        });
        return { data: null, error: { type: "failedAuditLogFetch", logId: logId } };
    }

    return { data: auditLogs, error: null };
};

export const fetchAuditLogCount = async (supabase: Supabase): Promise<AuditLogCountResponse> => {
    const { count, error } = await supabase
        .from("audit_log")
        .select("*", { count: "exact", head: true });

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Audit Log Count", {
            error: error,
        });
        return { count: null, error: { type: "failedAuditLogCountFetch", logId: logId } };
    }

    if (count === null) {
        const logId = await logErrorReturnLogId("Error with fetch: Audit Log Count", {
            error: "nullCount",
        });
        return { count: null, error: { type: "nullCount", logId: logId } };
    }

    return { count: count, error: null };
};
