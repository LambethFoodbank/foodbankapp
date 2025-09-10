describe("Parcels page url params", () => {
    beforeEach(() => {
        cy.login();
        cy.visit("/parcels");
    });

    const formatTodaysDateAsYYYYMMDD = (): string => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    it("Initial URL params are set to be the current date", () => {
        const formattedDate = formatTodaysDateAsYYYYMMDD();
        const expectedUrl = `/parcels?eb_packingDate[]=${formattedDate}&eb_packingDate[]=${formattedDate}&packingDate[]=${formattedDate}&packingDate[]=${formattedDate}`;
        cy.url().should("include", expectedUrl);
    });

    it("URL params are updated when filters are applied", () => {
        const formattedDate = formatTodaysDateAsYYYYMMDD();

        cy.get("[data-testid='text-filter-fullName']").type("th");

        const expectedUrl = `/parcels?eb_packingDate[]=${formattedDate}&eb_packingDate[]=${formattedDate}&fullName=th&packingDate[]=${formattedDate}&packingDate[]=${formattedDate}`;
        cy.url().should("include", expectedUrl);
    });

    it("Empty URL params are removed when filters are cleared", () => {
        const formattedDate = formatTodaysDateAsYYYYMMDD();
        cy.get("[data-testid='text-filter-fullName']").find("input").type("th");
        cy.url().should("include", "fullName=th");

        cy.get("[data-testid='text-filter-fullName']").find("input").clear();

        cy.url().should(
            "include",
            `/parcels?eb_packingDate[]=${formattedDate}&eb_packingDate[]=${formattedDate}&packingDate[]=${formattedDate}&packingDate[]=${formattedDate}`
        );
        cy.url().should("not.include", "fullName=");
    });

    it("Filters are set when URL params are changed directly", () => {
        const fromDateYmd = "2024-05-14";
        const fromDateDmy = "14/05/2024";
        const toDateYmd = "2024-06-02";
        const toDateDmy = "02/06/2024";
        const newFullName = "er";

        cy.visit(
            `/parcels?eb_packingDate[]=${fromDateDmy}&eb_packingDate[]=${toDateDmy}&fullName=${newFullName}&packingDate[]=${fromDateYmd}&packingDate[]=${toDateYmd}`
        );

        cy.get("[data-testid='text-filter-fullName']")
            .find("input")
            .should("have.value", newFullName);
        cy.get("[data-testid='date-range-input-from']").should("have.value", fromDateDmy);
        cy.get("[data-testid='date-range-input-to']").should("have.value", toDateDmy);
    });

    it("URL params are updated when going into packing manager view", () => {
        // Wait until table has loaded data
        cy.get("[role='table']").should("be.visible");
        cy.get("[aria-label='table-progress-bar']").should("not.exist");

        cy.get("[data-testid='packing-manager-view-button']").click();
        cy.url().should("include", "view=Packing%20Manager");
    });

    it("URL params are updated when going back to all parcels view", () => {
        cy.get("[data-testid='packing-manager-view-button']").click();
        cy.get("[data-testid='all-parcels-button']").click();
        cy.url().should("not.include", "view=");
    });

    it("Packing manager view enabled when URL param is set", () => {
        cy.visit("/parcels?view=Packing%20Manager");

        // Wait until table has loaded data
        cy.get("[role='table']").should("be.visible");
        cy.get("[aria-label='table-progress-bar']").should("not.exist");

        cy.get("[data-testid='packing-manager-view-button']").should(
            "have.class",
            "MuiButton-contained"
        );
    });

    // Skipping this test because the seed data doesn't have parcels dated today,
    // so the table will not have any data to display.
    it.skip("URL params are updated when a parcel is opened", () => {
        cy.get("[id='cell-fullName-0']").click();

        cy.get("[id='expandedParcelDetailsModal']").should("be.visible");

        // This should have the parcel ID
        cy.url().should("include", "parcelId=");
    });
});
