describe("Add client form", () => {
    beforeEach(() => {
        cy.login();
        cy.visit("/clients/add");
    });

    it("Add a client with no address", () => {
        fillName(fullName);
        fillPhoneNumber(phoneNumber);
        fillAdditionalPhoneNumbers(additionalPhoneNumbers);
        fillEmail(email);
        fillNumberAdults("1");
        fillNumberChildren("0");
        chooseListType();

        toggleNoAddress();

        clickSubmitForm();

        assertAddClientFormSubmittedSuccessfully();
    });

    it("Submit a client with empty address fields but No Address unchecked", () => {
        fillName(fullName);
        fillPhoneNumber(phoneNumber);
        fillEmail(email);
        fillNumberAdults("1");
        fillNumberChildren("0");

        clickSubmitForm();

        assertSubmitErrorShown();
    });

    it("Type in postcode, check no address, uncheck no address", () => {
        fillPostcode(postcode);
        toggleNoAddress();
        toggleNoAddress();

        assertPostcodeContentNotDisplayed();
    });

    it("Tries to add a client with the same additional phone number and fails", () => {
        fillName(fullName);
        fillPhoneNumber(phoneNumber);
        fillAdditionalPhoneNumbers(duplicateAdditionalPhoneNumbers);
        cy.contains(
            "This phone number already exists, please add a different phone number."
        ).should("be.visible");
    });
});

const fullName = "First Last";
const phoneNumber = "01234567890";
const email = "abc@example.com";
const noAddressText = "No Address";
const postcode = "N11AA";
const additionalPhoneNumbers = ["01234567891", "01234567892"];
const duplicateAdditionalPhoneNumbers = ["01234567891", "01234567891"];

function toggleNoAddress(): void {
    cy.contains(noAddressText, { matchCase: false }).click();
}

function fillName(value: string): void {
    fillTextboxWithId("client-full-name", value);
}

function fillPhoneNumber(value: string): void {
    fillTextboxWithId("client-phone-number", value);
}

function fillAdditionalPhoneNumbers(values: string[]): void {
    cy.contains("Add another phone number").click();
    fillTextboxWithId("client-additional-phone-number-0", values[0]);
    cy.contains("Add another phone number").click();
    fillTextboxWithId("client-additional-phone-number-1", values[1]);
}

function fillEmail(value: string): void {
    fillTextboxWithId("client-email", value);
}

function fillNumberAdults(value: string): void {
    fillTextboxWithId("client-number-adults", value);
}

function fillNumberChildren(value: string): void {
    fillTextboxWithId("client-number-children", value);
}

function fillPostcode(value: string): void {
    fillTextboxWithId("client-address-postcode", value);
}

function chooseListType(): void {
    cy.get("#list-type-select-label").parent().click();
    cy.contains("Regular").click();
}

function clickSubmitForm(): void {
    cy.contains("Submit").click();
}

function assertAddClientFormSubmittedSuccessfully(): void {
    cy.contains("Add Parcel").should("be.visible");
    cy.contains(fullName).should("be.visible");
}

function assertSubmitErrorShown(): void {
    cy.contains(
        "Please ensure all fields have been entered correctly. Required fields are labelled with an asterisk."
    ).should("be.visible");
}

function assertPostcodeContentNotDisplayed(): void {
    cy.contains(postcode).should("not.exist");
}

function fillTextboxWithId(id: string, value: string): void {
    cy.get(`#${id}`).type(value);
}
