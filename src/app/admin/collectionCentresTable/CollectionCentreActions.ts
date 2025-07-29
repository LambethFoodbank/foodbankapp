import { PostgrestError } from "@supabase/supabase-js";
import { Tables } from "@/databaseTypesFile";
import { Schema } from "@/databaseUtils";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import { sendAuditLog } from "@/server/auditLog";
import supabase from "@/supabaseClient";

export interface CollectionCentresTableRow {
    originalLastUpdated: string;
    acronym: Schema["collection_centres"]["acronym"];
    name: Schema["collection_centres"]["name"];
    id: Schema["collection_centres"]["primary_key"];
    isDelivery: Schema["collection_centres"]["is_delivery"];
    isShown: Schema["collection_centres"]["is_shown"];
    timeSlots: Schema["collection_centres"]["time_slots"];
    isNew: boolean;
    lastUpdated: Schema["collection_centres"]["last_updated"];
}

export interface FormattedTimeSlot {
    time: string;
    isActive: boolean;
}

export interface FormattedTimeSlotsWithPrimaryKey {
    primaryKey: Schema["collection_centres"]["primary_key"];
    timeSlots: FormattedTimeSlot[];
    lastUpdated: Schema["collection_centres"]["last_updated"];
}

type DbCollectionCentre = Tables<"collection_centres">;
type NewDbCollectionCentre = Omit<DbCollectionCentre, "primary_key">;
type DbCollectionCentreTimeSlots = Schema["collection_centres"]["time_slots"];

type FetchCollectionCentresResult =
    | {
          data: CollectionCentresTableRow[];
          error: null;
      }
    | {
          data: null;
          error: { type: "failedToFetchCollectionCentres"; logId: string };
      };

export const fetchCollectionCentresForTable = async (): Promise<FetchCollectionCentresResult> => {
    const { data, error } = await supabase.from("collection_centres").select().order("name");
    if (error) {
        const logId = await logErrorReturnLogId("Failed to fetch collection centres", { error });
        return { data: null, error: { type: "failedToFetchCollectionCentres", logId } };
    }

    const formattedData = data.map(
        (row): CollectionCentresTableRow => ({
            name: row.name,
            acronym: row.acronym,
            id: row.primary_key,
            isShown: row.is_shown,
            isDelivery: row.is_delivery,
            timeSlots: row.time_slots,
            isNew: false,
            lastUpdated: row.last_updated,
            originalLastUpdated: row.last_updated,
        })
    );

    return { data: formattedData, error: null };
};

const formatTimeSlotToDBCollectionCentreTimeSlot = (
    timeSlotData: FormattedTimeSlot[]
): DbCollectionCentreTimeSlots => {
    return timeSlotData.map((timeSlot) => {
        return { time: timeSlot.time, is_active: timeSlot.isActive };
    });
};

const formatExistingRowToDBCollectionCentre = (
    row: CollectionCentresTableRow
): DbCollectionCentre => {
    return {
        primary_key: row.id,
        name: row.name,
        acronym: row.acronym,
        is_shown: row.isShown,
        is_delivery: row.isDelivery,
        time_slots: row.timeSlots,
        last_updated: row.lastUpdated,
    };
};

const formatNewRowToDBCollectionCentre = (
    newRow: CollectionCentresTableRow
): NewDbCollectionCentre => {
    return {
        name: newRow.name,
        acronym: newRow.acronym,
        is_shown: newRow.isShown,
        is_delivery: newRow.isDelivery,
        time_slots: newRow.timeSlots,
        last_updated: newRow.lastUpdated,
    };
};

export type InsertCollectionCentreResult =
    | {
          data: { collectionCentreId: string };
          error: null;
      }
    | {
          data: null;
          error: {
              dbError: PostgrestError;
              logId: string;
          };
      };

export const insertNewCollectionCentre = async (
    newRow: CollectionCentresTableRow
): Promise<InsertCollectionCentreResult> => {
    const data = formatNewRowToDBCollectionCentre(newRow);
    const { data: collectionCentre, error } = await supabase
        .from("collection_centres")
        .insert(data)
        .select()
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to add a collection centre", {
            error,
            newCollectionCentre: data,
        });
        return { data: null, error: { dbError: error, logId } };
    }

    return { data: { collectionCentreId: collectionCentre.primary_key }, error: null };
};

export type UpdateCollectionCentreResult = {
    error: {
        type: "UpdateCollectionCentreFailed" | "ConcurrentEditCollectionCentre";
        logId: string;
    } | null;
};

export const updateDbCollectionCentre = async (
    row: CollectionCentresTableRow
): Promise<UpdateCollectionCentreResult> => {
    const processedData = formatExistingRowToDBCollectionCentre(row);
    const baseAuditLogProps = {
        action: "update collection centres information",
        content: { data: processedData },
    };
    const lastUpdated = row.originalLastUpdated;
    const { error, count } = await supabase
        .from("collection_centres")
        .update(processedData, { count: "exact" })
        .eq("primary_key", processedData.primary_key)
        .eq("last_updated", lastUpdated);
    if (error) {
        const logId = await logErrorReturnLogId("Failed to update collection centre", {
            error,
            newCollectionCentreData: processedData,
        });

        return { error: { type: "UpdateCollectionCentreFailed", logId } };
    }
    if (count === 0) {
        const logId = await logWarningReturnLogId("Concurrent editing of parcel");
        await sendAuditLog({ ...baseAuditLogProps, wasSuccess: false, logId });
        return { error: { type: "ConcurrentEditCollectionCentre", logId } };
    }

    return { error: null };
};

export const updateDbCollectionCentreTimeSlots = async (
    timeSlotsWithPrimaryKey: FormattedTimeSlotsWithPrimaryKey
): Promise<UpdateCollectionCentreResult> => {
    const processedData = formatTimeSlotToDBCollectionCentreTimeSlot(
        timeSlotsWithPrimaryKey.timeSlots
    );
    const baseAuditLogProps = {
        action: "update collection centres time slots",
        content: { data: processedData },
    };
    const { error, count } = await supabase
        .from("collection_centres")
        .update({ time_slots: processedData }, { count: "exact" })
        .eq("primary_key", timeSlotsWithPrimaryKey.primaryKey)
        .eq("last_updated", timeSlotsWithPrimaryKey.lastUpdated);
    if (error) {
        const logId = await logErrorReturnLogId("Failed to update collection centre time slots", {
            error,
            newCollectionCentreData: processedData,
        });

        return { error: { type: "UpdateCollectionCentreFailed", logId } };
    }
    if (count === 0) {
        const logId = await logWarningReturnLogId("Concurrent editing of parcel");
        await sendAuditLog({ ...baseAuditLogProps, wasSuccess: false, logId });
        return { error: { type: "ConcurrentEditCollectionCentre", logId } };
    }

    return { error: null };
};
