import { Schema } from "@/databaseUtils";
import { BatchTableDataState } from "@/app/batch-create/types";
import dayjs from "dayjs";
import { getEmptyBatchEditData, getEmptyOverrideData } from "@/app/batch-create/emptyData";

export const mockTableDataState: BatchTableDataState = {
    overrideDataRow: { data: getEmptyOverrideData() },
    batchDataRows: [
        {
            id: 1,
            clientId: "1",
            data: {
                client: {
                    fullName: "John Doe",
                    phoneNumber: "0123456789",
                    address: {
                        addressLine1: "123 Main St",
                        addressLine2: null,
                        addressTown: "Anytown",
                        addressCounty: "USA",
                        addressPostcode: "12345",
                    },
                    adultInfo: {
                        adults: [
                            {
                                gender: "male",
                                birthYear: 1973,
                            },
                        ],
                        numberOfAdults: 1,
                    },
                    childrenInfo: {
                        children: [],
                        numberOfChildren: 0,
                    },
                    listType: "hotel",
                    dietaryRequirements: { vegan: true },
                    feminineProducts: { tampons: false, pads: false },
                    babyProducts: null,
                    nappySize: null,
                    petFood: { cat: false, dog: false },
                    otherItems: { toothpaste: false, toothbrush: false },
                    deliveryInstructions: "Leave at 10 am",
                    extraInformation: "No special requests",
                    attentionFlag: true,
                    signpostingCall: false,
                    notes: null,
                },
                clientReadOnly: false,
                parcel: getEmptyBatchEditData().parcel,
            },
        },
        {
            id: 2,
            clientId: "2",
            data: {
                client: {
                    fullName: "Jane Smiths",
                    phoneNumber: "9876543210",
                    address: {
                        addressLine1: "456 Elm St",
                        addressLine2: null,
                        addressTown: "Anytown",
                        addressCounty: "USA",
                        addressPostcode: "54321",
                    },
                    adultInfo: {
                        adults: [],
                        numberOfAdults: 0,
                    },
                    childrenInfo: {
                        children: [],
                        numberOfChildren: 0,
                    },
                    listType: "regular",
                    dietaryRequirements: { "gluten-free": true },
                    feminineProducts: { tampons: true, pads: false },
                    babyProducts: "No",
                    nappySize: null,
                    petFood: { cat: true, dog: false },
                    otherItems: { toothpaste: false, toothbrush: false },
                    deliveryInstructions: "Leave at 12 pm",
                    extraInformation: "No special requests",
                    attentionFlag: false,
                    signpostingCall: true,
                    notes: null,
                },
                clientReadOnly: false,
                parcel: getEmptyBatchEditData().parcel,
            },
        },
    ],
    clientOverrides: [],
    parcelOverrides: [],
};

