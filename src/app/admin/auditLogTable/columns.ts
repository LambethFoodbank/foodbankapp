import { TableHeaders } from "@/components/Tables/materialTable/tableTypes";
import { AuditLogRow } from "./types";

export const auditLogTableHeaderKeysAndLabels: TableHeaders<AuditLogRow> = [
    ["action", "Action"],
    ["createdAt", "Time"],
    ["actorName", "User"],
    ["wasSuccess", "Success"],
    ["logId", "Error Log ID"],
];
