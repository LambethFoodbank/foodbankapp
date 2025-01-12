import batchParcelsReducer from "@/app/batch-create/batchParcelsReducer";
import {
    mockExistingClientRow,
    mockExistingClientRowWithNappySize,
    mockExistingFamily,
    mockExistingNappyFamily,
    mockTableDataState,
} from "@/app/batch-create/_tests/mockData";
import { expect, it } from "@jest/globals";
import { BatchActionType } from "@/app/batch-create/types";
import { getEmptyBatchEditData } from "@/app/batch-create/emptyData";

jest.mock("@/app/batch-create/helpers/supabaseHelpers", () => ({
    getClientFromClients: jest.fn((clientId: string) =>
        clientId === "dcb54bc0-b0d3-57fa-bf9b-f1c4da6931a9"
            ? {
                  data: mockExistingClientRow,
                  error: null,
              }
            : {
                  data: mockExistingClientRowWithNappySize,
                  error: null,
              }
    ),
    getAllPeopleFromFamily: jest.fn((familyId: string) =>
        familyId === "family-test-id"
            ? {
                  data: mockExistingFamily,
                  error: null,
              }
            : {
                  data: mockExistingNappyFamily,
                  error: null,
              }
    ),
}));

const logID = "a2adb0ba-873e-506b-abd1-8cd1782923c8";
jest.mock("@/logger/logger", () => ({
    logErrorReturnLogId: jest.fn(() => Promise.resolve(logID)),
}));

