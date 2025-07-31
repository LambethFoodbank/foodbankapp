import { expect, it } from "@jest/globals";
import {
    ExpandedClientParcelDetails,
    ParcelsDetail,
    rawDataToClientParcelsDetails,
} from "@/app/clients/getClientParcelsData";

const logID = "a2adb0ba-873e-506b-abd1-8cd1782923c8";

jest.mock("@/logger/logger", () => ({
    logErrorReturnLogId: jest.fn(() => Promise.resolve(logID)),
}));

jest.mock("@/supabaseClient", () => {
    return { default: jest.fn() };
});

describe("test for getClientparcelsData", () => {
    it("Should format the data correctly", () => {
        const sampleParcelData: ParcelsDetail = {
            parcel_id: "a2adb0ba-873e-506b-abd1-8cd1782923c8",
            collection_centre: {
                name: "Clapham - St Stephens Church",
            },
            packing_date: "2024-09-24 17:31:25.437+00",
            voucher_number: "Sum et non es etiam.",
            signposting_call_required: true,
            signposting_call_reasons: ["Housing", "Mental Health", "Debt", "Cost of Living"],
        };
        const sampleExpandedClientParcelDetails: ExpandedClientParcelDetails = {
            parcelId: "a2adb0ba-873e-506b-abd1-8cd1782923c8",
            voucherNumber: "Sum et non es etiam.",
            packingDate: "24/09/2024",
            collectionCentre: "Clapham - St Stephens Church",
            signpostingCallRequired: true,
            signpostingCallReasons: "Debt, Housing, Cost of Living, Mental Health",
        };
        const result = rawDataToClientParcelsDetails(sampleParcelData);
        expect(result).toEqual(sampleExpandedClientParcelDetails);
    });
});
