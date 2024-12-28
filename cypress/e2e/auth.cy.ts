describe("Authentication tests", () => {
    const email: string = Cypress.env("TEST_USER");
    const password: string = Cypress.env("TEST_PASS");

    const extendedTimeout = { timeout: 10000 };

    const buttonReachablePaths = ["/", "/parcels", "/clients", "/lists", "/reports"];
    const allPaths = [...buttonReachablePaths, "/parcels/add"];

    it("Redirected to login page", () => {
        for (const url of allPaths) {
            cy.visit(url);
            cy.url().should("include", "/login");
        }
    });

    it("Redirected to parcels after login", () => {
        cy.visit("/login");

        cy.get("input[type='email']").type(email);
        cy.get("input[type='password']").type(password);

        cy.get("input[type='email']").should("have.value", email);
        cy.get("input[type='password']").should("have.value", password);

        cy.get("button[type='submit']").contains("Sign in").trigger("click");

        cy.url(extendedTimeout).should("include", "/parcels");
    });

    it("Get to parcels page", () => {
        cy.login();
        cy.visit("/parcels");

        cy.url().should("include", "/parcels");
    });

    it("Sign out", () => {
        cy.login();
        cy.visit("/parcels");
        cy.url().should("include", "/parcels");
        cy.get("button[aria-label='Sign Out Button']").click();
        cy.get("button[aria-label='Confirm Sign Out Button']").click();

        cy.url().should("include", "/login");
    });
});
