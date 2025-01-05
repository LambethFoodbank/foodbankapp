import { processEventsDetails } from "@/app/parcels/getExpandedParcelDetails";
import {
    familyCountToFamilyCategory,
    formatAddressFromClientDetails,
    formatBreakdownOfChildrenFromFamilyDetails,
    formatHouseholdFromFamilyDetails,
} from "@/app/clients/getExpandedClientDetails";
import { formatDatetimeAsDate } from "@/common/format";
import { DbParcelRow } from "@/databaseUtils";
import convertParcelDbtoParcelRow, {
    processLastStatus,
    ProcessParcelDataResult,
} from "@/app/parcels/parcelsTable/convertParcelDBtoParcelRow";
import { CongestionChargeDetails, ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { expect, it } from "@jest/globals";

jest.mock("@/supabaseClient", () => {
    return { default: jest.fn() };
});

const logID = "a2adb0ba-873e-506b-abd1-8cd1782923c8";
jest.mock("@/logger/logger", () => ({
    logErrorReturnLogId: jest.fn(() => Promise.resolve(logID)),
}));

const sampleProcessingData: DbParcelRow[] = [
    {
        parcel_id: "PRIMARY_KEY",
        collection_centre_name: "COLLECTION_CENTRE",
        collection_centre_acronym: "CC",
        collection_datetime: "2023-08-04T13:30:00+00:00",
        packing_date: "2023-08-04T13:30:00+00:00",
        packing_slot_name: "AM",
        packing_slot_order: 1,
        voucher_number: "VOUCHER_1",
        client_id: "PRIMARY_KEY2",
        client_full_name: "CLIENT_NAME",
        client_address_postcode: "SW1A 2AA",
        client_phone_number: "08642 123",
        client_flagged_for_attention: false,
        client_signposting_call_required: true,
        family_count: 3,
        is_delivery: false,
        last_status_event_name: "LAST_EVENT",
        last_status_event_data: "SOME_RELATED_DATA",
        last_status_timestamp: "2023-08-04T13:30:00+00:00",
        last_status_workflow_order: 1,
        all_events: ["LAST_EVENT"],
        created_at: "2023-12-31T12:00:00+00:00",
        client_is_active: true,
        client_delivery_instructions: "SOME_DELIVERY_INSTRUCTIONS",
    },
];

const sampleCongestionChargeData: CongestionChargeDetails[] = [
    {
        postcode: "SW1A 2AA",
        congestionCharge: true,
    },
];

describe("Parcels Page", () => {
    describe("Backend Processing for Table Data", () => {
        it("Fields are set correctly", async () => {
            const { parcelTableRows }: ProcessParcelDataResult = await convertParcelDbtoParcelRow(
                sampleProcessingData,
                sampleCongestionChargeData
            );

            const expected: ParcelsTableRow[] = [
                {
                    parcelId: "PRIMARY_KEY",
                    clientId: "PRIMARY_KEY2",
                    fullName: "CLIENT_NAME",
                    familyCategory: "Family of 3",
                    addressPostcode: "SW1A 2AA",
                    phoneNumber: "08642 123",
                    collectionDatetime: new Date("2023-08-04T13:30:00+00:00"),
                    deliveryCollection: {
                        collectionCentreName: "COLLECTION_CENTRE",
                        collectionCentreAcronym: "CC",
                        congestionChargeApplies: true,
                    },
                    packingSlot: "AM",
                    lastStatus: {
                        name: "LAST_EVENT",
                        eventData: "SOME_RELATED_DATA",
                        timestamp: new Date("2023-08-04T13:30:00+00:00"),
                        workflowOrder: 1,
                    },
                    allStatuses: ["LAST_EVENT"],
                    voucherNumber: "VOUCHER_1",
                    packingDate: new Date("2023-08-04T13:30:00+00:00"),
                    iconsColumn: {
                        flaggedForAttention: false,
                        requiresFollowUpPhoneCall: true,
                    },
                    createdAt: new Date("2023-12-31T12:00:00+00:00"),
                    clientIsActive: true,
                },
            ];
            expect(parcelTableRows).toStrictEqual(expected);
        });

        it("familyCountToFamilyCategory()", () => {
            expect(familyCountToFamilyCategory(1)).toEqual("Single");
            expect(familyCountToFamilyCategory(2)).toEqual("Family of 2");
            expect(familyCountToFamilyCategory(9)).toEqual("Family of 9");
            expect(familyCountToFamilyCategory(10)).toEqual("Family of 10+");
            expect(familyCountToFamilyCategory(15)).toEqual("Family of 10+");
        });

        it("formatDatetimeAsDate()", () => {
            expect(formatDatetimeAsDate("2023-08-04T13:30:00+00:00")).toEqual("04/08/2023");
            expect(formatDatetimeAsDate("2024-11-23T01:43:50+00:00")).toEqual("23/11/2024");
            expect(formatDatetimeAsDate("Invalid_Date_Format")).toEqual("-");
            expect(formatDatetimeAsDate(null)).toEqual("-");
        });

        it("eventToStatusMessage()", () => {
            expect(
                processLastStatus({
                    last_status_event_name: "EVENT",
                    last_status_event_data: "SOME_RELATED_DATA",
                    last_status_timestamp: "2023-08-04T13:30:00+00:00",
                    last_status_workflow_order: 1,
                })
            ).toStrictEqual({
                name: "EVENT",
                eventData: "SOME_RELATED_DATA",
                timestamp: new Date("2023-08-04T13:30:00+00:00"),
                workflowOrder: 1,
            });
            expect(processLastStatus(null)).toEqual(null);
        });
    });

    describe("Backend Processing for Expanded Parcel Details", () => {
        it("formatAddressFromClientDetails()", () => {
            expect(
                formatAddressFromClientDetails({
                    address_1: "Address Line 1",
                    address_2: "Address Line 2",
                    address_town: "TOWN",
                    address_county: "COUNTY",
                    address_postcode: "POSTCODE",
                })
            ).toEqual("Address Line 1, Address Line 2, TOWN, COUNTY, POSTCODE");

            expect(
                formatAddressFromClientDetails({
                    address_1: "Address Line 1",
                    address_2: "",
                    address_town: "TOWN",
                    address_county: "",
                    address_postcode: "POSTCODE",
                })
            ).toEqual("Address Line 1, TOWN, POSTCODE");
        });

        it("formatHouseholdFromFamilyDetails()", () => {
            expect(
                formatHouseholdFromFamilyDetails([
                    {
                        birth_year: 1988,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: "female",
                    },
                    {
                        birth_year: 2019,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: "male",
                    },
                    {
                        birth_year: 2000,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: "other",
                    },
                ])
            ).toEqual("Family of 3 Occupants (2 adults, 1 child)");

            expect(
                formatHouseholdFromFamilyDetails([
                    {
                        birth_year: 1988,
                        birth_month: null,
                        recorded_as_child: false,
                        gender: "female",
                    },
                    {
                        birth_year: 2019,
                        birth_month: null,
                        recorded_as_child: true,
                        gender: "male",
                    },
                    {
                        birth_year: null,
                        birth_month: null,
                        recorded_as_child: true,
                        gender: "female",
                    },
                    { birth_year: 2020, birth_month: 4, recorded_as_child: true, gender: null },
                ])
            ).toEqual("Family of 4 Occupants (1 adult, 3 children)");

            expect(
                formatHouseholdFromFamilyDetails([
                    {
                        birth_year: 2007,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: "female",
                    },
                ])
            ).toEqual("Single Occupant (1 adult)");

            expect(
                formatHouseholdFromFamilyDetails([
                    {
                        birth_year: null,
                        birth_month: null,
                        recorded_as_child: false,
                        gender: "male",
                    },
                ])
            ).toEqual("Single Occupant (1 adult)");

            expect(
                formatHouseholdFromFamilyDetails([
                    {
                        birth_year: 2005,
                        birth_month: null,
                        recorded_as_child: true,
                        gender: "female",
                    },
                ])
            ).toEqual("Single Occupant (1 adult)");

            expect(
                formatHouseholdFromFamilyDetails([
                    {
                        birth_year: 2012,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: "male",
                    },
                ])
            ).toEqual("Single Occupant (1 child)");

            expect(
                formatHouseholdFromFamilyDetails([
                    {
                        birth_year: null,
                        birth_month: null,
                        recorded_as_child: true,
                        gender: "male",
                    },
                ])
            ).toEqual("Single Occupant (1 child)");
        });

        it("formatBreakdownOfChildrenFromFamilyDetails()", () => {
            const currentYear: number = new Date().getFullYear();
            expect(
                formatBreakdownOfChildrenFromFamilyDetails([
                    {
                        birth_year: 1988,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: "female",
                    },
                    {
                        birth_year: 2019,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: "male",
                    },
                    {
                        birth_year: 2020,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: "female",
                    },
                    {
                        birth_year: 2009,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: null,
                    },
                ])
            ).toEqual(
                `${currentYear - 2019}-years-old male, ${currentYear - 2020}-years-old female, ${currentYear - 2009}-years-old unknown gender`
            );

            expect(
                formatBreakdownOfChildrenFromFamilyDetails([
                    {
                        birth_year: 1988,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: "female",
                    },
                    {
                        birth_year: 2009,
                        birth_month: null,
                        recorded_as_child: null,
                        gender: "female",
                    },
                ])
            ).toEqual(`${currentYear - 2009}-years-old female`);

            expect(
                formatBreakdownOfChildrenFromFamilyDetails([
                    {
                        birth_year: 1988,
                        birth_month: null,
                        recorded_as_child: true,
                        gender: "female",
                    },
                    {
                        birth_year: null,
                        birth_month: null,
                        recorded_as_child: false,
                        gender: "male",
                    },
                ])
            ).toEqual("No Children");
        });

        it("processEventsDetails()", () => {
            expect(
                processEventsDetails([
                    {
                        new_parcel_status: "Event 1",
                        timestamp: "2023-08-04T13:30:00+00:00",
                        event_data: "",
                    },
                    {
                        new_parcel_status: "Event 2",
                        timestamp: "2023-06-04T15:30:00+00:00",
                        event_data: "Message",
                    },
                ])
            ).toStrictEqual([
                { eventInfo: "Event 1 ", timestamp: new Date("2023-08-04T13:30:00+00:00") },
                {
                    eventInfo: "Event 2  (Message)",
                    timestamp: new Date("2023-06-04T15:30:00+00:00"),
                },
            ]);
        });
    });
});
