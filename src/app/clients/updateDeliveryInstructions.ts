import { logErrorReturnLogId } from "@/logger/logger";
import { sendAuditLog } from "@/server/auditLog";
import supabase from "@/supabaseClient";

type UpdateClientDeliveryInstructionsResponse =
    | { error: null }
    | { error: { type: "updateDeliveryInstructionsFailed"; logId: string } };

export const updateClientDeliveryInstructions = async (
    clientId: string,
    delivery_instructions: string | undefined
): Promise<UpdateClientDeliveryInstructionsResponse> => {
    const baseAuditLogProps = {
        action: "update client delivery instructions",
        clientId,
        content: { delivery_instructions: delivery_instructions, clientId },
    };

    const { error } = await supabase
        .from("clients")
        .update({ delivery_instructions: delivery_instructions })
        .eq("primary_key", clientId);

    if (error) {
        const logId = await logErrorReturnLogId("update client delivery instructions failed", {
            error,
        });
        await sendAuditLog({ ...baseAuditLogProps, wasSuccess: false, logId });
        return { error: { type: "updateDeliveryInstructionsFailed", logId } };
    }

    await sendAuditLog({ ...baseAuditLogProps, wasSuccess: true });
    return { error: null };
};
