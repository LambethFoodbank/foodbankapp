import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { DeliveryAreasRow } from "@/app/admin/deliveryAreasTable/DeliveryAreasTable";
import { logErrorReturnLogId } from "@/logger/logger";
import { PostgrestError } from "@supabase/supabase-js";
import { AuditLog, sendAuditLog } from "@/server/auditLog";

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

type DeleteDeliveryAreasResult = {
    error: {
        dbError: PostgrestError;
        logId: string;
    } | null;
};

export const deleteDbDeliveryAreas = async (
    row: DeliveryAreasRow
): Promise<DeleteDeliveryAreasResult> => {
    const auditLog = {
        action: "delete a delivery area",
        content: {
            deliveryArea: row.postcode,
        },
    } as const satisfies Partial<AuditLog>;

    const { error } = await supabase.from("delivery_areas").delete().eq("id", row.id).select();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to delete delivery area", {
            error,
            rowData: row,
        });
        await sendAuditLog({
            ...auditLog,
            wasSuccess: false,
            logId,
            deliveryAreasId: row.id,
        });
        return { error: { dbError: error, logId } };
    }

    await sendAuditLog({ ...auditLog, wasSuccess: true });
    return { error: null };
};
