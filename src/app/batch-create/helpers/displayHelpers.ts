import { BooleanGroup } from "@/components/DataInput/inputHandlerFactories";
import { BatchGridDisplayRow } from "@/app/batch-create/BatchParcelDataGrid";
import {
    CollectionInfo,
    OverrideDataRow,
    BatchDataRow,
    BatchTableDataState,
    Address,
} from "@/app/batch-create/types";
import { RefObject } from "react";
import { capitaliseWords } from "@/common/format";

const getEmptyRow = (id: number): BatchGridDisplayRow => {
    return {
        id: id,
        fullName: "",
        phoneNumber: "",
        email: "",
        address: "",
        adults: null,
        children: null,
        listType: "",
        dietaryRequirements: "",
        petFood: "",
        otherItems: "",
        deliveryInstructions: "",
        extraInformation: "",
        attentionFlag: "",
        signpostingCall: "",
        notes: "",
        voucherNumber: "",
        packingDate: "",
        packingSlot: "",
        shippingMethod: "",
        collectionInfo: "",
    };
};

export const addressToString = (address: Address | null): string | null => {
    if (!address) {
        return null;
    }
    const addressArray: string[] = [];
    for (const key in address) {
        if (address[key] !== null) {
            addressArray.push(address[key]);
        }
    }
    return addressArray.join(", ");
};

export const collectionInfoToString = (collectionInfo: CollectionInfo | null): string => {
    if (!collectionInfo) {
        return "";
    }
    const { collectionDate, collectionSlot, collectionCentreAcronymn } = collectionInfo;
    return `${collectionDate}, ${collectionSlot.slice(0, -3)}, ${collectionCentreAcronymn}`;
};

export const booleanGroupToString = (booleanGroup: BooleanGroup | null): string => {
    if (!booleanGroup) {
        return "";
    }
    const trueKeys: string[] = Object.keys(booleanGroup).filter((key) => booleanGroup[key]);
    return trueKeys.join(", ");
};

const overrideDataToOverrideDisplayRow = (dataRow: OverrideDataRow): BatchGridDisplayRow => {
    if (!dataRow.data) {
        return getEmptyRow(0);
    }
    const {
        phoneNumber,
        email,
        address,
        adultInfo,
        childrenInfo,
        listType,
        dietaryRequirements,
        petFood,
        otherItems,
        deliveryInstructions,
        extraInformation,
        attentionFlag,
        signpostingCall,
        notes,
    } = dataRow.data.client;
    const { voucherNumber, packingDate, packingSlot, shippingMethod, collectionInfo } =
        dataRow.data.parcel;
    return {
        id: 0,
        fullName: "",
        phoneNumber: phoneNumber ?? "",
        email: email ?? "",
        address: addressToString(address) ?? "",
        adults: adultInfo ? (adultInfo.numberOfAdults ? adultInfo.numberOfAdults : null) : null,
        children: childrenInfo
            ? childrenInfo.numberOfChildren
                ? childrenInfo.numberOfChildren
                : null
            : null,
        listType: listType ? capitaliseWords(listType) : "",
        dietaryRequirements: dietaryRequirements ? booleanGroupToString(dietaryRequirements) : "",
        petFood: petFood ? booleanGroupToString(petFood) : "",
        otherItems: otherItems ? booleanGroupToString(otherItems) : "",
        deliveryInstructions: deliveryInstructions ?? "",
        extraInformation: extraInformation ?? "",
        attentionFlag: attentionFlag ? "Yes" : attentionFlag === false ? "No" : "",
        signpostingCall: signpostingCall ? "Yes" : signpostingCall === false ? "No" : "",
        notes: notes ?? "",
        voucherNumber: voucherNumber ?? "",
        packingDate: packingDate ?? "",
        packingSlot: packingSlot ?? "",
        shippingMethod: shippingMethod ?? "",
        collectionInfo: collectionInfoToString(collectionInfo),
    };
};

const batchDataToBatchDisplayRow = (dataRow: BatchDataRow): BatchGridDisplayRow | null => {
    if (!dataRow.data) {
        return getEmptyRow(dataRow.id);
    }
    const {
        fullName,
        phoneNumber,
        email,
        address,
        adultInfo,
        childrenInfo,
        listType,
        dietaryRequirements,
        petFood,
        otherItems,
        deliveryInstructions,
        extraInformation,
        attentionFlag,
        signpostingCall,
        notes,
    } = dataRow.data.client;
    const {
        voucherNumber = "",
        packingDate = "",
        packingSlot = "",
        shippingMethod = "",
        collectionInfo = null,
    } = dataRow.data.parcel || {};

    return {
        id: dataRow.id,
        fullName: fullName ?? "",
        phoneNumber: phoneNumber ?? "",
        email: email ?? "",
        address: addressToString(address) ?? "",
        adults: adultInfo ? (adultInfo.numberOfAdults ? adultInfo.numberOfAdults : null) : null,
        children: childrenInfo
            ? childrenInfo.numberOfChildren
                ? childrenInfo.numberOfChildren
                : null
            : null,
        listType: listType ? capitaliseWords(listType) : "",
        dietaryRequirements: dietaryRequirements ? booleanGroupToString(dietaryRequirements) : "",
        petFood: petFood ? booleanGroupToString(petFood) : "",
        otherItems: otherItems ? booleanGroupToString(otherItems) : "",
        deliveryInstructions: deliveryInstructions ?? "",
        extraInformation: extraInformation ?? "",
        attentionFlag: attentionFlag ? "Yes" : attentionFlag === false ? "No" : "",
        signpostingCall: signpostingCall ? "Yes" : signpostingCall === false ? "No" : "",
        notes: notes ?? "",
        voucherNumber: voucherNumber ?? "",
        packingDate: packingDate ?? "",
        packingSlot: packingSlot ?? "",
        shippingMethod: shippingMethod ?? "",
        collectionInfo: collectionInfoToString(collectionInfo),
    };
};

export const tableStateToBatchDisplayRows = (
    tableState: BatchTableDataState
): BatchGridDisplayRow[] => {
    const displayRows: BatchGridDisplayRow[] = [];
    displayRows.push(overrideDataToOverrideDisplayRow(tableState.overrideDataRow));
    tableState.batchDataRows.forEach((row) => {
        const displayRow = batchDataToBatchDisplayRow(row);
        if (displayRow) {
            displayRows.push(displayRow);
        }
    });
    return displayRows;
};

//this keypress is to exit edit mode for the current cell. the built in method setCellMode is part of the pro version so this workaround is used instead
export const simulateEscapeKeyPress = (gridCellReference: RefObject<HTMLDivElement>): void => {
    const event = new KeyboardEvent("keydown", {
        bubbles: true,
        key: "Escape",
    });
    if (gridCellReference.current) {
        gridCellReference.current.dispatchEvent(event);
    }
};
