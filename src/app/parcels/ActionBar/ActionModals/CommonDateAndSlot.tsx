import { FetchParcelError, fetchParcel } from "@/common/fetch";
import { UpdateParcelError } from "../../form/submitFormHelpers";
import { ParcelsTableRow } from "../../parcelsTable/types";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { logErrorReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

type UpdateField = "packingDate" | "packingSlot";

const buildAuditLog = (action: string, parcel: ParcelsTableRow, count = 1): AuditLog => {
    return {
        action: action,
        content: {
            parcelDetails: {
                client_id: parcel.clientId,
                packing_date: parcel.packingDate?.toString(),
                packing_slot: parcel.packingSlot,
                voucher_number: parcel.voucherNumber,
                collection_centre: parcel.deliveryCollection.collectionCentreName,
                collection_datetime: parcel.collectionDatetime?.toString(),
            },
            count: count,
        },
        clientId: parcel.clientId,
        parcelId: parcel.parcelId,
        wasSuccess: false,
    };
};

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

export const hasConcurrencyConflict = async (
    parcel: ParcelsTableRow,
    action: string
): Promise<boolean> => {
    const auditLog = buildAuditLog(action, parcel);
    const { error, count } = await supabase
        .from("parcels")
        .select("*", { count: "exact", head: true })
        .eq("primary_key", parcel.parcelId)
        .eq("last_updated", parcel.lastUpdated);

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetching parcel data", error);
        await sendAuditLog({
            ...auditLog,
            wasSuccess: false,
            logId,
        });
        return true;
    }
    return !(count === 0);
};

export const packingDateOrSlotUpdate = async (
    updateField: UpdateField,
    action: string,
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
    const lastUpdated = parcel.lastUpdated;

    const packingDateOrSlotDbUpdate = async (
        fieldToUpdate: FieldToUpdate
    ): Promise<PostgrestSingleResponse<null>> => {
        return supabase
            .from("parcels")
            .update(fieldToUpdate, { count: "exact" })
            .eq("primary_key", parcel.parcelId)
            .eq("last_updated", lastUpdated);
    };
    let updateResponse: PostgrestSingleResponse<null>;
    switch (updateField) {
        case "packingDate":
            updateResponse = await packingDateOrSlotDbUpdate({
                packing_date: packingDateOrSlotData,
            });
            break;
        case "packingSlot":
            updateResponse = await packingDateOrSlotDbUpdate({
                packing_slot: packingDateOrSlotData,
            });
            break;
    }

    const { data: parcelData, error: fetchError } = await fetchParcel(parcel.parcelId, supabase);

    const auditLog = buildAuditLog(action, parcel, updateResponse.count ?? 1);

    if (fetchError) {
        const logId = await logErrorReturnLogId("Error with fetching parcel data", fetchError);
        await sendAuditLog({
            ...auditLog,
            wasSuccess: false,
            logId,
        });
        return { parcelId: parcel.parcelId, error: fetchError };
    }

    if (updateResponse.count === 0) {
        return {
            parcelId: null,
            error: { type: "concurrentUpdateConflict", logId: null },
        };
    }

    const parcelRecord = {
        client_id: parcelData.client_id,
        packing_date: parcelData.packing_date,
        packing_slot: parcelData.packing_slot?.primary_key,
        voucher_number: parcelData.voucher_number,
        collection_centre: parcelData.collection_centre?.primary_key,
        collection_datetime: parcelData.collection_datetime,
        last_updated: parcelData.last_updated,
    };
    let content =  { parcelDetails: parcelRecord };

    if (updateResponse.error) {
        const logId = await logErrorReturnLogId(
            "Error with update: parcel data",
            updateResponse.error
        );

        await sendAuditLog({
            ...auditLog,
            content: content,
            wasSuccess: false,
            logId,
        });
        return {
            parcelId: null,
            error: { type: "failedToUpdateParcel", logId } as UpdateParcelError,
        };
    }

    if (updateResponse.count === 0) {
        return {
            parcelId: null,
            error: { type: "concurrentUpdateConflict", logId: null } as UpdateParcelError,
        };
    }

    sendAuditLog({
        ...auditLog,
        content: content,
        wasSuccess: true,
    });

    return { parcelId: parcel.parcelId, error: null };
};
