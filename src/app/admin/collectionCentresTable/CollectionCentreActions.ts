import { PostgrestError } from "@supabase/supabase-js";
import { Tables } from "@/databaseTypesFile";
import { Schema } from "@/databaseUtils";
import { DaysOfWeekType } from "@/common/databaseDaysOfWeek";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import { DbAvailableDaysType } from "@/common/fetch";

export interface CollectionCentresTableRow {
    acronym: Schema["collection_centres"]["acronym"];
    name: Schema["collection_centres"]["name"];
    id: Schema["collection_centres"]["primary_key"];
    isDelivery: Schema["collection_centres"]["is_delivery"];
    isShown: Schema["collection_centres"]["is_shown"];
    timeSlots: Schema["collection_centres"]["time_slots"];
    availableDays: Schema["collection_centres"]["available_days"];
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

type DbCollectionCentre = Omit<Tables<"collection_centres">, "last_updated">;
type NewDbCollectionCentre = Omit<DbCollectionCentre, "primary_key">;

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
            lastUpdated: row.last_updated,
        })
    );

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
        logId: string | null;
    } | null;
};

export const updateDbCollectionCentre = async (
    rowWithOriginalLastUpdated: CollectionCentresTableRowWithOriginalLastUpdated
): Promise<UpdateCollectionCentreResult> => {
    const processedData = formatExistingRowToDBCollectionCentre(rowWithOriginalLastUpdated);
    const lastUpdated = rowWithOriginalLastUpdated.originalLastUpdated;

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
        return { error: { type: "ConcurrentEditCollectionCentre", logId: null} };
    }

    return { error: null };
};
