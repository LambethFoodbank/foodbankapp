import { FetchParcelError, fetchParcel } from "@/common/fetch";
import { UpdateParcelError } from "../../form/submitFormHelpers";
import { ParcelsTableRow } from "../../parcelsTable/types";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { fetchPackingDateOrSlot, getBeforeAndAfter } from "@/app/logs/fetchForAuditLog";

export const getUpdateErrorMessage = ({
    parcelId,
    error,
}: {
    parcelId: string | null;
    error: FetchParcelError | UpdateParcelError | null;
}): string | undefined => {
    let errorMessage = "";
    switch (error?.type) {
        case "noMatchingParcels":
            errorMessage = "No parcel in the database matches the selected parcel.";
            break;
        case "failedToFetchParcel":
            errorMessage = "Failed to fetch parcel data.";
            break;
        case "failedToUpdateParcel":
            errorMessage = "Failed to fetch packing slots data.";
            break;
        case "concurrentUpdateConflict":
            errorMessage = "Record has been edited recently - please refresh the page.";
            break;
    }
    if (errorMessage === "") {
        return;
    }
    return `${errorMessage} Parcel Id: ${parcelId} Log Id: ${error?.logId}`;
};

export type UpdateField = "packingDate" | "packingSlot";

export const packingDateOrSlotUpdate = async (
    updateField: UpdateField,
    packingDateOrSlotData: string,
    parcel: ParcelsTableRow
): Promise<{
    parcelId: string | null;
    error: FetchParcelError | UpdateParcelError | null;
}> => {
    type FieldToUpdate = {
        packing_date?: string;
        packing_slot?: string;
    };

    const { data: values, error: fetchOldRowError } = await fetchPackingDateOrSlot(parcel, packingDateOrSlotData, updateField);

    const packingDateOrSlotDbUpdate = async (
        fieldToUpdate: FieldToUpdate
    ): Promise<PostgrestSingleResponse<null>> => {
        return supabase
            .from("parcels")
            .update(fieldToUpdate, { count: "exact" })
            .eq("primary_key", parcel.parcelId);
    };

    let updateResponse: PostgrestSingleResponse<null>;
    let action: string;

    switch (updateField) {
        case "packingDate":
            updateResponse = await packingDateOrSlotDbUpdate({
                packing_date: packingDateOrSlotData,
            });
            action = "change packing date";
            break;
        case "packingSlot":
            updateResponse = await packingDateOrSlotDbUpdate({
                packing_slot: packingDateOrSlotData,
            });
            action = "change packing slot";
            break;
    }

    const auditLog = {
        action: action,
        content: {
            before: { [updateField]: values?.oldValue },
            after: { [updateField]: values?.newValue },
            count: updateResponse.count
        },
        clientId: parcel.clientId,
        parcelId: parcel.parcelId,
    } as const satisfies Partial<AuditLog>;

    if (updateResponse.error) {
        const logId = await logErrorReturnLogId(
            "Error with update: parcel data",
            updateResponse.error
        );
        await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
        return {
            parcelId: null,
            error: { type: "failedToUpdateParcel", logId } as UpdateParcelError,
        };
    }

    if (updateResponse.count === 0) {
        const logId = await logWarningReturnLogId("Concurrent editing of parcel");
        await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
        return {
            parcelId: null,
            error: { type: "concurrentUpdateConflict", logId } as UpdateParcelError,
        };
    }

    sendAuditLog({ ...auditLog, wasSuccess: true });

    return { parcelId: parcel.parcelId, error: null };
};
