import { v4 as uuidv4 } from "uuid";
import {
    addNewCollectionCentre,
    addNewTimeSlotInModal,
    clickEditButtonForCentre,
    saveAvailableDaysForCentre,
    saveTimeSlotsForCentre,
    startEditingCollectionCentreRow,
    checkIsShownInRowBeingEditedAndSave,
} from "./commonActions/collectionCentres";

describe("Edit a collection centre on admins page", () => {
    let newCollectionCentreName: string;

    beforeEach(() => {
        cy.login();
        // Set up fresh intercepts for each test
        cy.intercept({ method: "GET", url: "**/rest/v1/collection_centres*" }).as(
            "getCollectionCentres"
        );
        cy.intercept({ method: "PATCH", url: "**/rest/v1/collection_centres*" }).as(
            "updateCollectionCentre"
        );
        cy.intercept({ method: "POST", url: "**/rest/v1/collection_centres*" }).as(
            "saveCollectionCentre"
        );

        cy.visit("/admin");

        newCollectionCentreName = `${uuidv4()}`;
    });

    it("Adds a collection centre and marks it as shown successfully", () => {
        addNewCollectionCentre(newCollectionCentreName);

        startEditingCollectionCentreRow(newCollectionCentreName);
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .find(".MuiDataGrid-row--editing", { timeout: 5000 })
            .should("exist")
            .as("rowBeingEdited");

        checkIsShownInRowBeingEditedAndSave("@rowBeingEdited");
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .contains(".MuiDataGrid-cell", newCollectionCentreName, { timeout: 5000 })
            .should("exist");

        // Check the cc row appears as 'not shown'
        cy.get('div[aria-label="Collection Centres Table"]') // eslint-disable-line quotes
            .contains(newCollectionCentreName, { timeout: 5000 })
            .parents(".MuiDataGrid-row")
            .as("newlyEditedRow");

        cy.get("@newlyEditedRow")
            .find('[data-field="isShown"]') // eslint-disable-line quotes
            .find('[data-testid="CheckIcon"]') // eslint-disable-line quotes
            .should("exist");
    });

    it("Adds a collection centre and displays its correct name in the Edit Modals", () => {
        addNewCollectionCentre(newCollectionCentreName);

        // Open the TimeSlots modal
        clickEditButtonForCentre(
            "Edit collection slots for",
            newCollectionCentreName,
            "CollectionCentreTimeSlotsModal"
        );

        // Check the Modal heading contains the right name
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
            .contains("div", newCollectionCentreName)
            .should("have.text", newCollectionCentreName);

        // Click somewhere outside the Modal to close it without saving
        cy.get("body").click("topLeft");

        // Modal should be closed
        cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]').should("not.exist"); // eslint-disable-line quotes

        // Open the Available Days modal
        clickEditButtonForCentre(
            "Edit available collection days for",
            newCollectionCentreName,
            "CollectionCentreAvailableDaysModal"
        );

        // Check the Modal heading contains the right name
        cy.get('div[data-testid="CollectionCentreAvailableDaysModal"]') // eslint-disable-line quotes
            .contains("div", newCollectionCentreName)
            .should("have.text", newCollectionCentreName);

        // Click somewhere outside the Modal to close it without saving
        cy.get("body").click("topLeft");

        // Modal should be closed
        cy.get('div[data-testid="CollectionCentreAvailableDaysModal"]').should("not.exist"); // eslint-disable-line quotes
    });

    describe("Edit the collection centres' timeslots", () => {
        it("Adds a collection centre and edits collection slots successfully", () => {
            addNewCollectionCentre(newCollectionCentreName);

            // Open modal
            clickEditButtonForCentre(
                "Edit collection slots for",
                newCollectionCentreName,
                "CollectionCentreTimeSlotsModal"
            );

            // Add a slot
            addNewTimeSlotInModal("13", "15");
            cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
                .find('[aria-label="List of defined time slots"]', { timeout: 5000 }) // eslint-disable-line quotes
                .find('[aria-label="Time slot"]', { timeout: 5000 }) // eslint-disable-line quotes
                .as("timeSlots");
            cy.get("@timeSlots").eq(0).should("have.text", "13:15");
            cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes

            // Check slot order
            addNewTimeSlotInModal("12", "00");
            addNewTimeSlotInModal("12", "30");
            cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
                .find('[aria-label="List of defined time slots"]') // eslint-disable-line quotes
                .find('[aria-label="Time slot"]') // eslint-disable-line quotes
                .as("timeSlots");
            cy.get("@timeSlots").eq(0).should("have.text", "12:00");
            cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes
            cy.get("@timeSlots").eq(1).should("have.text", "12:30");
            cy.get("@timeSlots").eq(1).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes
            cy.get("@timeSlots").eq(2).should("have.text", "13:15");
            cy.get("@timeSlots").eq(2).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes

            // Delete the middle timeslot
            cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
                .find('[aria-label="List of defined time slots"]') // eslint-disable-line quotes
                .find('[aria-label="Delete"]') // eslint-disable-line quotes
                .eq(1)
                .click();
            cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
                .find('[aria-label="List of defined time slots"]') // eslint-disable-line quotes
                .find('[aria-label="Time slot"]') // eslint-disable-line quotes
                .as("timeSlots");
            cy.get("@timeSlots").eq(0).should("have.text", "12:00");
            cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes
            cy.get("@timeSlots").eq(1).should("have.text", "13:15");
            cy.get("@timeSlots").eq(1).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes

            // Untick the first slot
            cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
                .find('[aria-label="List of defined time slots"]') // eslint-disable-line quotes
                .find('[aria-label="Time slot"]') // eslint-disable-line quotes
                .as("timeSlots");
            cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').uncheck(); // eslint-disable-line quotes

            cy.get("@timeSlots").eq(0).should("have.text", "12:00");
            cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').should("not.be.checked"); // eslint-disable-line quotes
            cy.get("@timeSlots").eq(1).should("have.text", "13:15");
            cy.get("@timeSlots").eq(1).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes

            // Save to close modal
            saveTimeSlotsForCentre();

            // Wait for patch request to complete and table subscription to refresh before reopening the modal
            cy.wait("@updateCollectionCentre", { timeout: 5000 });
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(500);

            // Open modal for same collection centre
            clickEditButtonForCentre(
                "Edit collection slots for",
                newCollectionCentreName,
                "CollectionCentreTimeSlotsModal"
            );

            // Check list of slots was saved
            cy.get('div[data-testid="CollectionCentreTimeSlotsModal"]') // eslint-disable-line quotes
                .find('[aria-label="List of defined time slots"]', { timeout: 5000 }) // eslint-disable-line quotes
                .find('[aria-label="Time slot"]') // eslint-disable-line quotes
                .as("timeSlots");
            cy.get("@timeSlots").eq(0).should("have.text", "12:00");
            cy.get("@timeSlots").eq(0).find('input[type="checkbox"]').should("not.be.checked"); // eslint-disable-line quotes
            cy.get("@timeSlots").eq(1).should("have.text", "13:15");
            cy.get("@timeSlots").eq(1).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes
        });
    });

    describe("Edit the collection centres' availability days", () => {
        it("Adds a collection centre and edits available days successfully", () => {
            addNewCollectionCentre(newCollectionCentreName);

            // Open modal
            clickEditButtonForCentre(
                "Edit available collection days for",
                newCollectionCentreName,
                "CollectionCentreAvailableDaysModal"
            );

            cy.get('div[data-testid="CollectionCentreAvailableDaysModal"]') // eslint-disable-line quotes
                .find('[aria-label="List of defined available days"]') // eslint-disable-line quotes
                .find('[aria-label="Available Day"]') // eslint-disable-line quotes
                .as("availableDays");

            cy.get("@availableDays").eq(0).find('input[type="checkbox"]').uncheck(); // eslint-disable-line quotes

            // Save to close modal
            saveAvailableDaysForCentre(newCollectionCentreName);

            // Wait for patch request to complete and table subscription to refresh before reopening the modal
            cy.wait("@updateCollectionCentre", { timeout: 5000 });
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(500);

            // Open modal for the same collection centre
            clickEditButtonForCentre(
                "Edit available collection days for",
                newCollectionCentreName,
                "CollectionCentreAvailableDaysModal"
            );

            // Check list of days was saved
            cy.get('div[data-testid="CollectionCentreAvailableDaysModal"]') // eslint-disable-line quotes
                .find('[aria-label="List of defined available days"]', { timeout: 6000 }) // eslint-disable-line quotes
                .find('[aria-label="Available Day"]', { timeout: 5000 }) // eslint-disable-line quotes
                .as("availableDays");
            cy.get("@availableDays").eq(0).find('input[type="checkbox"]').should("not.be.checked"); // eslint-disable-line quotes
            cy.get("@availableDays").eq(1).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes
        });

        it("Adds a collection centre and does not apply unsaved edits of its availability", () => {
            addNewCollectionCentre(newCollectionCentreName);

            // Open modal
            clickEditButtonForCentre(
                "Edit available collection days for",
                newCollectionCentreName,
                "CollectionCentreAvailableDaysModal"
            );

            cy.get('div[data-testid="CollectionCentreAvailableDaysModal"]') // eslint-disable-line quotes
                .find('[aria-label="List of defined available days"]') // eslint-disable-line quotes
                .find('[aria-label="Available Day"]') // eslint-disable-line quotes
                .as("availableDays");

            // Tick the first day
            cy.get("@availableDays").eq(0).find('input[type="checkbox"]').uncheck(); // eslint-disable-line quotes

            // Click somewhere outside the Modal to close it without saving
            cy.get("body").click("topLeft");

            // Modal should be closed
            cy.get('div[data-testid="CollectionCentreAvailableDaysModal"]').should("not.exist"); // eslint-disable-line quotes

            // Re-open modal for the same collection centre
            clickEditButtonForCentre(
                "Edit available collection days for",
                newCollectionCentreName,
                "CollectionCentreAvailableDaysModal"
            );

            // The first day should not be checked (unsaved change was discarded)
            cy.get('div[data-testid="CollectionCentreAvailableDaysModal"]') // eslint-disable-line quotes
                .find('[aria-label="List of defined available days"]', { timeout: 6000 }) // eslint-disable-line quotes
                .find('[aria-label="Available Day"]', { timeout: 6000 }) // eslint-disable-line quotes
                .as("availableDays"); // eslint-disable-line quotes
            cy.get("@availableDays").eq(0).find('input[type="checkbox"]').should("be.checked"); // eslint-disable-line quotes
        });
    });
});
