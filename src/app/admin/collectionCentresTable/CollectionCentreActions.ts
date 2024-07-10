import supabase from "@/supabaseClient";
import { Tables } from "@/databaseTypesFile";
import { logErrorReturnLogId } from "@/logger/logger";
import { PostgrestError } from "@supabase/supabase-js";
import {
    CollectionCentresTableRow,
    FormattedTimeSlot,
    FormattedTimeSlotsWithPrimaryKey,
} from "@/app/admin/collectionCentresTable/CollectionCentresTable";
import { Schema } from "@/databaseUtils";

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
        dbError: PostgrestError;
        logId: string;
    } | null;
};

export const updateDbCollectionCentre = async (
    row: CollectionCentresTableRow
): Promise<UpdateCollectionCentreResult> => {
    const processedData = formatExistingRowToDBCollectionCentre(row);
    const { error } = await supabase
        .from("collection_centres")
        .update(processedData)
        .eq("primary_key", processedData.primary_key);

    if (error) {
        const logId = await logErrorReturnLogId("Failed to update collection centre", {
            error,
            newCollectionCentreData: processedData,
        });

        return { error: { dbError: error, logId } };
    }

    return { error: null };
};

export const updateDbCollectionCentreTimeSlots = async (
    timeSlotsWithPrimaryKey: FormattedTimeSlotsWithPrimaryKey
): Promise<UpdateCollectionCentreResult> => {
    const processedData = formatTimeSlotToDBCollectionCentreTimeSlot(
        timeSlotsWithPrimaryKey.timeSlots
    );
    const { error } = await supabase
        .from("collection_centres")
        .update({ time_slots: processedData })
        .eq("primary_key", timeSlotsWithPrimaryKey.primaryKey);

    if (error) {
        const logId = await logErrorReturnLogId("Failed to update collection centre time slots", {
            error,
            newCollectionCentreData: processedData,
        });

        return { error: { dbError: error, logId } };
    }

    return { error: null };
};
