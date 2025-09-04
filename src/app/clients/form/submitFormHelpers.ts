import { InsertSchema, UpdateSchema } from "@/databaseUtils";
import { checkboxGroupToArray, Person } from "@/components/Form/formFunctions";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import { ClientFields } from "./ClientForm";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { ListType } from "@/common/databaseListTypes";

export type FamilyDatabaseInsertRecord = Omit<InsertSchema["families"], "family_id">;
export type ClientDatabaseInsertRecord = InsertSchema["clients"];
export type ClientDatabaseUpdateRecord = UpdateSchema["clients"];

const personToFamilyRecordWithoutFamilyId = (person: Person): FamilyDatabaseInsertRecord => {
    return {
        gender: person.gender,
        birth_year: person.birthYear ?? null,
        birth_month: person.birthMonth ?? null,
        recorded_as_child: person.recordedAsChild ?? null,
    };
};

export const getFamilyMembersForDatabase = (
    adults: Person[],
    children: Person[]
): FamilyDatabaseInsertRecord[] => {
    const peopleToInsert = children.concat(adults);

    return peopleToInsert.map((person) => personToFamilyRecordWithoutFamilyId(person));
};

export const formatFromPrimaryKey =
    <T extends { primaryKey: string; additionalInfo?: string }, K extends string>(key: K) =>
    (items: T[]): Array<{ [P in K]: string } & { notes?: string }> =>
        items.map((item) => {
            const result = { [key]: item.primaryKey } as { [P in K]: string } & { notes?: string };
            if (item.additionalInfo) {
                result.notes = item.additionalInfo;
            }
            return result;
        });

export const formatClientRecord = (
    fields: ClientFields
): ClientDatabaseInsertRecord | ClientDatabaseUpdateRecord => {
    return {
        full_name: fields.fullName,
        email: fields.email,
        phone_number: fields.phoneNumber,
        address_1: fields.addressLine1,
        address_2: fields.addressLine2,
        address_town: fields.addressTown,
        address_county: fields.addressCounty,
        address_postcode: fields.addressPostcode,
        default_list: fields.listType as ListType,
        cooking_facilities:
            fields.cookingFacilities !== null
                ? checkboxGroupToArray(fields.cookingFacilities)
                : null,
        dietary_requirements:
            fields.dietaryRequirements !== null
                ? checkboxGroupToArray(fields.dietaryRequirements)
                : null,
        baby_food: fields.babyFood,
        baby_formula: fields.babyFormula,
        baby_nappies: fields.babyNappies,
        baby_other_items: checkboxGroupToArray(fields.babyOtherItems),
        pet_food: checkboxGroupToArray(fields.petFood),
        delivery_instructions: fields.deliveryInstructions,
        extra_information: fields.extraInformation,
        signposting_call_required: fields.signpostingCall,
        signposting_call_reasons:
            fields.signpostingCall && fields.signpostingCallReasons !== null
                ? checkboxGroupToArray(fields.signpostingCallReasons)
                : null,
        flagged_for_attention: fields.attentionFlag,
        last_updated: fields.lastUpdated,
        notes: fields.notes,
    };
};

type addClientErrors = "failedToInsertClientAndFamily";
export type addClientResult =
    | { clientId: string; error: null }
    | {
          clientId: null;
          error: { type: addClientErrors; logId: string };
      };

export const submitAddClientForm = async (fields: ClientFields): Promise<addClientResult> => {
    const clientRecord = formatClientRecord(fields);
    const familyMembers = getFamilyMembersForDatabase(fields.adults, fields.children);
    const clientDiets = formatFromPrimaryKey("diet_id")(fields.diets);
    const clientSelectedItems = formatFromPrimaryKey("item_id")([
        ...fields.preferredItems,
        ...fields.otherItems,
        ...fields.hygieneProducts,
    ]);

    const { data: clientId, error } = await supabase.rpc("insert_client_and_family", {
        clientrecord: clientRecord,
        familymembers: familyMembers,
        clientdiets: clientDiets,
        clientpreferreditems: clientSelectedItems,
    });

    const auditLog = {
        action: "add a client",
        content: {
            clientDetails: clientRecord,
            familyMembers: familyMembers,
            clientDiets: clientDiets,
            clientPreferredItems: clientSelectedItems,
        },
    } as const satisfies Partial<AuditLog>;

    if (error) {
        const logId = await logErrorReturnLogId(
            "Error with inserting new client and their family",
            {
                error,
            }
        );
        await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
        return { clientId: null, error: { type: "failedToInsertClientAndFamily", logId } };
    }

    await sendAuditLog({
        ...auditLog,
        wasSuccess: true,
        clientId: clientId,
    });
    return { clientId: clientId, error: null };
};

type editClientErrors = "failedToUpdateClientAndFamily" | "noRowsUpdated";
type editClientResult =
    | { clientId: string; error: null }
    | {
          clientId: null;
          error: { type: editClientErrors; logId: string } | null;
      };

export const submitEditClientForm = async (
    fields: ClientFields,
    primaryKey: string
): Promise<editClientResult> => {
    const clientRecord = formatClientRecord(fields);
    const familyMembers = getFamilyMembersForDatabase(fields.adults, fields.children);
    const clientDiets = formatFromPrimaryKey("diet_id")(fields.diets);
    const clientSelectedItems = formatFromPrimaryKey("item_id")([
        ...fields.preferredItems,
        ...fields.otherItems,
        ...fields.hygieneProducts,
    ]);

    const { data: clientDataAndCount, error: updateClientError } = await supabase.rpc(
        "update_client_and_family",
        {
            clientrecord: clientRecord,
            familymembers: familyMembers,
            clientid: primaryKey,
            clientdiets: clientDiets,
            clientpreferreditems: clientSelectedItems,
        }
    );

    const auditLog = {
        action: "edit a client",
        content: {
            clientDetails: clientRecord,
            familyMembers: familyMembers,
            clientDiets: clientDiets,
            clientPreferredItems: clientSelectedItems,
        },
        clientId: primaryKey,
    } as const satisfies Partial<AuditLog>;

    if (updateClientError) {
        const logId = await logErrorReturnLogId(
            `Error with updating client and their family: Client id ${primaryKey}`,
            {
                error: updateClientError,
            }
        );
        await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
        return { clientId: null, error: { type: "failedToUpdateClientAndFamily", logId } };
    }

    if (clientDataAndCount.updatedrows === 0) {
        const logId = await logWarningReturnLogId(
            "Concurrent editing of client or editing deleted client"
        );
        await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
        return { clientId: null, error: { type: "noRowsUpdated", logId } };
    }

    await sendAuditLog({
        ...auditLog,
        wasSuccess: true,
    });

    return { clientId: clientDataAndCount.clientid, error: null };
};
