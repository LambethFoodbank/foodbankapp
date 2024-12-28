describe("Rendering tests", () => {
    beforeEach(() => {
        cy.login();
    });

    it("Renders clients page", () => {
        cy.visit("/clients");

        cy.get("h1").should("contain.text", "Clients Page");
    });

    it("Renders lists page", () => {
        cy.visit("/lists");

        cy.get("h1").should("contain.text", "Lists");
    });

    it("Renders parcels page", () => {
        cy.visit("/parcels");

        cy.get("h1").should("contain.text", "Parcels Page");
    });

    it("Renders clients/add page", () => {
        cy.visit("/clients/add");

        cy.get("h1").should("contain.text", "Client Form");
    });
});
