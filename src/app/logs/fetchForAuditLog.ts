'use client'

import { PostgrestError } from "@supabase/supabase-js";
import { CollectionCentresTableRow } from "../admin/collectionCentresTable/CollectionCentreActions";
import supabase from "@/supabaseClient";
import { diff, IChange } from "json-diff-ts";
import { UpdateUserProfile } from "../admin/manageUser/UpdateUserProfile";
import { PackingSlotRow } from "../admin/packingSlotsTable/PackingSlotsTable";
import { logErrorReturnLogId } from "@/logger/logger";
import { ClientDatabaseInsertRecord, ClientDatabaseUpdateRecord, FamilyDatabaseInsertRecord } from "../clients/form/submitFormHelpers";
import { ListType } from "@/common/databaseListTypes";
import { Schema } from "@/databaseUtils";
import { ListRow, listsHeaderKeysAndLabels } from "../lists/ListDataview";
import { ParcelsTableRow } from "../parcels/parcelsTable/types";
import { UpdateField } from "../parcels/ActionBar/ActionModals/CommonDateAndSlot";
import dayjs from "dayjs";
import { getDbDate } from "@/common/format";

export interface beforeAndAfter {
    before: {};
    after: {};
};

export type FetchCollectionCentre =
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
    
export const fetchCollectionCentreWithId = async (
    id: string
): Promise<FetchCollectionCentre> => {
    const { data: latestRow, error } = await supabase
        .from("collection_centres")
        .select("*")
        .eq("primary_key", id)
        .single();

    if (error || !latestRow) {
        const logId = await logErrorReturnLogId("Failed to fetch collection centre", error);
        return {
            data: null,
            error: {
                type: error,
                logId,
            },
        };
    }

    const mappedRow: CollectionCentresTableRow = {
        id: latestRow.primary_key,
        name: latestRow.name,
        acronym: latestRow.acronym,
        isDelivery: latestRow.is_delivery,
        isShown: latestRow.is_shown,
        lastUpdated: latestRow.last_updated,
        timeSlots: latestRow.time_slots,
        availableDays: latestRow.available_days,
        isNew: false,
    };
    return {
        data: mappedRow,
        error: null,
    };
};

export type FetchUserProfile =
    | {
        data: UpdateUserProfile;
        error: null;
      }
    | {
        data: null;
        error: {
            type: PostgrestError;
            logId: string;
        };
    };

export const fetchUpdateUserProfile = async (
    profileID: string,
): Promise<FetchUserProfile> => {
    const { data: latestRow, error } = await supabase
        .from("profiles")
        .select("role, first_name, last_name, telephone_number, email")
        .eq("primary_key", profileID)
        .single();

    if (error || !latestRow) {
        const logId = await logErrorReturnLogId("Failed to fetch user profile", error);
        return {
            data: null,
            error: {
                type: error,
                logId,
            },
        };
    }
    const mappedRow: UpdateUserProfile = {
        profileId: profileID,
        role: latestRow.role,
        firstName: latestRow.first_name ?? "",
        lastName: latestRow.last_name ?? "",
        phoneNumber: latestRow.telephone_number ?? "",
        email: latestRow.email ?? "",
    }
    return {
        data: mappedRow,
        error: null,
    };
};

export type FetchPackingSlot =
    | {
        data: PackingSlotRow;
        error: null;
      }
    | {
        data: null;
        error: {
            type: PostgrestError;
            logId: string;
        };
    };

export const fetchPackingSlot = async (
    packingSlotID: string | null
): Promise<FetchPackingSlot> => {
    const { data: latestRow, error } = await supabase.from("packing_slots").select().eq("primary_key", packingSlotID).single();

    if (error || !latestRow) {
        const logId = await logErrorReturnLogId("Failed to fetch packing slot", error);
        return {
            data: null,
            error: {
                type: error,
                logId,
            },
        };
    }

    const mappedRow = {
        name: latestRow.name,
        id: latestRow.primary_key,
        isShown: latestRow.is_shown,
        order: latestRow.order,
        isNew: false,
        lastUpdated: latestRow.last_updated,
    } as PackingSlotRow;
    return {
        data: mappedRow,
        error: null,
    };
}

type FetchWebsiteData =
    | {
        data: {
            name: string;
            value: string;
        };
        error: null;
    }
    | {
        data: null;
        error: {
            type: PostgrestError;
            logId: string;
        };
    };

