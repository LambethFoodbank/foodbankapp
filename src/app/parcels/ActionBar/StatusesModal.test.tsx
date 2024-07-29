import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { expect, it } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import StatusesModal from "@/app/parcels/ActionBar/StatusesModal";
import dayjs from "dayjs";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import StyleManager from "@/app/themes";
import Localization from "@/app/Localization";

const mockData: ParcelsTableRow[] = [
    {
        clientId: "primaryKey1",
        addressPostcode: "AB1 2CD",
        phoneNumber: "0987 654321",
        deliveryCollection: {
            collectionCentreName: "Centre 1",
            collectionCentreAcronym: "C1",
            congestionChargeApplies: false,
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
        packingDate: new Date(),
        packingSlot: "AM",
        parcelId: "123456789",
        iconsColumn: {
            requiresFollowUpPhoneCall: false,
            flaggedForAttention: false,
        },
        voucherNumber: "123456789",
        createdAt: new Date("2023-12-31T12:00:00+00:00"),
        clientIsActive: true,
    },
    {
        clientId: "primaryKey2",
        addressPostcode: "AB1 aaaa2CD",
        phoneNumber: "+1 234 567",
        deliveryCollection: {
            collectionCentreName: "Centraaaae 1",
            collectionCentreAcronym: "C2",
            congestionChargeApplies: true,
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
        packingDate: new Date(),
        packingSlot: "PM",
        parcelId: "123456aaaa789",
        iconsColumn: {
            requiresFollowUpPhoneCall: false,
            flaggedForAttention: false,
        },
        voucherNumber: "123456aaaa789",
        createdAt: new Date("2023-12-31T12:00:00+00:00"),
        clientIsActive: true,
    },
];

const mockSelectedParcels: ParcelsTableRow[] = mockData;

const mockOnClose: jest.Mock = jest.fn();
const mockOnSubmit: jest.Mock = jest.fn();

describe("StatusesModal component", () => {
    beforeEach(() => {
        cleanup();
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2024-01-01T12:00:00"));
        jest.clearAllMocks();

        render(
            <Localization>
                <StyleManager>
                    <StatusesModal
                        isOpen={true}
                        onClose={mockOnClose}
                        selectedParcels={mockSelectedParcels}
                        onSubmit={mockOnSubmit}
                        errorText={null}
                        headerId="status-modal-header"
                        header="Apply Status: Delivered"
                    >
                        children={null}
                    </StatusesModal>
                </StyleManager>
            </Localization>
        );
    });

    it("renders without crashing", () => {
        expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    it("closes the modal when the close button is clicked", () => {
        fireEvent.click(screen.getByLabelText("Close Button"));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("submits the selected  date when the submit button is clicked", () => {
        const mockDate = dayjs("2024-01-01 12:00:00");
        fireEvent.click(screen.getByText("Submit"));

        expect(mockOnSubmit).toHaveBeenCalledWith(mockDate);
    });

    // Can add more tests
});
