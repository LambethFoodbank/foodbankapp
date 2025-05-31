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
        const expectedUrl = `/parcels?packingDate[]=${formattedDate}&packingDate[]=${formattedDate}`;
        cy.url().should("include", expectedUrl);
    });

    it("URL params are updated when filters are applied", () => {
        const formattedDate = formatTodaysDateAsYYYYMMDD();

        cy.get("[data-testid='text-filter-fullName']").type("th");

        const expectedUrl = `/parcels?fullName=th&packingDate[]=${formattedDate}&packingDate[]=${formattedDate}`;
        cy.url().should("include", expectedUrl);
    });

    it("Empty URL params are removed when filters are cleared", () => {
        const formattedDate = formatTodaysDateAsYYYYMMDD();
        cy.get("[data-testid='text-filter-fullName']").find("input").type("th");
        cy.url().should("include", "fullName=th");

        cy.get("[data-testid='text-filter-fullName']").find("input").clear();

        cy.url().should(
            "include",
            `/parcels?packingDate[]=${formattedDate}&packingDate[]=${formattedDate}`
        );
        cy.url().should("not.include", "fullName=");
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

    it("URL params are updated when a parcel is opened", () => {
        cy.get("[id='cell-fullName-0']").click();

        cy.get("[id='expandedParcelDetailsModal']").should("be.visible");

        // This should have the parcel ID
        cy.url().should("include", "parcelId=");
    });
});