export const fetchWebsiteDataRow = async (
    websiteDataID: string,
): Promise<FetchWebsiteData> => {
    const { data: latestRow, error } = await supabase.from("website_data").select().eq("name", websiteDataID).single();

    if (error || !latestRow) {
        const logId = await logErrorReturnLogId("Error with fetch: website data", error);
        return {
            data: null,
            error: {
                type: error,
                logId
            }
        };
    }
    
    const mappedRow = {
        name: latestRow.name,
        value: latestRow.value,
    };
    return {
        data: mappedRow,
        error: null,
    };
}

type FetchClientAndFamily = 
    | {
        data: {
            client: ClientDatabaseInsertRecord | ClientDatabaseUpdateRecord;
            family: FamilyDatabaseInsertRecord[];
        };
        error: null;
    }
    | {
        data: null;
        error: {
            type: PostgrestError;
            logId: string;
        };
    };

type ClientDatabaseRecord = Schema["clients"];

const formatClientRecord = (
    rawData: ClientDatabaseRecord
): ClientDatabaseInsertRecord | ClientDatabaseUpdateRecord => {
    return {
        full_name: rawData.full_name,
        email: rawData.email,
        phone_number: rawData.phone_number,
        address_1: rawData.address_1,
        address_2: rawData.address_2,
        address_town: rawData.address_town,
        address_county: rawData.address_county,
        address_postcode: rawData.address_postcode,
        default_list: rawData.default_list as ListType,
        cooking_facilities: rawData.cooking_facilities,
        dietary_requirements: rawData.dietary_requirements,
        hygiene_tampons: rawData.hygiene_tampons,
        hygiene_pads: rawData.hygiene_pads,
        hygiene_other_items: rawData.hygiene_other_items,
        baby_food: rawData.baby_food,
        baby_formula: rawData.baby_formula,
        baby_nappies: rawData.baby_nappies,
        baby_other_items: rawData.baby_other_items,
        pet_food: rawData.pet_food,
        other_items: rawData.other_items,
        delivery_instructions: rawData.delivery_instructions,
        extra_information: rawData.extra_information,
        signposting_call_required: rawData.signposting_call_required,
        signposting_call_reasons: rawData.signposting_call_reasons,
        last_updated: rawData.last_updated,
        notes: rawData.notes,
    };
};

type FetchClient = 
    | {
        data: ClientDatabaseInsertRecord | ClientDatabaseUpdateRecord;
        error: null;
    }
    | {
        data: ClientDatabaseRecord;
        error: null;
    }
    | {
        data: null;
        error: {
            type: PostgrestError;
            logId: string;
        };
    };

export const fetchClient = async (
    clientID: string,
): Promise<FetchClient> => {
    const { data: clientData, error: fetchClientError } = await supabase.from("clients").select().eq("primary_key", clientID).single();

    if (fetchClientError || !clientData) {
        const logId = await logErrorReturnLogId("Error with fetch: client data", fetchClientError);
        return {
            data: null,
            error: {
                type: fetchClientError,
                logId
            }
        };
    }
    const mappedClient = formatClientRecord(clientData) as ClientDatabaseInsertRecord | ClientDatabaseUpdateRecord;
    return {
        data: mappedClient,
        error: null,
    };
}

export const fetchClientAndFamily = async (
    clientID: string,
): Promise<FetchClientAndFamily> => {
    const { data: clientData, error: fetchClientError } = await supabase.from("clients").select().eq("primary_key", clientID).single();

    if (fetchClientError || !clientData) {
        const logId = await logErrorReturnLogId("Error with fetch: client data", fetchClientError);
        return {
            data: null,
            error: {
                type: fetchClientError,
                logId
            }
        };
    }

    const { data: familyData, error: fetchFamilyError } = await supabase.from("families").select().eq("family_id", clientData.family_id);

    if (fetchFamilyError || !familyData) {
        const logId = await logErrorReturnLogId("Error with fetch: client's family data", fetchFamilyError);
        return {
            data: null,
            error: {
                type: fetchFamilyError,
                logId
            }
        };
    }
    const mappedClient = formatClientRecord(clientData) as ClientDatabaseInsertRecord | ClientDatabaseUpdateRecord;
    const mappedFamily = familyData.map((person) => {
        return {
            gender: person.gender,
            birth_year: person.birth_year,
            birth_month: person.birth_month,
            recorded_as_child: person.recorded_as_child
        };
    }) as FamilyDatabaseInsertRecord[];
    return {
        data: {
            client: mappedClient,
            family: mappedFamily,
        },
        error: null,
    };
}

