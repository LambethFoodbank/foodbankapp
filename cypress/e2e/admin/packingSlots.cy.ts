describe("Packing slots on admins page", () => {
    beforeEach(() => {
        cy.login();
        // Set up fresh intercepts for each test
        cy.intercept({ method: "GET", url: "**/rest/v1/packing_slots*" }).as("getPackingSlots");
        cy.intercept({ method: "PATCH", url: "**/rest/v1/packing_slots*" }).as("updatePackingSlot");
        cy.intercept({ method: "POST", url: "**/rest/v1/packing_slots*" }).as("savePackingSlot");

        cy.visit("/admin");
    });

    it("Move the first packing slot down and then up", () => {
        togglePackingSlotsSection();

        assertPackingSlotName({ rowIndex: 0, packingSlotName: "AM" });
        assertPackingSlotName({ rowIndex: 1, packingSlotName: "PM" });

        movePackingSlot({ rowIndex: 0, direction: "down" });

        assertPackingSlotName({ rowIndex: 0, packingSlotName: "PM" });
        assertPackingSlotName({ rowIndex: 1, packingSlotName: "AM" });

        movePackingSlot({ rowIndex: 1, direction: "up" });

        assertPackingSlotName({ rowIndex: 0, packingSlotName: "AM" });
        assertPackingSlotName({ rowIndex: 1, packingSlotName: "PM" });
    });
});

function togglePackingSlotsSection(): void {
    cy.wait("@getPackingSlots");

    cy.get('[aria-label="Section: Modify Packing Slots"]').click(); // eslint-disable-line quotes

    cy.get('div[aria-label="Packing Slots Table"]') // eslint-disable-line quotes
        .should("be.visible");
}

function movePackingSlot({
    rowIndex,
    direction,
}: {
    rowIndex: number;
    direction: "up" | "down";
}): void {
    cy.get('div[aria-label="Packing Slots Table"]') // eslint-disable-line quotes
        .find(`[data-rowindex="${rowIndex}"]`) // eslint-disable-line quotes
        .find(`[data-testid="${direction === "up" ? "ArrowCircleUpIcon" : "ArrowCircleDownIcon"}"]`) // eslint-disable-line quotes
        .click();
}

function assertPackingSlotName({
    rowIndex,
    packingSlotName,
}: {
    rowIndex: number;
    packingSlotName: string;
}): void {
    cy.get('div[aria-label="Packing Slots Table"]') // eslint-disable-line quotes
        .find(`[data-rowindex="${rowIndex}"]`) // eslint-disable-line quotes
        .find('[data-field="name"]') // eslint-disable-line quotes
        .should(($slotName) => {
            expect($slotName).to.contain(packingSlotName);
        });
}
