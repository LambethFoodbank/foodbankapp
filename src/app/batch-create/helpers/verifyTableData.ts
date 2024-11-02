// Note: there's two versions of the main function here: one with logging and one without.
// Since this is a check that happens before submission, we don't want to log any errors.
// The old version is still here because the logging is quite tied into the data structures
// and removing it is being done by the tech lead after the internship had ended.
// The next time someone touches this file, feel free to clean it up and remove the old version.
import { logErrorReturnLogId } from "@/logger/logger";
import { BatchClient, ParcelData, BatchTableDataState } from "@/app/batch-create/types";
import { AddBatchRowError } from "@/app/batch-create/helpers/submitTableData";

const checkRequiredClientDataIsNotEmpty = (client: BatchClient): boolean => {
    return (
        client.fullName !== null &&
        client.address !== null &&
        client.adultInfo !== null &&
        client.listType !== null &&
        client.babyProducts !== null &&
        client.attentionFlag !== null &&
        client.signpostingCall !== null
    );
};

const checkRequiredParcelDataIsNotEmpty = (parcel: ParcelData): boolean => {
    const hasRequiredFields: boolean =
        parcel.packingDate !== null &&
        parcel.packingSlot !== null &&
        parcel.shippingMethod !== null;

    const validCollectionOrDelivery: boolean =
        parcel.shippingMethod !== "Collection" ||
        (parcel.shippingMethod === "Collection" && parcel.collectionInfo !== null);

    return hasRequiredFields && validCollectionOrDelivery;
};

export const checkParcelDataIsNotEmpty = (parcel: ParcelData): boolean => {
    return Object.values(parcel).every((value) => value == null);
};

export const verifyBatchTableDataSilent = (tableState: BatchTableDataState): AddBatchRowError[] => {
    const confirmationErrors: AddBatchRowError[] = [];

    for (const dataRow of tableState.batchDataRows) {
        const { client, parcel } = dataRow.data;
        const rowId: number = dataRow.id;

        if (!checkRequiredClientDataIsNotEmpty(client)) {
            confirmationErrors.push({
                rowId,
                error: {
                    type: "missingRequiredClientData",
                    logId: "silent",
                },
                displayMessage: "Missing Required Client Data",
            });
            continue;
        }

        if (checkParcelDataIsNotEmpty(parcel)) {
            continue;
        }

        if (!checkRequiredParcelDataIsNotEmpty(parcel)) {
            confirmationErrors.push({
                rowId,
                error: {
                    type: "missingRequiredParcelData",
                    logId: "silent",
                },
                displayMessage: "Missing Required Parcel Data",
            });
        }
    }
    return confirmationErrors;
};

// Being kept in case we want to add logging back
export const verifyBatchTableDataAndLogErrors = async (
    tableState: BatchTableDataState
): Promise<AddBatchRowError[]> => {
    const confirmationErrors: AddBatchRowError[] = [];

    for (const dataRow of tableState.batchDataRows) {
        const { client, parcel } = dataRow.data;
        const rowId: number = dataRow.id;

        if (!checkRequiredClientDataIsNotEmpty(client)) {
            const logId = await logErrorReturnLogId("Client has missing data");
            confirmationErrors.push({
                rowId,
                error: {
                    type: "missingRequiredClientData",
                    logId: logId,
                },
                displayMessage: "Missing Required Client Data",
            });
            continue;
        }

        if (checkParcelDataIsNotEmpty(parcel)) {
            continue;
        }

        if (!checkRequiredParcelDataIsNotEmpty(parcel)) {
            const logId = await logErrorReturnLogId("Parcel has missing data");
            confirmationErrors.push({
                rowId,
                error: {
                    type: "missingRequiredParcelData",
                    logId: logId,
                },
                displayMessage: "Missing Required Parcel Data",
            });
        }
    }
    return confirmationErrors;
};
