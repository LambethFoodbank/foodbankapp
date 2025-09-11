import { PostgrestError } from "@supabase/supabase-js";
import { Schema } from "@/databaseUtils";
import { DaysOfWeekType } from "@/common/databaseDaysOfWeek";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import { Json } from "@/databaseTypesFile";

export interface CollectionCentresTableRow {
    acronym: Schema["collection_centres"]["acronym"];
    name: Schema["collection_centres"]["name"];
    id: Schema["collection_centres"]["primary_key"];
    isDelivery: Schema["collection_centres"]["is_delivery"];
    isShown: Schema["collection_centres"]["is_shown"];
    availability: FormattedAvailability[];
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

export interface FormattedAvailability {
    dayIndex: number;
    isActive: boolean;
    timeSlots: FormattedTimeSlot[];
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

    console.log("Raw Supabase data:", data);

    if (error) {
        const logId = await logErrorReturnLogId("Failed to fetch collection centres", { error });
        return { data: null, error: { type: "failedToFetchCollectionCentres", logId } };
    }

    const formattedData: CollectionCentresTableRow[] = (data || []).map((row: any) => {
        const availabilityArray: any[] = Array.isArray(row.availability)
            ? row.availability
            : JSON.parse(row.availability || "[]");

        const availability: FormattedAvailability[] = (availabilityArray || [])
            .filter((day) => day && day.day_index != null)
            .map((day) => ({
                dayIndex: day.day_index,
                isActive: day.is_active,
                timeSlots: (day.time_slots || []).map((slot: any) => ({
                    time: slot.time,
                    isActive: slot.is_active,
                })),
            }));

        return {
            id: row.primary_key,
            name: row.name,
            acronym: row.acronym,
            isShown: row.is_shown,
            isDelivery: row.is_delivery,
            lastUpdated: row.last_updated,
            availability,
            isNew: false,
        };
    });

    console.log("Formatted data:", formattedData);
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
                    is_active: slot.isActive,
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
                time_slots: day.timeSlots.map((slot) => ({
                    time: slot.time,
                    is_active: slot.isActive,
                })) as unknown as Json,
            })) as unknown as Json[],
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
