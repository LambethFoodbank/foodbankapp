import { SortOptions } from "@/components/Tables/Table";
import { AuditLogRow, AuditLogSortMethod } from "./types";

export const auditLogTableSortableColumns: SortOptions<AuditLogRow, AuditLogSortMethod>[] = [
    {
        key: "action",
        sortMethod: (sortDirection, query) =>
            query.order("action", { ascending: sortDirection === "asc" }),
    },
    {
        key: "createdAt",
        sortMethod: (sortDirection, query) =>
            query.order("created_at", { ascending: sortDirection === "asc" }),
    },
    {
        key: "actorName",
        sortMethod: (sortDirection, query) =>
            query.order("actor_name", { ascending: sortDirection === "asc" }),
    },
    {
        key: "wasSuccess",
        sortMethod: (sortDirection, query) =>
            query.order("wasSuccess", { ascending: sortDirection === "asc" }),
    },
    {
        key: "logId",
        sortMethod: (sortDirection, query) =>
            query.order("log_id", { ascending: sortDirection === "asc" }),
    },
];
