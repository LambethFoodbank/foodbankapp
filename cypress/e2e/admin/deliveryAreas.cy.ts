describe("Edit delivery areas on admins page", () => {
    beforeEach(() => {
        cy.login();
        cy.intercept({ method: "GET", url: "**/rest/v1/delivery_areas*" }).as("getDeliveryAreas");
        cy.visit("/admin");
    });

    it("Adds a new delivery area successfully", () => {
        toggleDeliveryAreaNameSection();

        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-toolbarContainer", { timeout: 5000 })
            .should("be.visible");

        const newDeliveryArea = "M14";

        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .find(newDeliveryArea)
            .should("not.exist"); // If this fails then the postcode is already there

        startAddingNewDeliveryArea();

        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-row--editing", { timeout: 5000 })
            .should("exist");

        fillOutNewDeliveryAreaAndSave(newDeliveryArea);
        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .contains(".MuiDataGrid-cellContent", newDeliveryArea, { timeout: 5000 })
            .should("be.visible");
    });

    it("Tries to add a duplicate delivery area and fails", () => {
        toggleDeliveryAreaNameSection();

        const indexOfPostcodeToDuplicate = 3;
        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-row", { timeout: 5000 })
            .should("have.length.greaterThan", indexOfPostcodeToDuplicate);

        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .find('[role="row"]') // eslint-disable-line quotes
            .eq(indexOfPostcodeToDuplicate)
            .find('[data-field="postcode"]') // eslint-disable-line quotes
            .invoke("text")
            .then((text) => {
                const existingDeliveryArea = text.trim();

                startAddingNewDeliveryArea();
                fillOutNewDeliveryAreaAndSave(existingDeliveryArea);
                cy.get('[role="alert"]').should("contain", "already"); // eslint-disable-line quotes
            });
    });

    it("Tries to add an empty delivery area and fails", () => {
        toggleDeliveryAreaNameSection();

        const emptyDeliveryArea = " ";

        startAddingNewDeliveryArea();
        fillOutNewDeliveryAreaAndSave(emptyDeliveryArea);

        cy.get('[role="alert"]').should("contain", "whitespaces"); // eslint-disable-line quotes
    });

    it("Tries to add an invalid delivery area and fails", () => {
        toggleDeliveryAreaNameSection();

        const invalidDeliveryArea = "dfffdsvcfv";

        startAddingNewDeliveryArea();
        fillOutNewDeliveryAreaAndSave(invalidDeliveryArea);

        cy.get('[role="alert"]').should("contain", "Invalid"); // eslint-disable-line quotes
    });

    it("Deletes a delivery area successfully", () => {
        toggleDeliveryAreaNameSection();

        const deletedDeliveryArea = "M14";

        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-toolbarContainer", { timeout: 5000 })
            .should("be.visible");

        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .contains(".MuiDataGrid-cellContent", deletedDeliveryArea, { timeout: 5000 })
            .should("exist")
            .closest('[role="row"]') // eslint-disable-line quotes
            .within(() => {
                cy.get('[data-testid="DeleteIcon"]').click(); // eslint-disable-line quotes
            });
        cy.get('div[aria-label="Delivery Areas Table"]').should("not.contain", deletedDeliveryArea); // eslint-disable-line quotes
    });
});

const editDeliveryAreaNameText = "edit delivery areas";

function toggleDeliveryAreaNameSection(): void {
    cy.wait("@getDeliveryAreas");
    cy.contains(editDeliveryAreaNameText, { matchCase: false }).click();
}

const fillOutNewDeliveryAreaAndSave = (newDeliveryAreaName: string): void => {
    cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
        .find(".MuiDataGrid-row--editing", { timeout: 5000 })
        .as("newRow");

    cy.get("@newRow")
        .find('[data-field="postcode"]') // eslint-disable-line quotes
        .find('input[type="text"]') // eslint-disable-line quotes
        .type(newDeliveryAreaName);

    cy.get("@newRow")
        .find('[data-testid="SaveIcon"]') // eslint-disable-line quotes
        .click();
};

const startAddingNewDeliveryArea = (): void => {
    cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
        .find('[data-testid="AddIcon"]') // eslint-disable-line quotes
        .click();
};
