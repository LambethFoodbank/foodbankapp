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
    const { error } = await supabase
        .from("clients")
        .update({ delivery_instructions: delivery_instructions })
        .eq("primary_key", clientId);

    if (error) {
        const logId = await logErrorReturnLogId("update client delivery instructions failed", {
            error,
        });
        return { error: { type: "updateDeliveryInstructionsFailed", logId } };
    }

    return { error: null };
};
