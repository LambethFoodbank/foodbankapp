import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { expect, it } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import ActionAndStatusBar from "@/app/parcels/ActionBar/ActionAndStatusBar";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import StyleManager from "@/app/themes";
import Localization from "@/app/Localization";

jest.mock("@/supabaseClient", () => {
    return { default: jest.fn() };
});

const logID = "a2adb0ba-873e-506b-abd1-8cd1782923c8";
jest.mock("@/logger/logger", () => ({
    logErrorReturnLogId: jest.fn(() => Promise.resolve(logID)),
}));

jest.mock("@/app/parcels/ActionBar/Statuses", () => {
    return jest.fn().mockImplementation(() => (
        <div>
            <button data-testid="#status-button">Statuses</button>
            <div data-testid="#status-menu">
                <button>Parcel Denied</button>
            </div>
        </div>
    ));
});

jest.mock("@/app/parcels/ActionBar/Actions", () => {
    return jest.fn().mockImplementation(() => (
        <div>
            <button data-testid="#action-button">Actions</button>
            <div data-testid="#action-menu">
                <button>Download Shopping List</button>
            </div>
        </div>
    ));
});

export const mockData: ParcelsTableRow[] = [
    {
        clientId: "primaryKey1",
        addressPostcode: "AB1 2CD",
        phoneNumber: "0987 654321",
        deliveryCollection: {
            collectionCentreName: "Centre 1",
            collectionCentreAcronym: "C1",
            congestionChargeApplies: false,
            listType: "regular",
            isDeliverable: true,
        },
        collectionDatetime: new Date(),
        familyCategory: "Single",
        fullName: "John Smith",
        lastStatus: {
            name: "Delivered",
            eventData: "Some information",
            timestamp: new Date(),
            workflowOrder: 1,
        },
        allStatuses: ["Delivered"],
        packingDate: new Date(),
        packingSlot: "AM",
        parcelId: "123456789",
        iconsColumn: {
            requiresFollowUpPhoneCall: false,
            flaggedForAttention: false,
        },
        voucherNumber: "123456789",
        listType: "regular",
        referralAgency: "Agency 10",
        referrerEmail: "example@example.com",
        referrerName: "Ana Doe",
        referrerPhone: "0987 654000",
        createdAt: new Date("2023-12-31T12:00:00+00:00"),
        clientIsActive: true,
        email: "john.smith@example.com",
        isDeliverable: false
    },
    {
        clientId: "primaryKey2",
        addressPostcode: "AB1 aaaa2CD",
        phoneNumber: "+1 234 567",
        deliveryCollection: {
            collectionCentreName: "Centraaaae 1",
            collectionCentreAcronym: "C2",
            congestionChargeApplies: true,
            listType: "regular",
            isDeliverable: true,
        },
        collectionDatetime: new Date(),
        familyCategory: "Family of 4",
        fullName: "John Smaaaaith",
        lastStatus: {
            name: "Called and Confirmed",
            eventData: null,
            timestamp: new Date(),
            workflowOrder: 2,
        },
        allStatuses: ["Called and Confirmed", "Shopping List Downloaded"],
        packingDate: new Date(),
        packingSlot: "PM",
        parcelId: "123456aaaa789",
        iconsColumn: {
            requiresFollowUpPhoneCall: false,
            flaggedForAttention: false,
        },
        voucherNumber: "123456aaaa789",
        listType: "regular",
        referralAgency: "Agency 10",
        referrerEmail: "example@example.com",
        referrerName: "John Doe",
        referrerPhone: "0987 654000",
        createdAt: new Date("2023-12-31T12:00:00+00:00"),
        clientIsActive: true,
        email: "john.doe@example.com",
        isDeliverable: false
    },
];

describe("Parcels - Action and Status Bar", () => {
    let parcelIds: string[] = ["123456789", "123456aaaa789"];
    const postActivityCallback = (): void => {
        parcelIds = [];
    };

    beforeEach(() => {
        cleanup();
        render(
            <Localization>
                <StyleManager>
                    <ActionAndStatusBar
                        fetchSelectedParcels={async () =>
                            await mockData.filter((parcel) => parcelIds.includes(parcel.parcelId))
                        }
                        postCheckedParcelActivity={postActivityCallback}
                    />
                </StyleManager>
            </Localization>
        );
    });

    it("renders without crashing", () => {
        expect(screen.getAllByText("Statuses")[0]).toBeInTheDocument();
        expect(screen.getAllByText("Actions")[0]).toBeInTheDocument();
    });

    it("should open the status menu when the status button is clicked", async () => {
        const statusButton: HTMLElement = screen.getByTestId("#status-button");
        fireEvent.click(statusButton);

        await waitFor(() => {
            expect(screen.getByTestId("#status-menu")).toBeInTheDocument();

            expect(screen.getByText("Parcel Denied")).toBeInTheDocument();
        });
    });

    it("should open the action menu when the item button is clicked", async () => {
        const statusButton: HTMLElement = screen.getByTestId("#action-button");
        fireEvent.click(statusButton);

        await waitFor(() => {
            expect(screen.getByTestId("#action-menu")).toBeInTheDocument();

            expect(screen.getByText("Download Shopping List")).toBeInTheDocument();
        });
    });
});
