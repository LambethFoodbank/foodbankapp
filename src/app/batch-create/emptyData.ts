import { BatchEditData, OverrideData } from "@/app/batch-create/types";

export const getEmptyBatchEditData = (): BatchEditData => {
    return {
        client: {
            fullName: null,
            phoneNumber: null,
            address: null,
            adultInfo: null,
            childrenInfo: null,
            listType: null,
            cookingFacilities: null,
            dietaryRequirements: null,
            feminineProducts: null,
            babyProducts: null,
            nappySize: null,
            petFood: null,
            otherItems: null,
            deliveryInstructions: null,
            extraInformation: null,
            attentionFlag: null,
            signpostingCall: null,
            notes: null,
        },
        clientReadOnly: false,
        parcel: {
            voucherNumber: null,
            packingDate: null,
            packingSlot: null,
            shippingMethod: null,
            collectionInfo: null,
        },
    };
};

export const getEmptyOverrideData = (): OverrideData => {
    return {
        client: {
            fullName: null,
            phoneNumber: null,
            address: null,
            adultInfo: null,
            childrenInfo: null,
            listType: null,
            cookingFacilities: null,
            dietaryRequirements: null,
            feminineProducts: null,
            babyProducts: null,
            nappySize: null,
            petFood: null,
            otherItems: null,
            deliveryInstructions: null,
            extraInformation: null,
            attentionFlag: null,
            signpostingCall: null,
            notes: null,
        },
        parcel: {
            voucherNumber: null,
            packingDate: null,
            packingSlot: null,
            shippingMethod: null,
            collectionInfo: null,
        },
    };
};
