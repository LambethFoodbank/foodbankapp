export const toggleCollectionCentreSectionOpen = (): void => {
    cy.wait("@getCollectionCentres");

    cy.get('[aria-label="Section: Collection Centres"]').click(); // eslint-disable-line quotes

    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .should("be.visible");
};

export const startAddingNewCollectionCentre = (): void => {
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find('[data-testid="AddIcon"]') // eslint-disable-line quotes
        .click();
};

export const fillOutNewCollectionCentreRowAndSave = (newCollectionCentreName: string): void => {
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find(".MuiDataGrid-row--editing", { timeout: 5000 })
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

    cy.wait("@saveCollectionCentre");

    // Wait for the row to exit editing mode completely
    cy.get("@newRow").should("not.exist");
};

export const startEditingCollectionCentreRow = (collectionCentreName: string): void => {
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .contains(collectionCentreName)
        .parents(".MuiDataGrid-row")
        .as("newlyAddedRow");

    cy.get("@newlyAddedRow").find('[data-testid="EditIcon"]').click(); // eslint-disable-line quotes
};

export const checkIsShownInRowBeingEditedAndSave = (row: string): void => {
    cy.get(row)
        .find('[data-field="isShown"]') // eslint-disable-line quotes
        .find('[type="checkbox"]') // eslint-disable-line quotes
        .check();

    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find(".MuiDataGrid-row--editing")
        .as("rowBeingEdited");

    cy.get(row)
        .find('[data-testid="SaveIcon"]') // eslint-disable-line quotes
        .click();

    cy.wait("@updateCollectionCentre");
};

export const addNewTimeSlotInModal = (hrs: string, min: string): void => {
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

export const clickEditButtonForCentre = (
    ariaLabel: string,
    collectionCentreName: string,
    modalName: string
): void => {
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find(`[aria-label="${ariaLabel} ${collectionCentreName}"]`, { timeout: 6000 }) // eslint-disable-line quotes
        .click();
    cy.get(`div[data-testid="${modalName}"]`) // eslint-disable-line quotes
        .should("be.visible");
};

export const saveTimeSlotsForCentre = (): void => {
    cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
        .find('[data-testid="SaveSlotsCloseModal"]') // eslint-disable-line quotes
        .click();
    cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]').should("not.exist"); // eslint-disable-line quotes

    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find(".MuiDataGrid-row--editing")
        .find('[data-testid="SaveIcon"]') // eslint-disable-line quotes
        .click();
};

export const saveAvailableDaysForCentre = (collectionCentreName: string): void => {
    void collectionCentreName;
    cy.get('div[data-testid="CollectionCentreAvailableDaysModal"]') // eslint-disable-line quotes
        .find('button:contains("Save")') // eslint-disable-line quotes
        .click();
    cy.get('div[data-testid="CollectionCentreAvailableDaysModal"]').should("not.exist"); // eslint-disable-line quotes

    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find(".MuiDataGrid-row--editing")
        .find('[data-testid="SaveIcon"]') // eslint-disable-line quotes
        .click();
};

export const addNewCollectionCentre = (newCollectionCentreName: string): void => {
    toggleCollectionCentreSectionOpen();

    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find(".MuiDataGrid-row", { timeout: 5000 })
        .should("be.visible");

    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find(newCollectionCentreName)
        .should("not.exist"); // If this fails then the random UUID is already there

    startAddingNewCollectionCentre();
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .find(".MuiDataGrid-row--editing", { timeout: 5000 })
        .should("exist");

    fillOutNewCollectionCentreRowAndSave(newCollectionCentreName);

    // Wait for the data to reload and ensure the new item appears with proper data
    cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
        .contains(".MuiDataGrid-cell", newCollectionCentreName, { timeout: 5000 })
        .should("be.visible");

    // Give a moment for the database subscription to refresh the data with proper timestamps
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
};
