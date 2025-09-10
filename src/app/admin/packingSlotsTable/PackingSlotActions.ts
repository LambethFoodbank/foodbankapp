import { PostgrestError } from "@supabase/supabase-js";
import {
    PackingSlotRow,
    PackingSlotRowWithOriginalLastUpdated,
} from "@/app/admin/packingSlotsTable/PackingSlotsTable";
import { DatabaseError } from "@/app/errorClasses";
import { Tables } from "@/databaseTypesFile";
import { logErrorReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";

type DbPackingSlot = Tables<"packing_slots">;
type NewDbPackingSlot = Omit<DbPackingSlot, "primary_key">;

export const fetchPackingSlots = async (): Promise<PackingSlotRow[]> => {
    const { data, error } = await supabase.from("packing_slots").select().order("order");
    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Packing slots", error);
        throw new DatabaseError("fetch", "packing slots", logId);
    }

    return data.map(
        (row): PackingSlotRow => ({
            name: row.name,
            id: row.primary_key,
            isShown: row.is_shown,
            order: row.order,
            isNew: false,
            lastUpdated: row.last_updated,
        })
    );
};

const formatExistingRowToDBPackingSlot = (row: PackingSlotRow): DbPackingSlot => {
    return {
        primary_key: row.id,
        name: row.name,
        is_shown: row.isShown,
        order: row.order,
        last_updated: row.lastUpdated,
    };
};

const formatNewRowToDBPackingSlot = (newRow: PackingSlotRow): NewDbPackingSlot => {
    return {
        name: newRow.name,
        is_shown: newRow.isShown,
        order: newRow.order,
        last_updated: newRow.lastUpdated,
    };
};

type InsertPackingSlotResult =
    | {
          data: { packingSlotId: string };
          error: null;
      }
    | {
          data: null;
          error: {
              dbError: PostgrestError;
              logId: string;
          };
      };

export const insertNewPackingSlot = async (
    newRow: PackingSlotRow
): Promise<InsertPackingSlotResult> => {
    const data = formatNewRowToDBPackingSlot(newRow);
    const { data: packingSlot, error } = await supabase
        .from("packing_slots")
        .insert(data)
        .select()
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to add a packing slot", {
            error,
            newPackingSlotData: data,
        });
        return { data: null, error: { dbError: error, logId } };
    }

    return { data: { packingSlotId: packingSlot.primary_key }, error: null };
};

type UpdatePackingSlotResult = {
    error: {
        type: "UpdatePackingSlotsFailed" | "ConcurrentEditPackingSlots";
        logId: string | null;
    } | null;
};

export const updateDbPackingSlot = async (
    rowWithOriginalLastUpdated: PackingSlotRowWithOriginalLastUpdated
): Promise<UpdatePackingSlotResult> => {
    const processedData = formatExistingRowToDBPackingSlot(rowWithOriginalLastUpdated);
    const lastUpdated = rowWithOriginalLastUpdated.originalLastUpdated;

    const { error, count } = await supabase
        .from("packing_slots")
        .update(
            {
                name: processedData.name,
                is_shown: processedData.is_shown,
                order: processedData.order,
            },
            { count: "exact" }
        )
        .eq("primary_key", processedData.primary_key)
        .eq("last_updated", lastUpdated);

    if (error) {
        const logId = await logErrorReturnLogId("Failed to update packing slot", {
            error,
            newPackingSlotData: processedData,
        });

        return { error: { type: "UpdatePackingSlotsFailed", logId } };
    }
    if (count === 0) {
        return { error: { type: "ConcurrentEditPackingSlots", logId: null } };
    }

    return { error: null };
};

type SwapRowsResult = {
    error: {
        dbError: PostgrestError;
        logId: string;
    } | null;
};

export const swapRows = async (
    row1: PackingSlotRow,
    row2: PackingSlotRow
): Promise<SwapRowsResult> => {
    const { error } = await supabase.rpc("packing_slot_order_swap", {
        id1: row1.id,
        id2: row2.id,
    });

    if (error) {
        const logId = await logErrorReturnLogId("Failed to update packing slot order", {
            error,
            packingSlot1: row1,
            packingSlot2: row2,
        });
        return { error: { dbError: error, logId } };
    }

    return { error: null };
};
