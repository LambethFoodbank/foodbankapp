import supabase from "@/supabaseClient";
import { InsertSchema, UpdateSchema } from "@/databaseUtils";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { Errors } from "@/components/Form/formFunctions";
import { ParcelFields } from "@/app/parcels/form/ParcelForm";
import { CollectionTimeSlotsLabelsAndValues, DbAvailableDaysType, fetchParcel } from "@/common/fetch";
import dayjs from "dayjs";
import { getBeforeAndAfter } from "@/app/logs/fetchForAuditLog";

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

export function switchErrorForCollectionCentre(
    fields: ParcelFields,
    collectionCentreIsActive: boolean,
    deliveryPrimaryKey: string
): Errors {
    if (!collectionCentreIsActive) {
        return Errors.invalidCollectionCentre;
    }

    if (fields.collectionCentre === deliveryPrimaryKey) {
        return Errors.initial;
    }

    return Errors.none;
}

export function switchErrorForCollectionDate(
    fields: ParcelFields,
    collectionCentreIsActive: boolean,
    availableDaysForCentre: DbAvailableDaysType
): Errors {
    const collectionDateDayIndex =
        dayjs(fields.collectionDate).day() !== 0 ? dayjs(fields.collectionDate).day() - 1 : 6;

    // Date field is required
    if (!fields.collectionDate) {
        return Errors.initial;
    }

    // The collection centre should be available on the selected day
    if (
        (availableDaysForCentre.length > 0 &&
            !availableDaysForCentre[collectionDateDayIndex].is_active) ||
        !collectionCentreIsActive
    ) {
        return Errors.invalidCollectionDate;
    }

    return Errors.none;
}

export function switchErrorForCollectionSlot(
    fields: ParcelFields,
    collectionCentreIsActive: boolean,
    collectionSlotsLabelsAndValues: CollectionTimeSlotsLabelsAndValues,
    availableDaysForCentre: DbAvailableDaysType
): Errors {
    // Slot field is required
    if (!fields.collectionSlot || fields.collectionSlot === "-") {
        return Errors.initial;
    }

    // The collection slot should be one of the available options for the centre
    if (
        !collectionCentreIsActive ||
        !collectionSlotsLabelsAndValues.some(
            (slotLabelAndValue) => slotLabelAndValue[1] === fields.collectionSlot
        ) ||
        !availableDaysForCentre.some((day) => day.is_active)
    ) {
        return Errors.invalidCollectionSlot;
    }

    return Errors.none;
}

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
        content: {
            before: {},
            after: {},
            actionType: "Create",
        },
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

    const { parcel_primary_key } = parcelDataWithCount[0];

    await sendAuditLog({
        ...auditLog,
        wasSuccess: true,
        parcelId: parcel_primary_key,
    });
    return { parcelId: parcel_primary_key, error: null };
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

        const { data: oldRow, error: fetchOldRowError } = await fetchParcel(primaryKey, supabase);

        if (fetchOldRowError) {
            const logId = await logErrorReturnLogId(
                "Error with update: parcel data",
                fetchOldRowError
            );
            await sendAuditLog({
                action: "edit a parcel",
                content: {
                    before: {},
                    after: {},
                    actionType: "Edit",
                },
                wasSuccess: false,
                logId
            });
            console.log("Error with old row");
            return { parcelId: null, error: { type: "failedToUpdateParcel", logId } };
        }

        const { data: parcelDataAndCount, error: updateParcelError } = await supabase.rpc(
            "update_parcel_with_delivery_instructions",
            {
                parcel_record: parcelRecord,
                delivery_instructions: deliveryInstructions,
                parcel_primary_key: primaryKey,
            }
        );

        const { data: newRow, error: fetchNewRowError } = await fetchParcel(primaryKey, supabase);
        if (fetchNewRowError) {
            const logId = await logErrorReturnLogId(
                "Error with update: parcel data",
                fetchNewRowError
            );
            await sendAuditLog({
                action: "edit a parcel",
                content: {
                    before: {},
                    after: {},
                    actionType: "Edit",
                },
                wasSuccess: false,
                logId
            });
            console.log("Error with new row");
            return { parcelId: null, error: { type: "failedToUpdateParcel", logId } };
        }

        const beforeAndAfter = getBeforeAndAfter(oldRow, newRow);

        const auditLog = {
            action: "edit a parcel",
            content: {
                before: beforeAndAfter.before,
                after: beforeAndAfter.after,
                actionType: "Edit",
                count: parcelDataAndCount?.[0].rows_updated,
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

        const { rows_updated } = parcelDataAndCount[0];

        if (rows_updated === 0) {
            const logId = await logWarningReturnLogId("Concurrent editing of parcel");
            await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
            return { parcelId: null, error: { type: "concurrentUpdateConflict", logId } };
        }

        await sendAuditLog({ ...auditLog, wasSuccess: true });
        return { parcelId: primaryKey, error: null };
    };
