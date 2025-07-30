describe("Client details modal", () => {
    beforeEach(() => {
        cy.login();
        cy.visit("/clients/");
    });

    it("Displays an adults row", () => {
        openClientModal();
        assertAdultsRowDisplayedSuccessfully();
    });
});

function openClientModal(): void {
    cy.contains("name", { matchCase: false })
        .parents(".MuiPaper-root")
        .find('[id="row-0"]') // eslint-disable-line quotes
        .click();
}

function assertAdultsRowDisplayedSuccessfully(): void {
    cy.contains("Client Details", { matchCase: false });
    cy.contains("Adults", { matchCase: false, timeout: 10000 }).should("be.visible");
}
