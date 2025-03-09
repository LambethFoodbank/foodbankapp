import { v4 as uuidv4 } from "uuid";

describe("Edit a collection centre on admins page", () => {
    beforeEach(() => {
        cy.login();
        cy.visit("/admin");
    });

    it("Adds a collection centre and hides it successfully", () => {
        toggleCollectionCentreSection();
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-row", { timeout: 5000 })
            .should("be.visible");

        const newCollectionCentreName = `${uuidv4()}`;
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .find(newCollectionCentreName)
            .should("not.exist"); // If this fails then the random UUID is already there

        startAddingNewCollectionCentre();
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-row--editing", { timeout: 5000 })
            .should("exist");

        fillOutNewCollectionCentreRowAndSave(newCollectionCentreName);
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .contains(".MuiDataGrid-cellContent", newCollectionCentreName, { timeout: 5000 })
            .should("exist");

        startEditingCollectionCentreRow(newCollectionCentreName);
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-row--editing", { timeout: 5000 })
            .should("exist");

        uncheckIsShownInRowBeingEditedAndSave();
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .contains(".MuiDataGrid-cellContent", newCollectionCentreName, { timeout: 5000 })
            .should("exist");

        // Check the cc row appears as 'not shown'
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .contains(newCollectionCentreName, { timeout: 5000 })
            .parents(".MuiDataGrid-row")
            .as("newlyEditedRow");

        cy.get("@newlyEditedRow")
            .find('[data-field="isShown"]') // eslint-disable-line quotes
            .find('[data-testid="CloseIcon"]') // eslint-disable-line quotes
            .should("exist");
    });

    it("Adds a collection centre and edits collection slots successfully", () => {
        toggleCollectionCentreSection();
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-row", { timeout: 5000 })
            .should("be.visible");

        const newCollectionCentreName = `${uuidv4()}`;
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .find(newCollectionCentreName)
            .should("not.exist"); // If this fails then the random UUID is already there

        startAddingNewCollectionCentre();
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-row--editing", { timeout: 5000 })
            .should("exist");

        fillOutNewCollectionCentreRowAndSave(newCollectionCentreName);
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .contains(".MuiDataGrid-cellContent", newCollectionCentreName, { timeout: 5000 })
            .should("exist");

        // Open modal
        clickEditSlotsButtonForCentre(newCollectionCentreName);
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .should("be.visible");

        // Add a slot
        addNewTimeSlotInModal("13", "15");
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .find('[aria-label="List of defined time slots"]', { timeout: 5000 }) // eslint-disable-line quotes
            .find('[aria-label="Time slot"]', { timeout: 5000 }) // eslint-disable-line quotes
            .as("timeSlots");
        cy.get("@timeSlots").eq(0).should("have.text", "13:15");
        cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes

        // Check slot order
        addNewTimeSlotInModal("12", "00");
        addNewTimeSlotInModal("12", "30");
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .find('[aria-label="List of defined time slots"]') // eslint-disable-line quotes
            .find('[aria-label="Time slot"]') // eslint-disable-line quotes
            .as("timeSlots");
        cy.get("@timeSlots").eq(0).should("have.text", "12:00");
        cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes
        cy.get("@timeSlots").eq(1).should("have.text", "12:30");
        cy.get("@timeSlots").eq(1).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes
        cy.get("@timeSlots").eq(2).should("have.text", "13:15");
        cy.get("@timeSlots").eq(2).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes

        // Delete the middle timeslot
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .find('[aria-label="List of defined time slots"]') // eslint-disable-line quotes
            .find('[aria-label="Delete"]') // eslint-disable-line quotes
            .eq(1)
            .click();
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .find('[aria-label="List of defined time slots"]') // eslint-disable-line quotes
            .find('[aria-label="Time slot"]') // eslint-disable-line quotes
            .as("timeSlots");
        cy.get("@timeSlots").eq(0).should("have.text", "12:00");
        cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes
        cy.get("@timeSlots").eq(1).should("have.text", "13:15");
        cy.get("@timeSlots").eq(1).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes

        // Untick the first slot
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .find('[aria-label="List of defined time slots"]') // eslint-disable-line quotes
            .find('[aria-label="Time slot"]') // eslint-disable-line quotes
            .as("timeSlots");
        cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').uncheck(); // eslint-disable-line quotes

        cy.get("@timeSlots").eq(0).should("have.text", "12:00");
        cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').should("not.be.checked"); // eslint-disable-line quotes
        cy.get("@timeSlots").eq(1).should("have.text", "13:15");
        cy.get("@timeSlots").eq(1).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes

        // Prepare to track update requests
        cy.intercept("PATCH", "/rest/v1/collection_centres?primary_key=*").as(
            "patchCollectionCentreRequest"
        );
        cy.intercept("GET", "/rest/v1/collection_centres?select=*").as(
            "getCollectionCentresRequest"
        );

        // Save to close modal
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .find('[data-testid="SaveSlotsCloseModal"]') // eslint-disable-line quotes
            .click();
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .should("not.exist");

        // Wait for background save to complete, then table update
        cy.wait("@patchCollectionCentreRequest");
        cy.wait("@getCollectionCentresRequest");

        // Open modal for same collection centre
        clickEditSlotsButtonForCentre(newCollectionCentreName);
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .should("be.visible");

        // Check list of slots was saved
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .find('[aria-label="List of defined time slots"]', { timeout: 5000 }) // eslint-disable-line quotes
            .find('[aria-label="Time slot"]') // eslint-disable-line quotes
            .as("timeSlots");
        cy.get("@timeSlots").eq(0).should("have.text", "12:00");
        cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').should("not.be.checked"); // eslint-disable-line quotes
        cy.get("@timeSlots").eq(1).should("have.text", "13:15");
        cy.get("@timeSlots").eq(1).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes
    });
});

