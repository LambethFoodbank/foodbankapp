import {
    BatchClient,
    BatchDataRow,
    ParcelData,
    BatchTableDataState,
    CollectionInfo,
} from "@/app/batch-create/types";
import {
    addClientResult,
    ClientDatabaseInsertRecord,
    FamilyDatabaseInsertRecord,
    getFamilyMembersForDatabase,
} from "@/app/clients/form/submitFormHelpers";
import { EXTRA_INFORMATION_LABEL, NAPPY_SIZE_LABEL } from "@/app/clients/form/labels";
import { checkboxGroupToArray, Person } from "@/components/Form/formFunctions";
import supabase from "@/supabaseClient";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { logErrorReturnLogId } from "@/logger/logger";
import {
    InsertParcelReturnType,
    ParcelDatabaseInsertRecord,
} from "@/app/parcels/form/submitFormHelpers";
import { mergeDateAndTime } from "@/app/parcels/form/ParcelForm";
import { ListType } from "@/common/databaseListTypes";
import { defaultTableState } from "@/app/batch-create/BatchParcelDataGrid";
import { Json } from "@/databaseTypesFile";
import { checkParcelDataIsNotEmpty } from "@/app/batch-create/helpers/verifyTableData";
import dayjs from "dayjs";
import { getDbDate } from "@/common/format";

const batchClientToClientRecord = (client: BatchClient): ClientDatabaseInsertRecord => {
    const extraInformationWithNappy =
        client.nappySize === ""
            ? client.extraInformation
            : `${NAPPY_SIZE_LABEL}${client.nappySize}, ${EXTRA_INFORMATION_LABEL}${client.extraInformation}`;

    return {
        full_name: client.fullName,
        phone_number: client.phoneNumber,
        address_1: client.address && client.address.addressLine1,
        address_2: client.address && client.address.addressLine2,
        address_town: client.address && client.address.addressTown,
        address_county: client.address && client.address.addressCounty,
        address_postcode: client.address && client.address.addressPostcode,
        default_list: client.listType || undefined,
        cooking_facilities: client.cookingFacilities
            ? checkboxGroupToArray(client.cookingFacilities)
            : [],
        dietary_requirements: client.dietaryRequirements
            ? checkboxGroupToArray(client.dietaryRequirements)
            : [],
        feminine_products: client.feminineProducts
            ? checkboxGroupToArray(client.feminineProducts)
            : [],
        baby_food: client.babyProducts === "Yes",
        pet_food: client.petFood ? checkboxGroupToArray(client.petFood) : [],
        other_items: client.otherItems ? checkboxGroupToArray(client.otherItems) : [],
        delivery_instructions: client.deliveryInstructions,
        extra_information: extraInformationWithNappy,
        signposting_call_required: client.signpostingCall,
        flagged_for_attention: client.attentionFlag,
        notes: client.notes,
    };
};

const batchClientToInsertRecords = (
    client: BatchClient
): { clientRecord: ClientDatabaseInsertRecord; familyMembers: FamilyDatabaseInsertRecord[] } => {
    const adults: Person[] = client.adultInfo?.adults || [];
    const children: Person[] = client.childrenInfo?.children || [];

    const clientRecord: ClientDatabaseInsertRecord = batchClientToClientRecord(client);
    const familyMembers: FamilyDatabaseInsertRecord[] = getFamilyMembersForDatabase(
        adults,
        children
    );

    return { clientRecord, familyMembers };
};

const submitClientRowToDb = async (client: BatchClient): Promise<addClientResult> => {
    const { clientRecord, familyMembers } = batchClientToInsertRecords(client);

    const { data: clientId, error } = await supabase.rpc("insert_client_and_family", {
        clientrecord: clientRecord,
        familymembers: familyMembers,
    });

    if (error) {
        const logId = await logErrorReturnLogId(
            "Error with inserting new client and their family",
            {
                error,
            }
        );
        return { clientId: null, error: { type: "failedToInsertClientAndFamily", logId } };
    }

    return { clientId: clientId, error: null };
};

