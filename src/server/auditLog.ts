"use server";

import { InsertSchema } from "@/databaseUtils";
import { logErrorReturnLogId } from "@/logger/logger";
import { DatabaseError } from "@/app/errorClasses";
import { Json } from "@/databaseTypesFile";
import { getSupabaseServerComponentClient } from "@/supabaseServer";
import { getCurrentProfile } from "./getCurrentProfile";

type AuditLogInsertRecord = InsertSchema["audit_log"];
export interface AuditLog {
    action: string;
    content: Json | null;
    wasSuccess: boolean;
    logId?: string;
    clientId?: string;
    collectionCentreId?: string;
    eventId?: string;
    listId?: string;
    packingSlotId?: string;
    parcelId?: string;
    profileId?: string;
    websiteData?: string;
    wikiId?: string;
    dietaryRequirement?: string;
    deliveryAreasId?: string;
}

export async function sendAuditLog(auditLogProps: AuditLog): Promise<void> {
    const { data: currentProfile, error: currentProfileError } = await getCurrentProfile();

    if (currentProfileError) {
        const logId = await logErrorReturnLogId("failed to fetch current profile for audit log");
        throw new DatabaseError("fetch", "current profile error for audit log", logId);
    }

    const auditLog: AuditLogInsertRecord = {
        actor_profile_id: currentProfile.primary_key,
        action: auditLogProps.action,
        client_id: auditLogProps.clientId,
        collection_centre_id: auditLogProps.collectionCentreId,
        event_id: auditLogProps.eventId,
        list_id: auditLogProps.listId,
        packing_slot_id: auditLogProps.packingSlotId,
        parcel_id: auditLogProps.parcelId,
        profile_id: auditLogProps.profileId,
        content: auditLogProps.content,
        wasSuccess: auditLogProps.wasSuccess,
        log_id: auditLogProps.logId,
        website_data: auditLogProps.websiteData,
        wiki_id: auditLogProps.wikiId,
        dietary_requirement: auditLogProps.dietaryRequirement,
        delivery_areas_id: auditLogProps.deliveryAreasId,
    };

    const supabase = getSupabaseServerComponentClient();

    const { error } = await supabase
        .from("audit_log")
        .insert(auditLog)
        .select("primary_key, client_id");

    if (error) {
        const logId = await logErrorReturnLogId("failed to add audit log", error);
        throw new DatabaseError("insert", "audit log", logId);
    }
}
