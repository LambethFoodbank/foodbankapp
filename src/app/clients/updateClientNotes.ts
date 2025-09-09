import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import { sendAuditLog } from "@/server/auditLog";
import supabase from "@/supabaseClient";

type UpdateClientNotesResponse =
    | { error: null }
    | { error: { type: "updateNotesFailed"; logId: string } }
    | { error: { type: "concurrentEdit" } };

export const updateClientNotes = async (
    clientId: string,
    notes: string | null,
    lastUpdated: string | undefined
): Promise<UpdateClientNotesResponse> => {
    const baseAuditLogProps = {
        action: "update client notes",
        clientId,
        content: { notes: notes, clientId },
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
        return { error: { type: "concurrentEdit" } };
    }

    await sendAuditLog({ ...baseAuditLogProps, wasSuccess: true });
    return { error: null };
};
