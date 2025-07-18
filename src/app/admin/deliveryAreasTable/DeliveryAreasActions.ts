import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { PackingSlotRow } from "@/app/admin/packingSlotsTable/PackingSlotsTable";
import { Tables } from "@/databaseTypesFile";
import { logErrorReturnLogId } from "@/logger/logger";
import { PostgrestError } from "@supabase/supabase-js";

type DbPackingSlot = Tables<"packing_slots">;
type NewDbPackingSlot = Omit<DbPackingSlot, "primary_key">;

export const fetchDeliveryAreas = async (): Promise<PackingSlotRow[]> => {
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
        })
    );
};

const formatExistingRowToDBPackingSlot = (row: PackingSlotRow): DbPackingSlot => {
    return {
        primary_key: row.id,
        name: row.name,
        is_shown: row.isShown,
        order: row.order,
    };
};

const formatNewRowToDBPackingSlot = (newRow: PackingSlotRow): NewDbPackingSlot => {
    return {
        name: newRow.name,
        is_shown: newRow.isShown,
        order: newRow.order,
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

export const insertNewDeliveryAreas = async (
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
        dbError: PostgrestError;
        logId: string;
    } | null;
};

export const updateDbDeliveryAreas = async (
    row: PackingSlotRow
): Promise<UpdatePackingSlotResult> => {
    const processedData = formatExistingRowToDBPackingSlot(row);
    const { error } = await supabase
        .from("packing_slots")
        .update(processedData)
        .eq("primary_key", processedData.primary_key);

    if (error) {
        const logId = await logErrorReturnLogId("Failed to update packing slot", {
            error,
            newPackingSlotData: processedData,
        });

        return { error: { dbError: error, logId } };
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
