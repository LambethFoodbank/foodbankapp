import { TableHeaders } from "@/components/Tables/Table";
import { AuditLogRow } from "./types";

export const auditLogTableHeaderKeysAndLabels: TableHeaders<AuditLogRow> = [
    ["action", "Action"],
    ["createdAt", "Time"],
    ["actorName", "User"],
    ["wasSuccess", "Success"],
    ["auditLogId", "Error Log ID"],
];
