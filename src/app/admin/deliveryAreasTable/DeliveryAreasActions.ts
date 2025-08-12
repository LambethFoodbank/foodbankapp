import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { DeliveryAreasRow } from "@/app/admin/deliveryAreasTable/DeliveryAreasTable";
import { logErrorReturnLogId } from "@/logger/logger";
import { PostgrestError } from "@supabase/supabase-js";

export const fetchDeliveryAreas = async (): Promise<DeliveryAreasRow[]> => {
    const { data, error } = await supabase.from("delivery_areas").select();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Delivery areas", error);
        throw new DatabaseError("fetch", "delivery areas", logId);
    }

    return data.map(
        (row): DeliveryAreasRow => ({
            id: row.id,
            postcode: row.postcode,
            isNew: false,
        })
    );
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
    const data = { postcode: newRow.postcode };
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

export const deleteDbDeliveryAreas = async (
    row: DeliveryAreasRow
): Promise<UpdateDeliveryAreasResult> => {
    const { error: auditUpdateError } = await supabase
        .from("audit_log")
        .update({ delivery_areas_id: null })
        .eq("delivery_areas_id", row.id);

    if (auditUpdateError) {
        const logId = await logErrorReturnLogId(
            "Failed to clear audit_log references before delete",
            {
                error: auditUpdateError,
                rowData: row,
            }
        );
        return { error: { dbError: auditUpdateError, logId } };
    }

    const { data, error } = await supabase
        .from("delivery_areas")
        .delete()
        .eq("id", row.id)
        .select();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to delete delivery area", {
            error,
            rowData: row,
        });
        return { error: { dbError: error, logId } };
    }

    if (!data || data.length === 0) {
        const logId = await logErrorReturnLogId("Delete did not match any records", {
            attemptedId: row.id,
        });
        return {
            error: {
                dbError: {
                    message: "No rows deleted",
                    details: "ID did not match any rows",
                } as unknown as PostgrestError,
                logId,
            },
        };
    }

    return { error: null };
};
