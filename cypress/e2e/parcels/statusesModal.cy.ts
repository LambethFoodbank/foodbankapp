/* eslint-disable quotes */
import dayjs from "dayjs";

describe("Apply status modal for parcels", () => {
    it("submits an overridden timestamp for admins", () => {
        // The overridden date is based on the current date so the tests can be run repeatedly on the same db
        const overriddenDateTime = dayjs()
            .subtract(3, "days")
            .subtract(2, "hours")
            .add(30, "minutes");
        const expectedEventDateTime = overriddenDateTime.format("DD/MM/YYYY, HH:mm:00");
        const statusToApply = "Called and Confirmed";

        cy.loginAsAdmin();
        cy.visit("/parcels");

        // Add status to the first parcel in the table
        cy.get("div[data-testid='ParcelsTable']")
            .find('tr[data-index="0"]') // eslint-disable-line quotes
            .find('input[type="checkbox"]')
            .first()
            .check();

        cy.get("#status-button").click();
        cy.get('li[role="menuitem"]').contains(statusToApply).click();

        cy.get('div[data-testid="StatusesModal"]')
            .should("be.visible")
            .within(() => {
                cy.get('[data-testid="OverrideDateTimeCheckbox"]').click();

                const dateTimeTextString = overriddenDateTime.format("DD/MM/YYYYHH:mm");
                cy.get('input[type="text"]').type(dateTimeTextString);

                cy.get("button").contains("Submit").click();
            });

        cy.get('div[data-testid="StatusesModal"]').should("not.exist");

        // Open the details modal for the first parcel and look for overridden status timestamp
        cy.get("div[data-testid='ParcelsTable']").find('tr[data-index="0"]').click(); // eslint-disable-line quotes
        cy.get('div[data-testid="ParcelDetailsModal"]')
            .should("be.visible")
            .within(() => {
                cy.get("div[data-testid='EventTable'] tr")
                    .filter(`:contains('${statusToApply}')`)
                    .filter(`:contains('${expectedEventDateTime}')`)
                    .should("have.length.of.at.least", 1);
            });
    });

    it("saves current timestamp when not overridden by admin", () => {
        const statusToApply = "Called and No Response";

        cy.loginAsAdmin();
        cy.visit("/parcels");

        // Add status to the second parcel in the table
        cy.get("div[data-testid='ParcelsTable']")
            .find('tr[data-index="1"]') // eslint-disable-line quotes
            .find('input[type="checkbox"]')
            .first()
            .check();

        cy.get("#status-button").click();
        cy.get('li[role="menuitem"]').contains(statusToApply).click();

        cy.get('div[data-testid="StatusesModal"]')
            .should("be.visible")
            .within(() => {
                cy.get('[data-testid="OverrideDateTimeCheckbox"]').should("not.be.checked");

                cy.get("button").contains("Submit").click();
            });
        const expectedEventDateTime = dayjs().format("DD/MM/YYYY, HH:mm:");

        cy.get('div[data-testid="StatusesModal"]').should("not.exist");

        // Open the details modal for the second parcel and look for current timestamp
        cy.get("div[data-testid='ParcelsTable']").find('tr[data-index="1"]').click(); // eslint-disable-line quotes
        cy.get('div[data-testid="ParcelDetailsModal"]')
            .should("be.visible")
            .within(() => {
                cy.get("div[data-testid='EventTable'] tr")
                    .filter(`:contains('${statusToApply}')`)
                    .filter(`:contains('${expectedEventDateTime}')`)
                    .should("have.length.of.at.least", 1);
            });
    });

    it("saves current timestamp for staff", () => {
        const statusToApply = "Pending More Info";

        cy.loginAsStaff();
        cy.visit("/parcels");

        // Add status to the second parcel in the table
        cy.get("div[data-testid='ParcelsTable']")
            .find('tr[data-index="2"]') // eslint-disable-line quotes
            .find('input[type="checkbox"]')
            .first()
            .check();

        cy.get("#status-button").click();
        cy.get('li[role="menuitem"]').contains(statusToApply).click();

        cy.get('div[data-testid="StatusesModal"]')
            .should("be.visible")
            .within(() => {
                cy.get('[data-testid="OverrideDateTimeCheckbox"]').should("not.exist");

                cy.get("button").contains("Submit").click();
            });
        const expectedEventDateTime = dayjs().format("DD/MM/YYYY, HH:mm:");

        cy.get('div[data-testid="StatusesModal"]').should("not.exist");

        // Open the details modal for the second parcel and look for current timestamp
        cy.get("div[data-testid='ParcelsTable']").find('tr[data-index="2"]').click(); // eslint-disable-line quotes
        cy.get('div[data-testid="ParcelDetailsModal"]')
            .should("be.visible")
            .within(() => {
                cy.get("div[data-testid='EventTable'] tr")
                    .filter(`:contains('${statusToApply}')`)
                    .filter(`:contains('${expectedEventDateTime}')`)
                    .should("have.length.of.at.least", 1);
            });
    });
});