describe("reducer", () => {
    it("should update a cell in the batch data", async () => {
        const action: BatchActionType = {
            type: "update_cell",
            updateCellPayload: {
                rowId: mockTableDataState.batchDataRows[0].id,
                newValueAndFieldName: {
                    type: "client",
                    fieldName: "address",
                    newValue: {
                        addressLine1: "123 New Street",
                        addressLine2: null,
                        addressTown: "Anytown",
                        addressCounty: "USA",
                        addressPostcode: "12345",
                    },
                },
            },
        };
        const newState = await batchParcelsReducer(mockTableDataState, action);
        expect(newState.batchDataRows[0].data.client.address?.addressLine1).toEqual(
            "123 New Street"
        );
        expect(newState.batchDataRows[0].data.client.fullName).toEqual("John Doe");
    });
    it("should add a new row to the batch data", async () => {
        const action: BatchActionType = {
            type: "add_row",
        };

        const newState = await batchParcelsReducer(mockTableDataState, action);

        expect(newState.batchDataRows.length).toBe(3);
        expect(newState.batchDataRows[2].id).toBe(3);
        expect(newState.batchDataRows[2].data.client.fullName).toBe(null);
    });
    it("should not add a new row if 99 rows already exist", async () => {
        const ninetyNineEmptyBatchTableRows = Array.from({ length: 99 }, (index: number) => ({
            id: index + 1,
            clientId: null,
            data: getEmptyBatchEditData(),
        }));
        const fullBatchTableState = {
            overrideDataRow: {
                data: {
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
                        signpostingCallReasons: null,
                        notes: null,
                    },
                    parcel: {
                        voucherNumber: null,
                        packingDate: null,
                        packingSlot: null,
                        shippingMethod: null,
                        collectionInfo: null,
                    },
                },
            },
            batchDataRows: ninetyNineEmptyBatchTableRows,
            clientOverrides: [],
            parcelOverrides: [],
        };
        const action: BatchActionType = {
            type: "add_row",
        };
        expect(fullBatchTableState.batchDataRows.length).toBe(99);
        const newState = await batchParcelsReducer(fullBatchTableState, action);
        expect(newState.batchDataRows.length).toBe(99);
    });

    it("should delete a row from the batch data", async () => {
        const action: BatchActionType = {
            type: "delete_row",
            deleteRowPayload: {
                rowId: 1,
            },
        };
        const newState = await batchParcelsReducer(mockTableDataState, action);

        expect(newState.batchDataRows.length).toBe(1);
        expect(newState.batchDataRows[0].data.client.fullName).toBe("Jane Smiths");
    });

    it("should override a column in the override data", async () => {
        const action: BatchActionType = {
            type: "override_column",
            overrideColumnPayload: {
                newOverrideRow: {
                    data: {
                        client: {
                            fullName: null,
                            phoneNumber: null,
                            address: {
                                addressLine1: "new group address",
                                addressLine2: null,
                                addressTown: "Anytown",
                                addressCounty: "USA",
                                addressPostcode: "12345",
                            },
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
                            signpostingCallReasons: null,
                            notes: null,
                        },
                        parcel: {
                            voucherNumber: null,
                            packingDate: null,
                            packingSlot: null,
                            shippingMethod: null,
                            collectionInfo: null,
                        },
                    },
                },
            },
        };

        const newState = await batchParcelsReducer(mockTableDataState, action);

        expect(newState.clientOverrides).toContainEqual({
            field: "address",
            value: {
                addressLine1: "new group address",
                addressLine2: null,
                addressTown: "Anytown",
                addressCounty: "USA",
                addressPostcode: "12345",
            },
        });
    });

    it("should remove an override column correctly", async () => {
        const actionOverrideTwoColumns: BatchActionType = {
            type: "override_column",
            overrideColumnPayload: {
                newOverrideRow: {
                    data: {
                        client: {
                            fullName: null,
                            phoneNumber: null,
                            address: {
                                addressLine1: "new group address",
                                addressLine2: null,
                                addressTown: "Anytown",
                                addressCounty: "USA",
                                addressPostcode: "12345",
                            },
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
                            signpostingCallReasons: null,
                            notes: null,
                        },
                        parcel: {
                            voucherNumber: "testVoucher",
                            packingDate: null,
                            packingSlot: null,
                            shippingMethod: null,
                            collectionInfo: null,
                        },
                    },
                },
            },
        };
        const twoColumnOverridenState = await batchParcelsReducer(
            mockTableDataState,
            actionOverrideTwoColumns
        );

        const actionRemoveParcelOverride: BatchActionType = {
            type: "remove_override_column",
            removeOverrideColumnPayload: {
                parcelField: "voucherNumber",
            },
        };

        const oneColumnOverridenState = await batchParcelsReducer(
            twoColumnOverridenState,
            actionRemoveParcelOverride
        );
        expect(oneColumnOverridenState.clientOverrides).toContainEqual({
            field: "address",
            value: {
                addressLine1: "new group address",
                addressLine2: null,
                addressTown: "Anytown",
                addressCounty: "USA",
                addressPostcode: "12345",
            },
        });

        const actionRemoveClientOverride: BatchActionType = {
            type: "remove_override_column",
            removeOverrideColumnPayload: {
                clientField: "address",
            },
        };

        const noColumnOverridenState = await batchParcelsReducer(
            oneColumnOverridenState,
            actionRemoveClientOverride
        );

        expect(noColumnOverridenState.clientOverrides).toEqual([]);
    });

    it("should remove all overrides correctly", async () => {
        const actionOverride: BatchActionType = {
            type: "override_column",
            overrideColumnPayload: {
                newOverrideRow: {
                    data: {
                        client: {
                            fullName: null,
                            phoneNumber: null,
                            address: {
                                addressLine1: "new group address",
                                addressLine2: null,
                                addressTown: "Anytown",
                                addressCounty: "USA",
                                addressPostcode: "12345",
                            },
                            adultInfo: null,
                            childrenInfo: null,
                            listType: null,
                            cookingFacilities: null,
                            dietaryRequirements: null,
                            feminineProducts: null,
                            babyProducts: "Yes",
                            nappySize: "10",
                            petFood: null,
                            otherItems: null,
                            deliveryInstructions: null,
                            extraInformation: null,
                            attentionFlag: null,
                            signpostingCall: null,
                            signpostingCallReasons: null,
                            notes: "test override notes",
                        },
                        parcel: {
                            voucherNumber: "testVoucher",
                            packingDate: null,
                            packingSlot: null,
                            shippingMethod: "Carrier Pigeon",
                            collectionInfo: null,
                        },
                    },
                },
            },
        };
        const ColumnOverridenState = await batchParcelsReducer(mockTableDataState, actionOverride);
        const actionRemoveAllOverrides: BatchActionType = {
            type: "remove_all_overrides",
        };

        const noColumnOverridenState = await batchParcelsReducer(
            ColumnOverridenState,
            actionRemoveAllOverrides
        );
        expect(noColumnOverridenState.clientOverrides).toEqual([]);
    });

    // When the use existing client method is implemented in the reducer use this test

    it.skip("should autofill for an existing client and format result correctly", async () => {
        const actionAddRow: BatchActionType = {
            type: "add_row",
        };

        const lastRowEmptyState1 = await batchParcelsReducer(mockTableDataState, actionAddRow);

        const actionUseExistingClient: BatchActionType = {
            type: "use_existing_client",
            useExistingClientPayload: {
                rowId: 3,
                existingClientId: "dcb54bc0-b0d3-57fa-bf9b-f1c4da6931a9",
            },
        };
        const existingClientState = await batchParcelsReducer(
            lastRowEmptyState1,
            actionUseExistingClient
        );
        expect(existingClientState.batchDataRows[2].data.client.fullName).toBe("Test Person");
        expect(existingClientState.batchDataRows[2].data.client.address).toStrictEqual({
            addressLine1: "3454 Test St",
            addressLine2: "",
            addressTown: "Test Town",
            addressCounty: "Test County",
            addressPostcode: "TE5T 1NG",
        });
        expect(existingClientState.batchDataRows[2].data.client.adultInfo).toStrictEqual({
            adults: [
                { gender: "male", birthYear: 1980, birthMonth: null },
                { gender: "female", birthYear: 1985, birthMonth: null },
                { gender: "female", birthYear: 2008, birthMonth: 7 },
            ],
            numberOfAdults: 3,
        });

        const lastRowEmptyState2 = await batchParcelsReducer(existingClientState, actionAddRow);

        const actionUseExistingNappyClient: BatchActionType = {
            type: "use_existing_client",
            useExistingClientPayload: {
                rowId: 4,
                existingClientId: "44d14896-357b-5e91-ab64-2ca95b6a2faa",
            },
        };

        const existingNappyClientState = await batchParcelsReducer(
            lastRowEmptyState2,
            actionUseExistingNappyClient
        );
        expect(existingNappyClientState.batchDataRows[3].data.client.fullName).toBe(
            "Test Nappy Person"
        );
        expect(existingNappyClientState.batchDataRows[3].data.client.nappySize).toBe("10");
        expect(existingNappyClientState.batchDataRows[3].data.client.extraInformation).toBe(
            "I love nappies"
        );
        expect(existingNappyClientState.batchDataRows[3].data.client.adultInfo).toStrictEqual({
            adults: [{ gender: "male", birthYear: 1980, birthMonth: null }],
            numberOfAdults: 1,
        });
    });
});
