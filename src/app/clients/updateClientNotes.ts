import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import { sendAuditLog } from "@/server/auditLog";
import supabase from "@/supabaseClient";
import { fetchClient } from "../logs/fetchForAuditLog";

type UpdateClientNotesResponse =
    | { error: null }
    | { error: { type: "updateNotesFailed"; logId: string } };

export const updateClientNotes = async (
    clientId: string,
    notes: string | null,
    lastUpdated: string | undefined
): Promise<UpdateClientNotesResponse> => {
    const { data: oldRow, error: fetchOldRowError } = await fetchClient(clientId);

    if (fetchOldRowError) {
        const logId = fetchOldRowError.logId;
        await sendAuditLog({
            content: {
                before: {},
                after: {},
                actionType: "Edit",
            },
            action: "update client notes",
            wasSuccess: false,
            logId,
        });
        return { error: { type: "updateNotesFailed", logId } };
    }
    const baseAuditLogProps = {
        action: "update client notes",
        clientId,
        content: {
            before: { notes: oldRow.notes ?? "" },
            after: { notes: notes },
            actionType: "Edit",
        },
    };

    const { error, count } = await supabase
        .from("clients")
        .update({ notes: notes }, { count: "exact" })
        .eq("primary_key", clientId)
        .eq("last_updated", lastUpdated);

    if (error) {
        const logId = await logErrorReturnLogId("update client notes failed", { error });
        await sendAuditLog({ ...baseAuditLogProps, wasSuccess: false, logId });
        return { error: { type: "updateNotesFailed", logId } };
    }

    if (count === 0) {
        const logId = await logWarningReturnLogId("Concurrent editing of parcel");
        await sendAuditLog({ ...baseAuditLogProps, wasSuccess: false, logId });
        return { error: { type: "updateNotesFailed", logId } };
    }

    await sendAuditLog({ ...baseAuditLogProps, wasSuccess: true });
    return { error: null };
};
