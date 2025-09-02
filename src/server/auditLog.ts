"use server";

import { InsertSchema } from "@/databaseUtils";
import { logErrorReturnLogId } from "@/logger/logger";
import { DatabaseError } from "@/app/errorClasses";
import { Json } from "@/databaseTypesFile";
import { getSupabaseServerComponentClient } from "@/supabaseServer";
import { getCurrentProfile } from "./getCurrentProfile";
import { CollectionCentresTableRow } from "@/app/admin/collectionCentresTable/CollectionCentreActions";
import supabase from "@/supabaseClient";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { diff } from "json-diff-ts";
import { Supabase } from "@/supabaseUtils";


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

export type FetchResult = 
    | {
          data: CollectionCentresTableRow;
          error: null;
      }
    | {
        data: null;
        error: {
            type: PostgrestError;
            logId: string;
        };
    };

export interface beforeAndAfter {
    before: {};
    after: {};
};

export const fetchCollectionCentreWithId = async (
    id: string
): Promise<CollectionCentresTableRow | null> => {
    const supabase = getSupabaseServerComponentClient();
    const { data: latestRow, error } = await supabase
            .from("collection_centres")
            .select("*")
            .eq("primary_key", id)
            .single();

        if (error || !latestRow) {
            return null;
        }

        const mappedRow: CollectionCentresTableRow = {
            id: latestRow.primary_key,
            name: latestRow.name,
            acronym: latestRow.acronym,
            isDelivery: latestRow.is_delivery,
            isShown: latestRow.is_shown,
            lastUpdated: latestRow.last_updated,
            timeSlots: latestRow.time_slots,
            isNew: false,
        };
    return mappedRow;
};

export const getBeforeAndAfter = (oldCollectionCentre: {}, newCollectionCentre: {}): {before: {}, after: {}} => {
    let comparison = diff(oldCollectionCentre, newCollectionCentre, { keysToSkip:['lastUpdated']});

    const before = comparison.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, any>);

    const after = comparison.reduce((acc, curr) => {
        acc[curr.key] = curr.oldValue;
        return acc;
    }, {} as Record<string, any>);

    return {
        before: before,
        after: after,
    };
}