export const batchSubmitTestData: BatchTableDataState = {
    overrideDataRow: {
        data: {
            client: {
                fullName: null,
                phoneNumber: null,
                address: null,
                adultInfo: null,
                childrenInfo: null,
                listType: null,
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
        },
    },
    batchDataRows: [
        {
            id: 1,
            clientId: null,
            data: {
                client: {
                    fullName: "John Doe",
                    phoneNumber: "07822235203",
                    address: {
                        addressLine1: "123 Main St",
                        addressLine2: null,
                        addressTown: "London",
                        addressCounty: null,
                        addressPostcode: "E1 6AA",
                    },
                    adultInfo: {
                        adults: [
                            {
                                gender: "male",
                                birthYear: 1973,
                            },
                        ],
                        numberOfAdults: 1,
                    },
                    childrenInfo: {
                        children: [],
                        numberOfChildren: 0,
                    },
                    listType: "hotel",
                    dietaryRequirements: { vegan: true },
                    feminineProducts: { tampons: false, pads: false },
                    babyProducts: "No",
                    nappySize: null,
                    petFood: { cat: false, dog: false },
                    otherItems: { toothpaste: false, toothbrush: false },
                    deliveryInstructions: "Leave at 10 am",
                    extraInformation: "No special requests",
                    attentionFlag: true,
                    signpostingCall: false,
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
            },
        },
        {
            id: 2,
            clientId: null,
            data: {
                client: {
                    fullName: "Jane Smith",
                    phoneNumber: "07426030199",
                    address: {
                        addressLine1: "456 Elm St",
                        addressLine2: null,
                        addressTown: "London",
                        addressCounty: null,
                        addressPostcode: "SE1 5QT",
                    },
                    adultInfo: {
                        adults: [
                            {
                                gender: "female",
                                birthYear: 1995,
                            },
                        ],
                        numberOfAdults: 1,
                    },
                    childrenInfo: {
                        children: [],
                        numberOfChildren: 0,
                    },
                    listType: "regular",
                    dietaryRequirements: { "gluten-free": true },
                    feminineProducts: { tampons: false, pads: false },
                    babyProducts: "No",
                    nappySize: null,
                    petFood: { cat: true, dog: false },
                    otherItems: { toothpaste: false, toothbrush: false },
                    deliveryInstructions: "Leave at 12 pm",
                    extraInformation: "No special requests",
                    attentionFlag: false,
                    signpostingCall: true,
                    notes: null,
                },
                clientReadOnly: false,
                parcel: {
                    voucherNumber: "789012",
                    packingDate: "2024-08-28",
                    packingSlot: "ce32dd76-44e5-5eea-9774-12d23f20e850",
                    shippingMethod: "Collection",
                    collectionInfo: {
                        collectionDate: "2024-08-28",
                        collectionSlot: "10:45:00",
                        collectionCentreId: "fa185fd2-fcfa-539b-b733-1d353c62fa8e",
                        collectionCentreAcronymn: "TST",
                        collectionCentreName: "Test Centre",
                    },
                },
            },
        },
        {
            id: 3,
            clientId: null,
            data: {
                client: {
                    fullName: "Joe Brown",
                    phoneNumber: "07822031259",
                    address: {
                        addressLine1: "789 Oak St",
                        addressLine2: null,
                        addressTown: "London",
                        addressCounty: null,
                        addressPostcode: "SE2 4HY",
                    },
                    adultInfo: {
                        adults: [
                            {
                                gender: "male",
                                birthYear: 1973,
                            },
                            {
                                gender: "female",
                                birthYear: 1975,
                            },
                        ],
                        numberOfAdults: 2,
                    },
                    childrenInfo: {
                        children: [],
                        numberOfChildren: 0,
                    },
                    listType: "regular",
                    dietaryRequirements: { "gluten-free": true },
                    feminineProducts: { tampons: true, pads: false },
                    babyProducts: "No",
                    nappySize: null,
                    petFood: { cat: true, dog: false },
                    otherItems: { toothpaste: false, toothbrush: false },
                    deliveryInstructions: "Leave at 12 pm",
                    extraInformation: "No special requests",
                    attentionFlag: false,
                    signpostingCall: true,
                    notes: null,
                },
                clientReadOnly: false,
                parcel: {
                    voucherNumber: "123456",
                    packingDate: "2024-08-28",
                    packingSlot: "ce32dd76-44e5-5eea-9774-12d23f20e850",
                    shippingMethod: "Collection",
                    collectionInfo: {
                        collectionDate: "2024-08-28",
                        collectionSlot: "12:00:00",
                        collectionCentreId: "52897912-3ff4-5cea-8b8b-7b3e94c4663a",
                        collectionCentreAcronymn: "TST",
                        collectionCentreName: "Test Centre",
                    },
                },
            },
        },
    ],
    clientOverrides: [],
    parcelOverrides: [],
};

export const mockExistingClientRow: Schema["clients"] = {
    primary_key: "dcb54bc0-b0d3-57fa-bf9b-f1c4da6931a9",
    full_name: "Test Person",
    phone_number: "+140969525594300",
    address_1: "3454 Test St",
    address_2: null,
    address_town: "Test Town",
    address_county: "Test County",
    address_postcode: "TE5T 1NG",
    delivery_instructions: "Leave at the door",
    family_id: "family-test-id",
    dietary_requirements: ["vegan"],
    feminine_products: ["tampons"],
    baby_food: false,
    pet_food: ["dog"],
    other_items: ["toothpaste"],
    extra_information: "No special requests",
    flagged_for_attention: false,
    signposting_call_required: true,
    last_updated: "2022-01-01",
    is_active: true,
    notes: null,
    default_list: "regular",
};

const currentYear = dayjs().year();
const currentMonth = dayjs().month();

export const mockExistingFamily: Schema["families"][] = [
    {
        primary_key: "test-dad",
        family_id: "family-test-id",
        gender: "male",
        birth_month: null,
        birth_year: 1980,
        recorded_as_child: false,
    },
    {
        primary_key: "test-mum",
        family_id: "family-test-id",
        gender: "female",
        birth_month: null,
        birth_year: 1985,
        recorded_as_child: false,
    },
    {
        primary_key: "test-adult-child",
        family_id: "family-test-id",
        gender: "female",
        birth_month: currentMonth,
        birth_year: currentYear - 16,
        recorded_as_child: false,
    },
    {
        primary_key: "test-child-child",
        family_id: "family-test-id",
        gender: "female",
        birth_month: currentMonth,
        birth_year: currentYear - 15,
        recorded_as_child: true,
    },
];

export const mockExistingClientRowWithNappySize: Schema["clients"] = {
    primary_key: "44d14896-357b-5e91-ab64-2ca95b6a2faa",
    full_name: "Test Nappy Person",
    phone_number: "+661129414051390",
    address_1: "3454 Nappy St",
    address_2: null,
    address_town: "Nappy Town",
    address_county: "Nappy County",
    address_postcode: "N4P 9YS",
    delivery_instructions: "Leave Nappies at the door",
    family_id: "nappy-family-test-id",
    dietary_requirements: ["vegan"],
    feminine_products: ["tampons"],
    baby_food: true,
    pet_food: ["dog"],
    other_items: ["toothpaste"],
    extra_information: "Nappy Size: 10, Extra Information: I love nappies",
    flagged_for_attention: false,
    signposting_call_required: true,
    last_updated: "2022-01-01",
    is_active: true,
    notes: null,
    default_list: "regular",
};

export const mockExistingNappyFamily: Schema["families"][] = [
    {
        primary_key: "test-nappy-dad",
        family_id: "nappy-family-test-id",
        gender: "male",
        birth_month: null,
        birth_year: 1980,
        recorded_as_child: false,
    },
    {
        primary_key: "test-nappy-baby",
        family_id: "nappy-family-test-id",
        gender: "female",
        birth_month: null,
        birth_year: currentYear - 2,
        recorded_as_child: true,
    },
];
