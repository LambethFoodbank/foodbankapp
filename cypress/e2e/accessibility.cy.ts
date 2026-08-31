const waitForTableToLoad = (): void => {
    cy.get("table", { timeout: 5000 }).should("exist");
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should("not.exist"); // eslint-disable-line quotes
};

const waitForHeadingToLoad = (): void => {
    cy.get("h1", { timeout: 5000 }).should("exist");
};

describe("Accessibility tests in light mode", () => {
    it("Checks clients page", () => {
        cy.login();
        cy.visit("/clients");
        waitForTableToLoad();

        cy.checkAccessibility();
    });

    it("Checks clients/add page", () => {
        cy.login();
        cy.visit("/clients/add");
        waitForHeadingToLoad();

        cy.checkAccessibility();
    });

    it("Checks parcels page", () => {
        cy.login();
        cy.visit("/parcels");
        waitForTableToLoad();

        cy.checkAccessibility({
            rules: {
                "empty-table-header": { enabled: false },
            },
        });
    });

    it("Checks parcels/add/[id] page", () => {
        cy.login();
        cy.visit("/parcels/add/1");
        waitForHeadingToLoad();

        cy.checkAccessibility();
    });

    it("Checks lists page", () => {
        cy.login();
        cy.visit("/lists");
        waitForHeadingToLoad();

        cy.checkAccessibility();
    });

    it("Checks admin page", () => {
        cy.login();
        cy.visit("/admin");
        waitForHeadingToLoad();

        cy.checkAccessibility();
    });

    it("Checks login page", () => {
        cy.visit("/login");
        waitForHeadingToLoad();

        cy.checkAccessibility();
    });
});

describe("Accessibility tests in dark mode", () => {
    it("Checks clients page", () => {
        cy.login();
        cy.visit("/clients");
        waitForTableToLoad();

        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });

    it("Checks clients/add page", () => {
        cy.login();
        cy.visit("/clients/add");
        waitForHeadingToLoad();

        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });

    it("Checks parcels page", () => {
        cy.login();
        cy.visit("/parcels");
        waitForTableToLoad();

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
        waitForHeadingToLoad();

        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });

    it("Checks lists page", () => {
        cy.login();
        cy.visit("/lists");
        waitForHeadingToLoad();

        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });

    it("Checks admin page", () => {
        cy.login();
        cy.visit("/admin");
        waitForHeadingToLoad();

        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });

    it("Checks login page", () => {
        cy.visit("/login");
        waitForHeadingToLoad();

        cy.get("label[aria-label='Theme Switch']").click();

        cy.checkAccessibility();
    });
});
