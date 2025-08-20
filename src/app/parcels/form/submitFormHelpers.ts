import { InsertSchema, UpdateSchema } from "@/databaseUtils";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import supabase from "@/supabaseClient";

export type WriteParcelToDatabaseFunction = UpdateParcel | InsertParcel;
export type WriteParcelToDatabaseErrors = InsertParcelErrorType | UpdateParcelErrorType;

export type ParcelDatabaseInsertRecord = InsertSchema["parcels"];
type ParcelDatabaseUpdateRecord = UpdateSchema["parcels"];

type InsertParcelErrorType = "failedToInsertParcel" | "failedToUpdateDeliveryInstructions";
export type InsertParcelReturnType = {
    error: { type: InsertParcelErrorType; logId: string } | null;
    parcelId: string | null;
};

type InsertParcel = (
    parcelRecord: ParcelDatabaseInsertRecord,
    deliveryInstructions: string
) => Promise<InsertParcelReturnType>;

export const insertParcel: InsertParcel = async (parcelRecord, deliveryInstructions) => {
    const { data: parcelDataWithCount, error: insertParcelError } = await supabase.rpc(
        "insert_parcel_with_delivery_instructions",
        {
            parcel_record: parcelRecord,
            delivery_instructions: deliveryInstructions,
        }
    );

    const auditLog = {
        action: "add a parcel",
        content: { parcelDetails: { ...parcelRecord, deliveryInstructions } },
        clientId: parcelRecord.client_id,
        collectionCentreId: parcelRecord.collection_centre
            ? parcelRecord.collection_centre
            : undefined,
        packingSlotId: parcelRecord.packing_slot ? parcelRecord.packing_slot : undefined,
    } as const satisfies Partial<AuditLog>;

    if (insertParcelError) {
        const logId = await logErrorReturnLogId(
            "Error with insert: parcel data",
            insertParcelError
        );
        await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
        return { parcelId: null, error: { type: "failedToInsertParcel", logId } };
    }

    await sendAuditLog({
        ...auditLog,
        wasSuccess: true,
        parcelId: parcelDataWithCount.parcel_primary_key || undefined,
    });
    return { parcelId: parcelDataWithCount.parcel_primary_key, error: null };
};

type UpdateParcelErrorType =
    | "failedToUpdateParcel"
    | "failedToUpdateDeliveryInstructions"
    | "concurrentUpdateConflict";
export type UpdateParcelError = { type: UpdateParcelErrorType; logId: string };
type UpdateParcelReturnType = {
    error: UpdateParcelError | null;
    parcelId: string | null;
};

type UpdateParcelWithPrimaryKey = (primaryKey: string) => UpdateParcel;
type UpdateParcel = (
    parcelRecord: ParcelDatabaseUpdateRecord,
    deliveryInstructions: string
) => Promise<UpdateParcelReturnType>;

export const updateParcel: UpdateParcelWithPrimaryKey =
    (primaryKey) => async (parcelRecord, deliveryInstructions) => {
        const { data: parcelDataAndCount, error: updateParcelError } = await supabase.rpc(
            "update_parcel_with_delivery_instructions",
            {
                parcel_record: parcelRecord,
                delivery_instructions: deliveryInstructions,
                parcel_primary_key: primaryKey,
            }
        );

        const auditLog = {
            action: "edit a parcel",
            content: {
                parcelDetails: { ...parcelRecord, deliveryInstructions },
                count: parcelDataAndCount?.rows_updated,
            },
            clientId: parcelRecord.client_id,
            collectionCentreId: parcelRecord.collection_centre
                ? parcelRecord.collection_centre
                : undefined,
            packingSlotId: parcelRecord.packing_slot ? parcelRecord.packing_slot : undefined,
            parcelId: primaryKey,
        } as const satisfies Partial<AuditLog>;

        if (updateParcelError) {
            const logId = await logErrorReturnLogId(
                "Error with update: parcel data",
                updateParcelError
            );
            await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
            return { parcelId: null, error: { type: "failedToUpdateParcel", logId } };
        }

        if (parcelDataAndCount.rows_updated === 0) {
            const logId = await logWarningReturnLogId("Concurrent editing of parcel");
            await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
            return { parcelId: null, error: { type: "concurrentUpdateConflict", logId } };
        }

        await sendAuditLog({ ...auditLog, wasSuccess: true });
        return { parcelId: primaryKey, error: null };
    };
