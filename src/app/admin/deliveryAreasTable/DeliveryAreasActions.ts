import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { DeliveryAreasRow } from "@/app/admin/deliveryAreasTable/DeliveryAreasTable";
import { Tables } from "@/databaseTypesFile";
import { logErrorReturnLogId } from "@/logger/logger";
import { PostgrestError } from "@supabase/supabase-js";

type DbDeliveryAreas = Tables<"delivery_areas">;
type NewDbDeliveryAreas = Omit<DbDeliveryAreas, "id">;

export const fetchDeliveryAreas = async (): Promise<DeliveryAreasRow[]> => {
    const { data, error } = await supabase
        .from("delivery_areas")
        .select()
        .eq("is_deliverable", true);
    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Delivery areas", error);
        throw new DatabaseError("fetch", "delivery areas", logId);
    }

    return data.map(
        (row): DeliveryAreasRow => ({
            id: row.id,
            postcode: row.postcode,
            isDeliverable: row.is_deliverable,
            isNew: false,
        })
    );
};

const formatExistingRowToDbDeliveryAreas = (row: DeliveryAreasRow): DbDeliveryAreas => {
    return {
        id: row.id,
        postcode: row.postcode,
        is_deliverable: row.isDeliverable,
    };
};

const formatNewRowToDbDeliveryAreas = (newRow: DeliveryAreasRow): NewDbDeliveryAreas => {
    return {
        postcode: newRow.postcode,
        is_deliverable: newRow.isDeliverable,
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

export const updateDbDeliveryAreasByPostcode = async (
    row: DeliveryAreasRow
): Promise<UpdateDeliveryAreasResult> => {
    const processedData = formatExistingRowToDbDeliveryAreas(row);
    const { error } = await supabase
        .from("delivery_areas")
        .update({ is_deliverable: true })
        .eq("postcode", processedData.postcode);

    if (error) {
        const logId = await logErrorReturnLogId("Failed to update delivery area", {
            error,
            newDeliveryAreasData: processedData,
        });

        return { error: { dbError: error, logId } };
    }

    return { error: null };
};

export const deleteDbDeliveryAreas = async (
    row: DeliveryAreasRow
): Promise<UpdateDeliveryAreasResult> => {
    const processedData = formatExistingRowToDbDeliveryAreas(row);
    const { error } = await supabase
        .from("delivery_areas")
        .update({ is_deliverable: false })
        .eq("postcode", processedData.postcode);

    if (error) {
        const logId = await logErrorReturnLogId("Failed to update delivery area", {
            error,
            newDeliveryAreasData: processedData,
        });

        return { error: { dbError: error, logId } };
    }

    return { error: null };
};