type FetchList = 
    | {
        data: Partial<Schema["lists"]>;
        error: null;
    }
    | {
        data: null;
        error: {
            type: PostgrestError;
            logId: string;
        };
    };
    
export const fetchList = async (
    listId: string | undefined,
): Promise<FetchList> => {

    if (!listId) {
        const logId = await logErrorReturnLogId("Error with fetch: list data");
        return {
            data: null,
            error: {
                type: {
                    message: "Invalid listId",
                    details: "list item undefined",
                    hint: "",
                    code: "",
                },
                logId,
            },
        };
    }
    const { data: listData, error: fetchListError } = await supabase.from("lists").select().eq("primary_key", listId).single();

    if (fetchListError || !listData) {
        const logId = await logErrorReturnLogId("Error with fetch: list data", fetchListError);
        return {
            data: null,
            error: {
                type: fetchListError,
                logId
            }
        };
    }

    return {
        data: listData,
        error: null,
    };
}

type FetchPackingDateOrSlot = 
    | {
        data: {
            oldValue: string;
            newValue: string;
        };
        error: null;
    }
    | {
        data: null;
        error: {
            type: PostgrestError;
            logId: string;
        };
    };

export const fetchPackingDateOrSlot = async (
    parcel: ParcelsTableRow,
    packingDateOrSlotId: string,
    updateField: UpdateField,
): Promise<FetchPackingDateOrSlot> => {
    if (updateField === 'packingDate') {
        return {
            data: {
                newValue: packingDateOrSlotId,
                oldValue: getDbDate(dayjs(parcel.packingDate)),
            },
            error: null,
        };
    }
    else {
        const packingSlot = await fetchPackingSlot(packingDateOrSlotId);

        return packingSlot.data ? {
            data: {
                newValue: packingSlot.data?.name,
                oldValue: parcel.packingSlot ?? "",
            },
            error: null,
        } : {
            data: null,
            error: packingSlot.error,
        };
    }
}

type FetchParcelStatus =
    | {
        data: string;
        error: null;
      }
    | {
        data: null;
        error: {
            type: PostgrestError;
            logId: string;
        };
    };

export const fetchParcelStatus = async (
    parcelId: string
): Promise<FetchParcelStatus> => {
    const { data: status, error: fetchError } = await supabase.from("parcels_events").select("last_event_name").eq("parcel_id", parcelId).single();
    if (fetchError || !status) {
        const logId = await logErrorReturnLogId("Error with fetch: parcel status", fetchError);
        return {
            data: null,
            error: {
                type: fetchError,
                logId
            }
        };
    }
    return {
        data: status.last_event_name ?? "",
        error: null,
    };
}

const getBefore = (comparison: IChange[] | undefined): Record<string, any> => {
    if (!comparison) {
        return {};
    }
    return comparison.reduce((acc, curr) => {
        acc[curr.key] = curr.oldValue ?? getBefore(curr.changes);
        return acc;
    }, {} as Record<string, any>);
}

const getAfter = (comparison: IChange[] | undefined):  Record<string, any> => {
    if (!comparison) {
        return {};
    }
    return comparison.reduce((acc, curr) => {
        acc[curr.key] = curr.value ?? getAfter(curr.changes);
        return acc;
    }, {} as Record<string, any>);
}

