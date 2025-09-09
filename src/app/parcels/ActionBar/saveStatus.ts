"use client";

import supabase from "@/supabaseClient";
import dayjs, { Dayjs } from "dayjs";
import { logErrorReturnLogId } from "@/logger/logger";
import { sendAuditLog } from "@/server/auditLog";
import { ParcelStatus } from "@/databaseUtils";
import { ParcelsTableRow } from "../parcelsTable/types";
import { fetchParcelStatus } from "@/app/logs/fetchForAuditLog";

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
    const timestamp = (date ?? dayjs()).toISOString();
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
    
    const auditLogs = await eventsToInsert.map( async (eventToInsert) => {
        const oldStatus = await fetchParcelStatus(eventToInsert.parcel_id);
        return {
            action: action ?? "change parcel status",
            content: {
                before: {
                    parcelStatus: oldStatus.data ?? "",
                },
                after: {
                    parcelStatus: eventToInsert.new_parcel_status,
                },
                actionType: "Edit",
                eventToInsert
            },
            parcelId: eventToInsert.parcel_id,
        }
    });

    const { data, error } = await supabase
        .from("events")
        .insert(eventsToInsert)
        .select("event_id:primary_key, parcel_id");

    if (error || !data) {
        const logId = await logErrorReturnLogId("Error with insert: Status event", error);
        await auditLogs.forEach(
            async (auditLog) => void sendAuditLog({ ...(await auditLog), wasSuccess: false, logId })
        );
        return { error: { type: "eventInsertionFailed", logId: logId } };
    }

    auditLogs.forEach( async (auditLog) =>
        sendAuditLog({
            ...(await auditLog),
            eventId: data.find(async (event) => (await auditLog).parcelId === event.parcel_id)?.event_id,
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