const batchParcelToParcelRecord = (
    parcel: ParcelData,
    clientId: string,
    listType: ListType
): ParcelDatabaseInsertRecord => {
    const collectionInfo: CollectionInfo | null = parcel.collectionInfo;

    if (collectionInfo) {
        const collectionDateTime = mergeDateAndTime(
            collectionInfo.collectionDate,
            collectionInfo.collectionSlot
        ).toISOString();

        return {
            client_id: clientId,
            collection_centre: collectionInfo.collectionCentreId,
            collection_datetime: collectionDateTime,
            list_type: listType,
            packing_date: getDbDate(dayjs(parcel.packingDate)),
            packing_slot: parcel.packingSlot,
            voucher_number: parcel.voucherNumber,
        };
    }

    return {
        client_id: clientId,
        list_type: listType,
        packing_date: parcel.packingDate,
        packing_slot: parcel.packingSlot,
        voucher_number: parcel.voucherNumber,
    };
};

const submitParcelRowToDb = async (
    parcelRecord: ParcelDatabaseInsertRecord
): Promise<InsertParcelReturnType> => {
    const { data, error } = await supabase
        .from("parcels")
        .insert(parcelRecord)
        .select("primary_key")
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Error with insert: parcel data", error);
        return { parcelId: null, error: { type: "failedToInsertParcel", logId } };
    }

    return { parcelId: data.primary_key, error: null };
};

export interface AddBatchRowError {
    [key: string]: Json;
    rowId: number;
    error: {
        type: string;
        logId: string;
    };
    displayMessage: string;
}

export const filterUnsubmittedRows = (
    tableState: BatchTableDataState,
    errors: AddBatchRowError[]
): BatchTableDataState => {
    if (errors.length === 0) {
        return defaultTableState;
    }

    const errorRowIds: number[] = errors.map((error) => error.rowId);

    const newBatchDataRows: BatchDataRow[] = tableState.batchDataRows.filter((dataRow) => {
        return errorRowIds.includes(dataRow.id);
    });

    return {
        ...tableState,
        batchDataRows: newBatchDataRows,
    };
};

export interface SubmitBatchResult {
    submitErrors: AddBatchRowError[];
    newClientIds: string[];
    newParcelIds: string[];
}

const submitBatchTableData = async (
    tableState: BatchTableDataState
): Promise<SubmitBatchResult> => {
    const submitErrors: AddBatchRowError[] = [];
    const newClientIds: string[] = [];
    const newParcelIds: string[] = [];

    for (const dataRow of tableState.batchDataRows) {
        const { client, parcel } = dataRow.data;
        const rowId: number = dataRow.id;

        const { clientId, error: clientError } = dataRow.clientId
            ? { clientId: dataRow.clientId, error: null }
            : await (async () => {
                  const result: addClientResult = await submitClientRowToDb(client);
                  result.clientId && newClientIds.push(result.clientId);
                  return result;
              })();

        if (clientError) {
            submitErrors.push({
                rowId,
                error: clientError,
                displayMessage: "Client Submission Error",
            });
            continue;
        }

        const listType: ListType = client.listType || "regular";

        if (checkParcelDataIsNotEmpty(parcel)) {
            continue;
        }

        const parcelRecord: ParcelDatabaseInsertRecord = batchParcelToParcelRecord(
            parcel,
            clientId,
            listType
        );

        const { parcelId, error: parcelError } = await submitParcelRowToDb(parcelRecord);

        if (parcelError) {
            submitErrors.push({
                rowId,
                error: parcelError,
                displayMessage: "Parcel Submission Error",
            });
            continue;
        }

        parcelId && newParcelIds.push(parcelId);
    }

    const auditLog = {
        action: "add a batch",
        content: {
            submitErrors: submitErrors,
            newClientIds: newClientIds,
            newParcelIds: newParcelIds,
        },
    } as const satisfies Partial<AuditLog>;

    if (submitErrors.length > 0) {
        const logId = await logErrorReturnLogId("Error with adding a batch");
        await sendAuditLog({ ...auditLog, wasSuccess: false, logId });
    } else {
        await sendAuditLog({ ...auditLog, wasSuccess: true });
    }

    return { submitErrors, newClientIds, newParcelIds };
};

export default submitBatchTableData;
