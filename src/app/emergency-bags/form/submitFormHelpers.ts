import { InsertSchema, UpdateSchema } from "@/databaseUtils";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import supabase from "@/supabaseClient";

export type WriteEmergencyBagToDatabaseFunction = InsertEmergencyBag | UpdateEmergencyBag;
export type WriteEmergencyBagToDatabaseErrors =
    | InsertEmergencyBagErrorType
    | UpdateEmergencyBagErrorType;

export type EmergencyBagDatabaseInsertRecord = InsertSchema["emergency_bags"];
type EmergencyBagDatabaseUpdateRecord = UpdateSchema["emergency_bags"];

type InsertEmergencyBagErrorType = "failedToInsertEmergencyBag";
export type InsertEmergencyBagResult = {
    error: { type: InsertEmergencyBagErrorType; logId: string } | null;
    emergencyBagId: string | null;
};

type InsertEmergencyBag = (
    emergencyBagRecord: EmergencyBagDatabaseInsertRecord
) => Promise<InsertEmergencyBagResult>;

export const insertEmergencyBag: InsertEmergencyBag = async (emergencyBagRecord) => {
    const { data, error } = await supabase
        .from("emergency_bags")
        .insert(emergencyBagRecord)
        .select("id")
        .single();

    const auditLog = {
        action: "add an emergency bag",
        content: { emergencyBagDetails: emergencyBagRecord },
        collectionCentreId: emergencyBagRecord.collection_centre,
    } as const satisfies Partial<AuditLog>;

    if (error) {
        const logId = await logErrorReturnLogId("Error with insert: emergency bag data", error);
        await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
        return { emergencyBagId: null, error: { type: "failedToInsertEmergencyBag", logId } };
    }

    await sendAuditLog({ ...auditLog, wasSuccess: true, emergencyBagId: data.id });
    return { emergencyBagId: data.id, error: null };
};

type UpdateEmergencyBagErrorType = "failedToUpdateEmergencyBag" | "concurrentUpdateConflict";
export type UpdateEmergencyBagError = { type: UpdateEmergencyBagErrorType; logId: string };
type UpdateEmergencyBagReturnType = {
    error: UpdateEmergencyBagError | null;
    emergencyBagId: string | null;
};

type UpdateEmergencyBagWithPrimaryKey = (primaryKey: string) => UpdateEmergencyBag;
type UpdateEmergencyBag = (
    emergencyBagRecord: EmergencyBagDatabaseUpdateRecord
) => Promise<UpdateEmergencyBagReturnType>;

export const updateEmergencyBag: UpdateEmergencyBagWithPrimaryKey =
    (primaryKey) => async (emergencyBagRecord) => {
        const { error, count } = await supabase
            .from("emergency_bags")
            .update(emergencyBagRecord, { count: "exact" })
            .eq("id", primaryKey)
            .eq("last_updated", emergencyBagRecord.last_updated);

        const auditLog = {
            action: "edit a emergency bag",
            content: { emergencyBagDetails: emergencyBagRecord, count: count },
            collectionCentreId: emergencyBagRecord.collection_centre,
            emergencyBagId: primaryKey,
        } as const satisfies Partial<AuditLog>;

        if (error) {
            const logId = await logErrorReturnLogId("Error with update: emergency bag data", error);
            await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
            return { emergencyBagId: null, error: { type: "failedToUpdateEmergencyBag", logId } };
        }

        if (count === 0) {
            const logId = await logWarningReturnLogId("Concurrent editing of emergency bag");
            await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
            return { emergencyBagId: null, error: { type: "concurrentUpdateConflict", logId } };
        }

        await sendAuditLog({ ...auditLog, wasSuccess: true });
        return { emergencyBagId: primaryKey, error: null };
    };
