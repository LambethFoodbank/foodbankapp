"use server";

import { getSupabaseServerComponentClient } from "@/supabaseServer";
import dayjs, { Dayjs } from "dayjs";
import { logErrorReturnLogId } from "@/logger/logger";
import { sendAuditLog } from "@/server/auditLog";
import { ParcelStatus } from "@/databaseUtils";
import { ParcelsTableRow } from "../parcelsTable/types";

export type StatusType = ParcelStatus[][number];

type SaveParcelStatusErrorType = "eventInsertionFailed";

export interface SaveParcelStatusError {
    type: SaveParcelStatusErrorType;
    logId: string;
}

export type SaveParcelStatusResult = { error: null | SaveParcelStatusError };

export const saveParcelStatus = async (
    parcelIds: string[],
    statusName: StatusType,
    statusEventData?: string | null,
    action?: string,
    date?: Dayjs
): Promise<SaveParcelStatusResult> => {
    // This is server-side, so put the date through dayjs to ensure it's a Dayjs object
    const timestamp = (date ? dayjs(date) : dayjs()).toISOString();
    const eventsToInsert = parcelIds
        .map((parcelId: string) => {
            return {
                new_parcel_status: statusName,
                parcel_id: parcelId,
                event_data: statusEventData,
                timestamp,
            };
        })
        .flat();

    const auditLogs = eventsToInsert.map((eventToInsert) => ({
        action: action ?? "change parcel status",
        content: { eventToInsert },
        parcelId: eventToInsert.parcel_id,
    }));

    const supabase = getSupabaseServerComponentClient();
    const { data, error } = await supabase
        .from("events")
        .insert(eventsToInsert)
        .select("event_id:primary_key, parcel_id");

    if (error || !data) {
        const logId = await logErrorReturnLogId("Error with insert: Status event", error);
        auditLogs.forEach(
            (auditLog) => void sendAuditLog({ ...auditLog, wasSuccess: false, logId })
        );
        return { error: { type: "eventInsertionFailed", logId: logId } };
    }

    auditLogs.forEach((auditLog) =>
        sendAuditLog({
            ...auditLog,
            eventId: data.find((event) => auditLog.parcelId === event.parcel_id)?.event_id,
            wasSuccess: true,
        })
    );

    return { error: null };
};

export const saveParcelTableRowsStatus = async (
    parcelRows: ParcelsTableRow[],
    statusName: StatusType,
    statusEventData?: string | null,
    action?: string,
    date?: Dayjs
): Promise<SaveParcelStatusResult> => {
    return saveParcelStatus(
        parcelRows.map((parcelRow) => parcelRow.parcelId),
        statusName,
        statusEventData,
        action,
        date
    );
};
