describe("Add client form", () => {
    beforeEach(() => {
        cy.login();
        cy.visit("/clients/add");
    });

    it("Add a client with no address", () => {
        fillName(fullName);
        fillPhoneNumber(phoneNumber);
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
});

const fullName = "First Last";
const phoneNumber = "01234567890";
const noAddressText = "No Address";
const postcode = "N11AA";

function toggleNoAddress(): void {
    cy.contains(noAddressText, { matchCase: false }).click();
}

function fillName(value: string): void {
    fillTextboxWithId("client-full-name", value);
}

function fillPhoneNumber(value: string): void {
    fillTextboxWithId("client-phone-number", value);
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
