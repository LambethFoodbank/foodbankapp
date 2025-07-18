import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { DeliveryAreasRow } from "@/app/admin/deliveryAreasTable/DeliveryAreasTable";
import { Tables } from "@/databaseTypesFile";
import { logErrorReturnLogId } from "@/logger/logger";
import { PostgrestError } from "@supabase/supabase-js";

type DbDeliveryAreas = Tables<"delivery_areas">;
type NewDbDeliveryAreas = Omit<DbDeliveryAreas, "id">;

export const fetchDeliveryAreas = async (): Promise<DeliveryAreasRow[]> => {
    const { data, error } = await supabase.from("delivery_areas").select().order("order");
    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Delivery areas", error);
        throw new DatabaseError("fetch", "delivery areas", logId);
    }

    return data.map(
        (row): DeliveryAreasRow => ({
            id: row.id,
            postcode: row.postcode,
            isDeliverable: row.is_deliverable,
            order: row.order,
            isNew: false,
        })
    );
};

const formatExistingRowToDbDeliveryAreas = (row: DeliveryAreasRow): DbDeliveryAreas => {
    return {
        id: row.id,
        postcode: row.postcode,
        is_deliverable: row.isDeliverable,
        order: row.order,
    };
};

const formatNewRowToDbDeliveryAreas = (newRow: DeliveryAreasRow): NewDbDeliveryAreas => {
    return {
        postcode: newRow.postcode,
        is_deliverable: newRow.isDeliverable,
        order: newRow.order,
    };
};

type InsertDeliveryAreasResult =
    | {
          data: { deliveryAreasId: string };
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
    newRow: DeliveryAreasRow
): Promise<InsertDeliveryAreasResult> => {
    const data = formatNewRowToDbDeliveryAreas(newRow);
    const { data: deliveryAreas, error } = await supabase
        .from("delivery_areas")
        .insert(data)
        .select()
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to add a delivery area", {
            error,
            newDeliveryAreasData: data,
        });
        return { data: null, error: { dbError: error, logId } };
    }

    return { data: { deliveryAreasId: deliveryAreas.id }, error: null };
};

type UpdateDeliveryAreasResult = {
    error: {
        dbError: PostgrestError;
        logId: string;
    } | null;
};

export const updateDbDeliveryAreas = async (
    row: DeliveryAreasRow
): Promise<UpdateDeliveryAreasResult> => {
    const processedData = formatExistingRowToDbDeliveryAreas(row);
    const { error } = await supabase
        .from("delivery_areas")
        .update(processedData)
        .eq("id", processedData.id);

    if (error) {
        const logId = await logErrorReturnLogId("Failed to update delivery area", {
            error,
            newDeliveryAreasData: processedData,
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
    row1: DeliveryAreasRow,
    row2: DeliveryAreasRow
): Promise<SwapRowsResult> => {
    const { error } = await supabase.rpc("delivery_area_order_swap", {
        id1: row1.id,
        id2: row2.id,
    });

    if (error) {
        const logId = await logErrorReturnLogId("Failed to update delivery area order", {
            error,
            deliveryAreas1: row1,
            deliveryAreas2: row2,
        });
        return { error: { dbError: error, logId } };
    }

    return { error: null };
};