export const getBeforeAndAfterClientAndFamily = (
    oldClient: ClientDatabaseInsertRecord | ClientDatabaseUpdateRecord,
    oldFamily: FamilyDatabaseInsertRecord[],
    newClient: ClientDatabaseInsertRecord | ClientDatabaseUpdateRecord,
    newFamily: FamilyDatabaseInsertRecord[]
): { before: Record<string, any>; after: Record<string, any> } => {
    const clientComparison = diff(
        oldClient,
        newClient,
        {
            keysToSkip: ['lastUpdated', "baby_other_items", "cooking_facilities", "dietary_requirements", "hygiene_other_items", "other_items", "pet_food", "signposting_call_reasons"],
        }
    );

    // const familyComparison = diff(
    //     oldFamily,
    //     newFamily,
    
    // );
    const familyComparison = getStringArrayComparison(oldFamily.map(toString) ?? [], newFamily.map(toString) ?? [], "family");
    const babyOtherItemsComparison = getStringArrayComparison(oldClient.baby_other_items ?? [], newClient.baby_other_items ?? [], "baby_other_items");
    const cookingFacilitiesComparison = getStringArrayComparison(oldClient.cooking_facilities ?? [], newClient.cooking_facilities ?? [], "cooking_facilities");
    const dietaryRequirementComparison = getStringArrayComparison(oldClient.dietary_requirements ?? [], newClient.dietary_requirements ?? [], "dietary_requirements");
    const hygieneOtherItemsComparison = getStringArrayComparison(oldClient.hygiene_other_items ?? [], newClient.hygiene_other_items ?? [], "hygiene_other_items");
    const otherItemsComparison = getStringArrayComparison(oldClient.other_items ?? [], newClient.other_items ?? [], "other_items");
    const petFoodComparison = getStringArrayComparison(oldClient.pet_food ?? [], newClient.pet_food ?? [], "pet_food");
    const signpostingCallReasonsComparison = getStringArrayComparison(oldClient.signposting_call_reasons ?? [], newClient.signposting_call_reasons ?? [], "signposting_call_reasons");
    const beforeArrays = {
        ...(babyOtherItemsComparison?.before ?? {}),
        ...(cookingFacilitiesComparison?.before ?? {}),
        ...(dietaryRequirementComparison?.before ?? {}),
        ...(hygieneOtherItemsComparison?.before ?? {}),
        ...(otherItemsComparison?.before ?? {}),
        ...(petFoodComparison?.before ?? {}),
        ...(signpostingCallReasonsComparison?.before ?? {}),
    };
    const afterArrays = {
        ...(babyOtherItemsComparison?.after ?? {}),
        ...(cookingFacilitiesComparison?.after ?? {}),
        ...(dietaryRequirementComparison?.after ?? {}),
        ...(hygieneOtherItemsComparison?.after ?? {}),
        ...(otherItemsComparison?.after ?? {}),
        ...(petFoodComparison?.after ?? {}),
        ...(signpostingCallReasonsComparison?.after ?? {}),
    };

    console.log(clientComparison);

    return {
        before: {...getBefore(clientComparison), ...familyComparison?.before ?? {}, ...beforeArrays},
        after: {...getAfter(clientComparison), ...familyComparison?.after?? {}, ...afterArrays},
    };

}

const areArraysIdentical = (
    rowA: any[],
    rowB: any[],
): boolean => {
    if (rowA.length !== rowB.length) return false;
    const sortedA = [...rowA].sort();
    const sortedB = [...rowB].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
}

const getStringArrayComparison = (
    oldRow: string[],
    newRow: string[],
    fieldName: string,
): { before: Record<string, any>; after: Record<string, any> } | null => {
    
    return areArraysIdentical(oldRow, newRow) ? null : {
        before: {
            [fieldName]: oldRow.filter((elem) => !newRow.includes(elem))
        },
        after: {
            [fieldName]: newRow.filter((elem) => !oldRow.includes(elem)),
        }
    };
};

const normalizeToStringArray = (input: any[]): string[] => {
  return input.map((item) =>
    typeof item === 'string' ? item : JSON.stringify(item)
  );
};

export const getBeforeAndAfter = (
    oldRow: Record<string, any> | null,
    newRow: Record<string, any> | null,
    arrayFields: string[] = [],
): { before: Record<string, any>; after: Record<string, any> } => {
    if (!oldRow || !newRow) {
        return {
            before: {},
            after: {},
        };
    }
    if (arrayFields.length === 0) {
        arrayFields = []
    }
    const comparison = diff(oldRow, newRow, { keysToSkip: ['lastUpdated', 'last_updated', ...arrayFields] });

    if (arrayFields) {
        const arrayFieldsComparison = arrayFields.map((field) => getStringArrayComparison(normalizeToStringArray(oldRow[field]) ?? [], normalizeToStringArray(newRow[field]) ?? [], field));
        const beforeArrays = arrayFieldsComparison.reduce((acc, compare) => {
            if (compare?.before) {
                Object.assign(acc, compare.before);
            }
            return acc;
        }, {} as Record<string, any>);
        const afterArrays = arrayFieldsComparison.reduce((acc, compare) => {
            if (compare?.after) {
                Object.assign(acc, compare.after);
            }
            return acc;
        }, {} as Record<string, any>);
        return {
            before: { ...getBefore(comparison), ...beforeArrays },
            after: { ...getAfter(comparison), ...afterArrays},
        };
    }

    return {
        before: getBefore(comparison),
        after: getAfter(comparison),
    };
}