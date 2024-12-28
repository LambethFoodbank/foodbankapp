describe("Accessibility tests in light mode", () => {
    it("Checks clients page", () => {
        cy.login();
        cy.visit("/clients");

        // Ensure data table has loaded and then that content has loaded
        cy.get('[role="table"]', { timeout: 5000 }).should("exist"); // eslint-disable-line quotes
        cy.get('[aria-label="table-progress-bar"]', { timeout: 5000 }).should("not.exist"); // eslint-disable-line quotes

        cy.checkAccessibility();
    });

    it("Checks clients/add page", () => {
        cy.login();
        cy.visit("/clients/add");

        cy.checkAccessibility();
    });

    it("Checks parcels page", () => {
        cy.login();
        cy.visit("/parcels");

        // Ensure data table has loaded and then that content has loaded
        cy.get('[role="table"]', { timeout: 5000 }).should("exist"); // eslint-disable-line quotes
        cy.get('[aria-label="table-progress-bar"]', { timeout: 5000 }).should("not.exist"); // eslint-disable-line quotes

        cy.checkAccessibility({
            rules: {
                "empty-table-header": { enabled: false },
            },
        });
    });

    it("Checks parcels/add/[id] page", () => {
        cy.login();
        cy.visit("/parcels/add/1");

        cy.checkAccessibility();
    });

    it("Checks lists page", () => {
        cy.login();
        cy.visit("/lists");

        cy.checkAccessibility();
    });

    it("Checks admin page", () => {
        cy.login();
        cy.visit("/admin");
        cy.get("h1").should("exist");

        cy.checkAccessibility();
    });

    it("Checks login page", () => {
        cy.visit("/login");

        cy.checkAccessibility();
    });
});

describe("Accessibility tests in dark mode", () => {
    it("Checks clients page", () => {
        cy.login();
        cy.visit("/clients");

        // Ensure data table has loaded and then that content has loaded
        cy.get('[role="table"]', { timeout: 5000 }).should("exist"); // eslint-disable-line quotes
        cy.get('[aria-label="table-progress-bar"]', { timeout: 5000 }).should("not.exist"); // eslint-disable-line quotes
        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });

    it("Checks clients/add page", () => {
        cy.login();
        cy.visit("/clients/add");
        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });

    it("Checks parcels page", () => {
        cy.login();
        cy.visit("/parcels");

        // Ensure data table has loaded and then that content has loaded
        cy.get('[role="table"]', { timeout: 5000 }).should("exist"); // eslint-disable-line quotes
        cy.get('[aria-label="table-progress-bar"]', { timeout: 5000 }).should("not.exist"); // eslint-disable-line quotes
        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility({
            rules: {
                "empty-table-header": { enabled: false },
            },
        });
    });

    it("Checks parcels/add/[id] page", () => {
        cy.login();
        cy.visit("/parcels/add/1");
        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });

    it("Checks lists page", () => {
        cy.login();
        cy.visit("/lists");
        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });

    it("Checks admin page", () => {
        cy.login();
        cy.visit("/admin");
        cy.get("h1", { timeout: 5000 }).should("exist");
        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });

    it("Checks login page", () => {
        cy.visit("/login");

        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });
});
