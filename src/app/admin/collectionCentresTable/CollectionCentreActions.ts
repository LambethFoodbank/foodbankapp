import { PostgrestError } from "@supabase/supabase-js";
import { Schema } from "@/databaseUtils";
import { DaysOfWeekType } from "@/common/databaseDaysOfWeek";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";

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

interface DbTimeSlot {
    time: string | null;
    is_active: boolean | null;
}

interface DbAvailabilityDay {
    day_index: number;
    is_active: boolean;
    time_slots: DbTimeSlot[];
}

interface DbCollectionCentreWithAvailability {
    primary_key: string;
    name: string;
    acronym: string;
    is_shown: boolean;
    is_delivery: boolean;
    last_updated: string;
    availability: DbAvailabilityDay[];
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

export const fetchCollectionCentresForTable = async (): Promise<FetchCollectionCentresResult> => {
    const { data, error } = await supabase
        .from("collection_centres_with_availability")
        .select("*")
        .order("name");

    if (error) {
        const logId = await logErrorReturnLogId("Failed to fetch collection centres", { error });
        return { data: null, error: { type: "failedToFetchCollectionCentres", logId } };
    }

    const typedData = data as DbCollectionCentreWithAvailability[];

    const formattedData = typedData.map((row) => {
        console.log(row.availability);
        const availabilityArray: DbAvailabilityDay[] = row.availability || [];

        const availabilityByDay = availabilityArray
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
    console.log(typeof typedData[0].availability);
    //console.log(JSON.parse(typedData[0].availability));

    return { data: formattedData, error: null };
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
