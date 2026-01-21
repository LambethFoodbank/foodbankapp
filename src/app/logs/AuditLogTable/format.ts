import { capitaliseWords, formatBooleanOrNull, formatDateTime } from "@/common/format";
import { UserRole } from "@/databaseUtils";
import { AuditLogError, AuditLogCountError } from "./types";

export const auditLogTableColumnDisplayFunctions = {
    createdAt: formatDateTime,
    wasSuccess: formatBooleanOrNull,
};

export const getAuditLogErrorMessage = (error: AuditLogError | AuditLogCountError): string => {
    let errorMessage = "";
    switch (error.type) {
        case "failedAuditLogFetch":
            errorMessage = "Failed to fetch audit log.";
            break;
        case "failedAuditLogCountFetch":
            errorMessage = "Failed to fetch audit log count.";
            break;
        case "nullCount":
            errorMessage = "Audit log table empty.";
    }
    return `${errorMessage} Log ID: ${error.logId}`;
};

export const profileDisplayNameForDeletedUser = (role: UserRole | null): string =>
    `Deleted User ${role && `- ${capitaliseWords(role)}`}`;
