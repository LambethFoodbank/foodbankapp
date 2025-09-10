import { PostgrestError } from "@supabase/supabase-js";
import { Tables } from "@/databaseTypesFile";
import { Schema } from "@/databaseUtils";
import { DaysOfWeekType } from "@/common/databaseDaysOfWeek";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import { DbAvailableDaysType } from "@/common/fetch";

export interface CollectionCentreAvailability {
    dayIndex: number;
    timeSlots: { time: string | null; is_active: boolean | null }[];
    isActive: boolean;
}

export interface CollectionCentresTableRow {
    acronym: Schema["collection_centres"]["acronym"];
    name: Schema["collection_centres"]["name"];
    id: Schema["collection_centres"]["primary_key"];
    isDelivery: Schema["collection_centres"]["is_delivery"];
    isShown: Schema["collection_centres"]["is_shown"];
    availability: CollectionCentreAvailability[];
    isNew: boolean;
    lastUpdated: Schema["collection_centres"]["last_updated"];
}

export interface CollectionCentresTableRowWithOriginalLastUpdated
    extends CollectionCentresTableRow {
    originalLastUpdated: string;
}

export interface FormattedTimeSlot {
    time: string;
    isActive: boolean;
}

export interface FormattedAvailableDayType {
    day: DaysOfWeekType;
    isActive: boolean;
}

export interface FormattedTimeSlotsWithPrimaryKey {
    primaryKey: Schema["collection_centres"]["primary_key"];
    timeSlots: FormattedTimeSlot[];
    lastUpdated: Schema["collection_centres"]["last_updated"];
}

export interface FormattedAvailableDaysWithPrimaryKey {
    primaryKey: Schema["collection_centres"]["primary_key"];
    availableDays: FormattedAvailableDayType[];
    lastUpdated: Schema["collection_centres"]["last_updated"];
}

type FetchCollectionCentresResult =
    | {
          data: CollectionCentresTableRow[];
          error: null;
      }
    | {
          data: null;
          error: { type: "failedToFetchCollectionCentres"; logId: string };
      };

export const initialCollectionAvailableDays: DbAvailableDaysType = [
    {
        day: "Monday",
        is_active: true,
    },
    {
        day: "Tuesday",
        is_active: true,
    },
    {
        day: "Wednesday",
        is_active: true,
    },
    {
        day: "Thursday",
        is_active: true,
    },
    {
        day: "Friday",
        is_active: true,
    },
    {
        day: "Saturday",
        is_active: true,
    },
    {
        day: "Sunday",
        is_active: true,
    },
];

export const fetchCollectionCentresForTable = async (): Promise<FetchCollectionCentresResult> => {
    const { data, error } = await supabase
        .from("collection_centres")
        .select(
            `
            *,
            collection_centres_availability(
                day_index,
                is_active,
                time_slots
            )
        `
        )
        .order("name");

    if (error) {
        const logId = await logErrorReturnLogId("Failed to fetch collection centres", { error });
        return { data: null, error: { type: "failedToFetchCollectionCentres", logId } };
    }

    const formattedData = data.map((row) => {
        const availabilityByDay = (row.collection_centres_availability || [])
            .sort((first, second) => first.day_index - second.day_index)
            .map((day) => ({
                dayIndex: day.day_index,
                isActive: day.is_active,
                timeSlots: (day.time_slots || []).map((slot) => ({
                    time: slot.time,
                    is_active: slot.is_active ?? false,
                })),
            }));

        return {
            name: row.name,
            acronym: row.acronym,
            id: row.primary_key,
            isShown: row.is_shown,
            isDelivery: row.is_delivery,
            availability: availabilityByDay,
            isNew: false,
            lastUpdated: row.last_updated,
        };
    });

    console.log(formattedData);
    return { data: formattedData, error: null };
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
        available_days: initialCollectionAvailableDays,
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
    const { data: collectionCentre, error } = await supabase
        .rpc("insert_collection_centre_with_availability", {
            centre_data: {
                name: newRow.name,
                acronym: newRow.acronym,
                is_shown: newRow.isShown,
                is_delivery: newRow.isDelivery,
            },
            availability_data: newRow.availability.map((day) => ({
                day_index: day.dayIndex,
                is_active: day.isActive,
                time_slots: day.timeSlots.map((slot) => ({
                    time: slot.time,
                    is_active: slot.is_active,
                })),
            })),
        })
        .single<{ primary_key: string }>();
    if (error) {
        const logId = await logErrorReturnLogId("Failed to add a collection centre", {
            error,
            newCollectionCentre: newRow,
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
    rowWithOriginalLastUpdated: CollectionCentresTableRowWithOriginalLastUpdated
): Promise<UpdateCollectionCentreResult> => {
    const { id, name, acronym, isShown, isDelivery, availability } = rowWithOriginalLastUpdated;
    const lastUpdated = rowWithOriginalLastUpdated.originalLastUpdated;

    const { data: updatedCentre, error } = await supabase
        .rpc("update_collection_centre_with_availability", {
            centre_data: {
                primary_key: id,
                name,
                acronym,
                is_shown: isShown,
                is_delivery: isDelivery,
            },
            availability_data: availability.map((day) => ({
                day_index: day.dayIndex,
                is_active: day.isActive,
                time_slots: day.timeSlots,
            })),
            original_last_updated: lastUpdated,
        })
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to update collection centre", {
            error,
            collectionCentre: rowWithOriginalLastUpdated,
        });

        return { error: { type: "UpdateCollectionCentreFailed", logId } };
    }

    if (!updatedCentre) {
        const logId = await logWarningReturnLogId("Concurrent editing of collection centre");
        return { error: { type: "ConcurrentEditCollectionCentre", logId } };
    }

    return { error: null };
};
