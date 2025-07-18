import supabase from "@/supabaseClient";
import { Tables } from "@/databaseTypesFile";
import { logErrorReturnLogId } from "@/logger/logger";
import { PostgrestError } from "@supabase/supabase-js";
import { Schema } from "@/databaseUtils";
import { DaysOfWeekType } from "@/common/databaseDaysOfWeek";

export interface CollectionCentresTableRow {
    acronym: Schema["collection_centres"]["acronym"];
    name: Schema["collection_centres"]["name"];
    id: Schema["collection_centres"]["primary_key"];
    isDelivery: Schema["collection_centres"]["is_delivery"];
    isShown: Schema["collection_centres"]["is_shown"];
    timeSlots: Schema["collection_centres"]["time_slots"];
    availableDays: Schema["collection_centres"]["available_days"];
    isNew: boolean;
}

export interface FormattedTimeSlot {
    time: string;
    isActive: boolean;
}

export interface FormattedAvailableDays {
    day: DaysOfWeekType;
    isActive: boolean;
}

export interface FormattedTimeSlotsWithPrimaryKey {
    primaryKey: Schema["collection_centres"]["primary_key"];
    timeSlots: FormattedTimeSlot[];
}

export interface FormattedAvailableDaysWithPrimaryKey {
    primaryKey: Schema["collection_centres"]["primary_key"];
    availableDays: FormattedAvailableDays[];
}

type DbCollectionCentre = Tables<"collection_centres">;
type NewDbCollectionCentre = Omit<DbCollectionCentre, "primary_key">;
type DbCollectionCentreTimeSlots = Schema["collection_centres"]["time_slots"];
type DbCollectionCentreAvailableDays = Schema["collection_centres"]["available_days"];

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
            availableDays: row.available_days,
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

const formatAvailableDaysToDBCollectionCentreTimeSlot = (
    availableDaysData: FormattedAvailableDays[]
): DbCollectionCentreAvailableDays => {
    return availableDaysData.map((availableDays) => {
        return {
            day: availableDays.day === "" ? null : availableDays.day,
            is_active: availableDays.isActive,
        };
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
        available_days: row.availableDays,
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
        available_days: newRow.availableDays,
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

export const updateDbCollectionCentreAvailableDays = async (
    availableDaysWithPrimaryKey: FormattedAvailableDaysWithPrimaryKey
): Promise<UpdateCollectionCentreResult> => {
    const processedData = formatAvailableDaysToDBCollectionCentreTimeSlot(
        availableDaysWithPrimaryKey.availableDays
    );
    const { error } = await supabase
        .from("collection_centres")
        .update({ available_days: processedData })
        .eq("primary_key", availableDaysWithPrimaryKey.primaryKey);

    if (error) {
        const logId = await logErrorReturnLogId(
            "Failed to update collection centre available days",
            {
                error,
                newCollectionCentreData: processedData,
            }
        );

        return { error: { dbError: error, logId } };
    }

    return { error: null };
};
