describe("Delivery Areas on admins page", () => {
    beforeEach(() => {
        cy.login();
        cy.intercept({ method: "GET", url: "**/rest/v1/delivery_areas*" }).as("getDeliveryAreas");
        cy.visit("/admin");
    });

    it("Initial delivery areas", () => {
        toggleDeliveryAreaNameSection();
        deliveryAreas(false);
    });

    it("Delivery areas descending order", () => {
        toggleDeliveryAreaNameSection();
        orderDeliveryAreas();
        deliveryAreas(true);
    });

    it("Add a new delivery area", () => {
        toggleDeliveryAreaNameSection();

        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-toolbarContainer", { timeout: 5000 })
            .should("be.visible");

        const newDeliveryArea = "M14";

        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .find(newDeliveryArea)
            .should("not.exist"); // If this fails then the random UUID is already there

        startAddingNewDeliveryArea();

        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-row--editing", { timeout: 5000 })
            .should("exist");

        fillOutNewDeliveryAreaAndSave(newDeliveryArea);
        cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
            .contains(".MuiDataGrid-cellContent", newDeliveryArea, { timeout: 5000 })
            .should("be.visible");
    });

    it("Prevents adding duplicate delivery area", () => {
        toggleDeliveryAreaNameSection();

        const existingDeliveryArea = "CR0";

        startAddingNewDeliveryArea();
        fillOutNewDeliveryAreaAndSave(existingDeliveryArea);
        cy.get('[role="alert"]').should("contain", "already"); // eslint-disable-line quotes
    });

    it("Prevents adding empty delivery area", () => {
        toggleDeliveryAreaNameSection();

        const emptyDeliveryArea = " ";

        startAddingNewDeliveryArea();
        fillOutNewDeliveryAreaAndSave(emptyDeliveryArea);

        cy.get('[role="alert"]').should("contain", "whitespaces"); // eslint-disable-line quotes
    });

    it("Prevents adding wrong delivery area", () => {
        toggleDeliveryAreaNameSection();

        const wrongDeliveryArea = "dfffdsvcfv";

        startAddingNewDeliveryArea();
        fillOutNewDeliveryAreaAndSave(wrongDeliveryArea);

        cy.get('[role="alert"]').should("contain", "Invalid"); // eslint-disable-line quotes
    });

    it("Delete a delivery area", () => {
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
    cy.contains(editDeliveryAreaNameText, { matchCase: false }).click();
}

function assertDeliveryAreaName({
    rowIndex,
    deliveryAreaName,
}: {
    rowIndex: number;
    deliveryAreaName: string;
}): void {
    cy.contains(editDeliveryAreaNameText, { matchCase: false })
        .parents(".MuiPaper-root")
        .find(`[data-rowindex="${rowIndex}"]`) // eslint-disable-line quotes
        .find('[data-field="postcode"]') // eslint-disable-line quotes
        .should(($postcode) => {
            expect($postcode).to.contain(deliveryAreaName);
        });
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
    cy.wait("@getDeliveryAreas");
    cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
        .find('[data-testid="AddIcon"]') // eslint-disable-line quotes
        .click();
};

const orderDeliveryAreas = (): void => {
    cy.get('div[aria-label="Delivery Areas Table"]') // eslint-disable-line quotes
        .find('[data-testid="ArrowUpwardIcon"]') // eslint-disable-line quotes
        .click({ force: true });
};

const deliveryAreas = (descending: boolean): void => {
    Math.abs(0 - 15 * Number(descending));
    assertDeliveryAreaName({
        rowIndex: Math.abs(0 - 15 * Number(descending)),
        deliveryAreaName: "CR0",
    });
    assertDeliveryAreaName({
        rowIndex: Math.abs(1 - 15 * Number(descending)),
        deliveryAreaName: "CR7",
    });

    assertDeliveryAreaName({
        rowIndex: Math.abs(2 - 15 * Number(descending)),
        deliveryAreaName: "SE1",
    });
    assertDeliveryAreaName({
        rowIndex: Math.abs(3 - 15 * Number(descending)),
        deliveryAreaName: "SE11",
    });

    assertDeliveryAreaName({
        rowIndex: Math.abs(4 - 15 * Number(descending)),
        deliveryAreaName: "SE19",
    });
    assertDeliveryAreaName({
        rowIndex: Math.abs(5 - 15 * Number(descending)),
        deliveryAreaName: "SE21",
    });

    assertDeliveryAreaName({
        rowIndex: Math.abs(6 - 15 * Number(descending)),
        deliveryAreaName: "SE24",
    });
    assertDeliveryAreaName({
        rowIndex: Math.abs(7 - 15 * Number(descending)),
        deliveryAreaName: "SE25",
    });

    assertDeliveryAreaName({
        rowIndex: Math.abs(8 - 15 * Number(descending)),
        deliveryAreaName: "SE27",
    });
    assertDeliveryAreaName({
        rowIndex: Math.abs(9 - 15 * Number(descending)),
        deliveryAreaName: "SE5",
    });

    assertDeliveryAreaName({
        rowIndex: Math.abs(10 - 15 * Number(descending)),
        deliveryAreaName: "SW12",
    });
    assertDeliveryAreaName({
        rowIndex: Math.abs(11 - 15 * Number(descending)),
        deliveryAreaName: "SW16",
    });

    assertDeliveryAreaName({
        rowIndex: Math.abs(12 - 15 * Number(descending)),
        deliveryAreaName: "SW2",
    });
    assertDeliveryAreaName({
        rowIndex: Math.abs(13 - 15 * Number(descending)),
        deliveryAreaName: "SW4",
    });

    assertDeliveryAreaName({
        rowIndex: Math.abs(14 - 15 * Number(descending)),
        deliveryAreaName: "SW8",
    });
    assertDeliveryAreaName({
        rowIndex: Math.abs(15 - 15 * Number(descending)),
        deliveryAreaName: "SW9",
    });
};
