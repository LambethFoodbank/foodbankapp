import { logErrorReturnLogId } from "@/logger/logger";
import { sendAuditLog } from "@/server/auditLog";
import supabase from "@/supabaseClient";
import { getClientParcelsDetails } from "./getClientParcelsData";

type DeleteClientErrorType = "failedClientDeletion";
export interface DeleteClientError {
    type: DeleteClientErrorType;
    logId: string;
}
type DeleteClientResponse = { error: DeleteClientError | null };

const deleteClient = async (clientId: string): Promise<DeleteClientResponse> => {
    const { error: deleteClientError } = await supabase.rpc("deactivateClient", {
        clientid: clientId,
    });

    getClientParcelsDetails(clientId);

    const baseAuditLogProps = {
        action: "delete a client",
        clientId,
        content: { clientId },
    };

    if (deleteClientError) {
        const logId = await logErrorReturnLogId(`error with delete: client ${clientId}`, {
            error: deleteClientError,
        });
        await sendAuditLog({ ...baseAuditLogProps, wasSuccess: false, logId });
        return { error: { type: "failedClientDeletion", logId } };
    }

    await sendAuditLog({ ...baseAuditLogProps, wasSuccess: true });
    return { error: null };
};

export default deleteClient;