const toggleCollectionCentreSection = (): void => {
    cy.get('[aria-label="Section: Collection Centres"]').click(); // eslint-disable-line quotes
};

const startAddingNewCollectionCentre = (): void => {
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find('[data-testid="AddIcon"]') // eslint-disable-line quotes
        .click();
};

const fillOutNewCollectionCentreRowAndSave = (newCollectionCentreName: string): void => {
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find(".MuiDataGrid-row--editing")
        .as("newRow");

    cy.get("@newRow")
        .find('[data-field="name"]') // eslint-disable-line quotes
        .find('input[type="text"]') // eslint-disable-line quotes
        .type(newCollectionCentreName);

    cy.get("@newRow")
        .find('[data-field="acronym"]') // eslint-disable-line quotes
        .find('input[type="text"]') // eslint-disable-line quotes
        .type(newCollectionCentreName);

    cy.get("@newRow")
        .find('[data-testid="SaveIcon"]') // eslint-disable-line quotes
        .click();
};

const startEditingCollectionCentreRow = (collectionCentreName: string): void => {
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .contains(collectionCentreName)
        .parents(".MuiDataGrid-row")
        .as("newlyAddedRow");

    cy.get("@newlyAddedRow").find('[data-testid="EditIcon"]').click(); // eslint-disable-line quotes
};

const uncheckIsShownInRowBeingEditedAndSave = (): void => {
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find(".MuiDataGrid-row--editing")
        .as("rowBeingEdited");

    cy.get("@rowBeingEdited")
        .find('[data-field="isShown"]') // eslint-disable-line quotes
        .find('[type="checkbox"]') // eslint-disable-line quotes
        .uncheck();

    cy.get("@rowBeingEdited")
        .find('[data-testid="SaveIcon"]') // eslint-disable-line quotes
        .click();
};

const clickEditSlotsButtonForCentre = (collectionCentreName: string): void => {
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find('[aria-label="Edit collection slots for ' + collectionCentreName + '"]') // eslint-disable-line quotes
        .click();
};

const addNewTimeSlotInModal = (hrs: string, min: string): void => {
    cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
        .find('[data-testid="DefineNewSlot"]') // eslint-disable-line quotes
        .click();

    cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
        .find('input[placeholder="hh:mm"]', { timeout: 5000 }) // eslint-disable-line quotes
        .as("timeSlotInput");

    cy.get("@timeSlotInput").type(hrs + min);

    cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
        .find('[data-testid="AddSlot"]') // eslint-disable-line quotes
        .click();
};
