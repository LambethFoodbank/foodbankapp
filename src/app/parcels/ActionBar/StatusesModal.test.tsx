import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { expect, it } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import StatusesModal from "@/app/parcels/ActionBar/StatusesModal";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { UserRole } from "@/databaseUtils";
import StyleManager from "@/app/themes";
import Localization from "@/app/Localization";
import { RoleUpdateContext } from "@/app/roles";

const managerAndAboveRoles: { [role: string]: UserRole }[] = [
    { role: "admin" },
    { role: "manager" },
];
const otherRoles: { [role: string]: UserRole }[] = [{ role: "staff" }, { role: "volunteer" }];
const allRoles = [...managerAndAboveRoles, ...otherRoles];

const mockData: ParcelsTableRow[] = [
    {
        clientId: "primaryKey1",
        addressPostcode: "AB1 2CD",
        phoneNumber: "0987 654321",
        deliveryCollection: {
            collectionCentreName: "Centre 1",
            collectionCentreAcronym: "C1",
            congestionChargeApplies: false,
            listType: "hotel",
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
        listType: "hotel",
        referralAgency: "Agency 10",
        referrerEmail: "example@example.com",
        referrerName: "John Smith",
        referrerPhone: "0987 654321",
        createdAt: new Date("2023-12-31T12:00:00+00:00"),
        clientIsActive: true,
        email: "john.smith@example.com",
    },
    {
        clientId: "primaryKey2",
        addressPostcode: "AB1 aaaa2CD",
        phoneNumber: "+1 234 567",
        deliveryCollection: {
            collectionCentreName: "Centraaaae 1",
            collectionCentreAcronym: "C2",
            congestionChargeApplies: true,
            listType: "hotel",
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
        listType: "hotel",
        referralAgency: "My Agency",
        referrerEmail: "example@example.com",
        referrerName: "Sara Smith",
        referrerPhone: "0900 654321",
        createdAt: new Date("2023-12-31T12:00:00+00:00"),
        clientIsActive: true,
        email: "john.doe@example.com",
    },
];

const mockSelectedParcels: ParcelsTableRow[] = mockData;

const mockOnClose: jest.Mock = jest.fn();
const mockOnSubmit: jest.Mock = jest.fn();

const renderModalWithRole = (role: UserRole): void => {
    render(
        <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
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
        </RoleUpdateContext.Provider>
    );
};

describe("StatusesModal component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it.each(allRoles)("renders without crashing", ({ role }) => {
        renderModalWithRole(role);
        expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    it.each(allRoles)("closes the modal when the close button is clicked", ({ role }) => {
        renderModalWithRole(role);
        fireEvent.click(screen.getByLabelText("Close Button"));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it.each(managerAndAboveRoles)("shows the date override option for role: %o", ({ role }) => {
        renderModalWithRole(role);
        expect(screen.getByLabelText("Override status timestamp")).toBeInTheDocument();
        expect(screen.getByLabelText("Override status timestamp")).not.toBeChecked();
    });

    it.each(otherRoles)("does not show the date override option for role: %o", ({ role }) => {
        renderModalWithRole(role);
        expect(screen.queryByText("Override status timestamp")).not.toBeInTheDocument();
    });

    it.each(managerAndAboveRoles)(
        "the date override option shows and hides the date/time pickers for role: %o",
        ({ role }) => {
            renderModalWithRole(role);
            const overrideCheckbox = screen.getByLabelText("Override status timestamp");

            expect(overrideCheckbox).not.toBeChecked();
            expect(screen.queryByLabelText("Date and Time")).not.toBeInTheDocument();

            fireEvent.click(overrideCheckbox);
            expect(overrideCheckbox).toBeChecked();
            expect(screen.getByLabelText("Date and Time")).toBeInTheDocument();

            fireEvent.click(overrideCheckbox);
            expect(overrideCheckbox).not.toBeChecked();
            expect(screen.queryByLabelText("Date and Time")).not.toBeInTheDocument();
        }
    );
});
