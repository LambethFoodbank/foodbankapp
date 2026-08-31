import { v4 as uuidv4 } from "uuid";

describe("User invite on admins page", () => {
    beforeEach(() => {
        cy.login();
        cy.intercept({ method: "GET", url: "**/rest/v1/profiles*" }).as("getProfiles");
        cy.visit("/admin");

        // This isn't specifically needed for these tests, but it checks that page data has started loading
        cy.wait("@getProfiles");
    });

    it("Invite a user without a phone number", () => {
        const email = generateRandomEmailAddress();

        toggleCreateUserSectionOpen();
        fillEmail(email);
        fillFirstName("First");
        fillLastName("Last");
        clickInviteUser();

        assertUserInvitedSuccessfully(email);
    });

    it("Invite a user without a phone number after typing a number first", () => {
        const email = generateRandomEmailAddress();

        toggleCreateUserSectionOpen();
        fillEmail(email);
        fillFirstName("First");
        fillLastName("Last");
        fillPhoneNumber("00000000000");
        clearPhoneNumber();
        clickInviteUser();

        assertUserInvitedSuccessfully(email);
    });

    it("Invite a user with a phone number", () => {
        const email = generateRandomEmailAddress();

        toggleCreateUserSectionOpen();
        fillEmail(email);
        fillFirstName("First");
        fillLastName("Last");
        fillPhoneNumber("00000000000");
        clickInviteUser();

        assertUserInvitedSuccessfully(email);
    });

    const createUserText = "create user";

    function toggleCreateUserSectionOpen(): void {
        cy.contains(createUserText, { matchCase: false }).click();
        // Long timeout because this page loads a lot of data
        cy.get("#new-user-email-address", { timeout: 8000 }).should("be.visible");
    }

    function fillEmail(value: string): void {
        fillTextboxWithId("new-user-email-address", value);
    }

    function fillFirstName(value: string): void {
        fillTextboxWithId("new-user-first-name", value);
    }

    function fillLastName(value: string): void {
        fillTextboxWithId("new-user-last-name", value);
    }

    function fillPhoneNumber(value: string): void {
        fillTextboxWithId("new-user-phone-number", value);
    }

    function clearPhoneNumber(): void {
        cy.get("#new-user-phone-number").clear();
    }

    function fillTextboxWithId(id: string, value: string): void {
        cy.get(`#${id}`).type(value);
    }

    function clickInviteUser(): void {
        cy.contains("Invite User").click();
    }

    function assertUserInvitedSuccessfully(email: string): void {
        cy.contains(`User ${email} invited successfully.`).should("be.visible");
    }

    function generateRandomEmailAddress(): string {
        return `${uuidv4()}@example.com`;
    }
});
