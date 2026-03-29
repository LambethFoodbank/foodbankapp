import React from "react";
import "@testing-library/jest-dom/jest-globals";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import StyleManager from "@/app/themes";
import {
    fakeData,
    fakeSmallerData,
    fakeMidData,
    fakeDataHeaders,
    fullNameTextFilterTest,
    typeButtonFilterTest,
} from "./testHelpers";
import { expect, it } from "@jest/globals";
import WrappedTableForTest from "./WrappedTable";
import userEvent from "@testing-library/user-event";
import { ClientPaginatedMaterialTable } from "@/components/Tables/MaterialTable";
import { MRT_RowData } from "material-react-table";

describe("Generic Table component", () => {
    describe("Table without features", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <ClientPaginatedMaterialTable<MRT_RowData, string>
                        data={fakeData}
                        headerKeysAndLabels={fakeDataHeaders}
                        checkboxConfig={{ displayed: false }}
                        paginationConfig={{ enablePagination: false }}
                        sortConfig={{ sortPossible: false }}
                        filterConfig={{ primaryFiltersShown: false, additionalFiltersShown: false }}
                        rowActionsConfig={{ editable: false }}
                    />
                </StyleManager>
            );
        });

        it("should render the table with the correct headers and data", () => {
            fakeDataHeaders.forEach((header) => {
                expect(screen.getByText(header[1])).toBeInTheDocument();
            });
            fakeData.forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
        });

        it("should render the table without checkboxes", () => {
            for (let index = 0; index < fakeMidData.length; index++) {
                const checkbox = screen.queryByLabelText(`Select row ${index}`);
                expect(checkbox).toBeNull();
            }
        });

        it("should render the table without filters or more filters button", () => {
            expect(screen.queryByLabelText("Name")).toBeNull();
            expect(screen.queryByText("Hotel")).toBeNull();
            expect(screen.queryByText("Regular")).toBeNull();
            expect(screen.queryByText("More")).toBeNull();
            expect(screen.queryByText("Clear")).toBeNull();
        });

        it("should render the table without pagination", () => {
            expect(screen.queryByLabelText("Rows per page")).toBeNull();
            expect(screen.queryByLabelText("Go to first page")).toBeNull();
            expect(screen.queryByLabelText("Go to previous page")).toBeNull();
            expect(screen.queryByLabelText("Go to next page")).toBeNull();
            expect(screen.queryByLabelText("Go to last page")).toBeNull();
        });

        it("should have no action on row click", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText("Tom"));
            });
            expect(screen.queryByText("row clicked Tom")).toBeNull();
        });

        it("shouldn't render edit, delete or swap row buttons", () => {
            fakeData.forEach((_, index) => {
                expect(screen.queryByTestId(`button-edit-row-${index}`)).toBeNull();
            });

            fakeData.forEach((_, index) => {
                expect(screen.queryByTestId(`delete row ${index}`)).toBeNull();
            });

            fakeData.forEach((_, index) => {
                expect(screen.queryByTestId(`button-move-row-up-${index}`)).toBeNull();
                expect(screen.queryByTestId(`button-move-row-down-${index}`)).toBeNull();
            });
        });
    });

    describe("Table with checkboxes", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeMidData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{ isCheckboxIncluded: true }}
                    />
                </StyleManager>
            );
        });

        it("should render the table with checkboxes", () => {
            expect(screen.getByLabelText("Select row 0")).toBeInTheDocument();
        });

        it("should render the table with a checkbox for each row", () => {
            for (let index = 0; index < fakeMidData.length; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).toBeInTheDocument();
            }
        });

        it("should allow checkboxes to be toggled on and off and have no impact on other checkboxes", async () => {
            for (let index = 0; index < fakeMidData.length; index++) {
                const checkbox = screen.getByLabelText(`Select row ${index}`);

                await act(async () => {
                    fireEvent.click(checkbox);
                });
                expect(checkbox).toBeChecked();

                if (index > 0) {
                    expect(screen.getByLabelText(`Select row ${index - 1}`)).not.toBeChecked();
                }

                await act(async () => {
                    fireEvent.click(checkbox);
                });
                expect(checkbox).not.toBeChecked();
            }
        });

        it("should have checkall box that toggles every checkbox", async () => {
            const selectAllCheckbox = screen.getByLabelText("Select all rows");

            await act(async () => {
                fireEvent.click(selectAllCheckbox);
            });
            for (let index = 0; index < fakeMidData.length; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).toBeChecked();
            }

            await act(async () => {
                fireEvent.click(selectAllCheckbox);
            });
            fakeMidData.forEach((_, index) => {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            });
        });

        it("should have checkall box triggered when all rows checkboxes are checked", async () => {
            for (let index = 0; index < fakeMidData.length; index++) {
                await act(async () => {
                    fireEvent.click(screen.getByLabelText(`Select row ${index}`));
                });
            }
            expect(screen.getByLabelText("Select all rows")).toBeChecked();
        });

        it("should have checkall box unchecked when one row is unchecked", async () => {
            const selectAllCheckbox = screen.getByLabelText("Select all rows");

            await act(async () => {
                fireEvent.click(selectAllCheckbox);
            });
            expect(selectAllCheckbox).toBeChecked();

            const row1Checkbox = screen.getByLabelText("Select row 0");
            expect(row1Checkbox).toBeChecked();

            await act(async () => {
                fireEvent.click(row1Checkbox);
            });
            expect(row1Checkbox).not.toBeChecked();
            expect(selectAllCheckbox).not.toBeChecked();
        });
    });

    describe("Table with primary filters", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeMidData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{
                            filters: {
                                primaryFilters: [fullNameTextFilterTest, typeButtonFilterTest],
                                additionalFilters: [],
                            },
                        }}
                    />
                </StyleManager>
            );
        });

        it("should render the table with name input box", () => {
            expect(screen.getByLabelText("Name")).toBeInTheDocument();
        });

        it("should have text filter correctly select table rows by first names that match input", async () => {
            const user = userEvent.setup();
            const nameInput = screen.getByLabelText("Name");
            expect(screen.getByText("Tom")).toBeInTheDocument();
            expect(screen.queryByText("Harper")).toBeInTheDocument();
            await user.type(nameInput, "Tom");
            expect(screen.getByText("Tom")).toBeInTheDocument();
            expect(screen.queryByText("Harper")).toBeNull();
        });

        it("should render table with default filters", () => {
            fakeMidData.forEach((data) => {
                data.type === "regular"
                    ? expect(screen.getByText(data.full_name)).toBeInTheDocument()
                    : expect(screen.queryByText(data.full_name)).toBeNull();
            });
        });

        it("should have button filter correctly select table rows by type", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText("Hotel"));
            });
            fakeMidData.forEach((data) => {
                data.type === "regular"
                    ? expect(screen.queryByText(data.full_name)).toBeNull()
                    : expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            await act(async () => {
                fireEvent.click(screen.getByText("Regular"));
            });
            fakeMidData.forEach((data) => {
                data.type === "regular"
                    ? expect(screen.getByText(data.full_name)).toBeInTheDocument()
                    : expect(screen.queryByText(data.full_name)).toBeNull();
            });
        });

        it("should have clear button remove all filters except those that specify to persist", async () => {
            const nameInput = screen.getByLabelText("Name");
            const clearButton = screen.getByText("Clear");
            const hotelButton = screen.getByText("Hotel");
            await act(async () => {
                fireEvent.click(hotelButton);
            });

            await act(async () => {
                fireEvent.change(nameInput, { target: { value: "Sam" } });
            });

            fakeMidData.forEach((data) => {
                data.full_name === "Sam"
                    ? expect(screen.getByText(data.full_name)).toBeInTheDocument()
                    : expect(screen.queryByText(data.full_name)).toBeNull();
            });
            await act(async () => {
                fireEvent.click(clearButton);
            });
            fakeMidData.forEach((data) => {
                data.type === "regular"
                    ? expect(screen.queryByText(data.full_name)).toBeNull()
                    : expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
        });
    });

    describe("Table with primary and secondary filters", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeMidData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{
                            filters: {
                                primaryFilters: [fullNameTextFilterTest],
                                additionalFilters: [typeButtonFilterTest],
                            },
                        }}
                    />
                </StyleManager>
            );
        });

        it("should render the table with more filters button", () => {
            expect(screen.getByText("More")).toBeInTheDocument();
        });

        it("should have more filters button toggle additional filters on and off", async () => {
            const moreButton = screen.getByText("More");
            expect(screen.queryByText("Regular")).toBeNull();
            await act(async () => {
                fireEvent.click(moreButton);
            });
            expect(screen.getByText("Regular")).toBeInTheDocument();
            expect(screen.getByText("Less")).toBeInTheDocument();
            await act(async () => {
                fireEvent.click(moreButton);
            });
            expect(screen.queryByText("Regular")).toBeNull();
        });
    });

    describe("Table with primary filters and checkboxes", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeMidData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{
                            isCheckboxIncluded: true,
                            filters: {
                                primaryFilters: [fullNameTextFilterTest],
                                additionalFilters: [],
                            },
                        }}
                    />
                </StyleManager>
            );
        });

        it("should have checkboxes unaffected by filtering", async () => {
            for (let index = 0; index < fakeMidData.length; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }
            const checkbox = screen.getByLabelText("Select row 0");
            await act(async () => {
                fireEvent.click(checkbox);
            });
            expect(screen.getByLabelText("Select row 0")).toBeChecked();
            const nameInput = screen.getByLabelText("Name");
            await act(async () => {
                fireEvent.change(nameInput, { target: { value: "Sam" } });
            });
            const clearButton = screen.getByText("Clear");
            await act(async () => {
                fireEvent.click(clearButton);
            });
            expect(screen.getByLabelText("Select row 0")).toBeChecked();
            for (let index = 1; index < fakeMidData.length; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }
        });
    });

    describe("Table with pagination", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{ isPaginationIncluded: true }}
                    />
                </StyleManager>
            );
        });

        it("should render table with only 7 rows", () => {
            fakeData.slice(0, 7).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(7).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
        });

        it("should move to next page to view next set of rows", async () => {
            const nextButton = screen.getByLabelText("Go to next page", { selector: "button" });
            await act(async () => {
                fireEvent.click(nextButton);
            });

            fakeData.slice(7, 14).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(0, 7).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
            fakeData.slice(14).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
        });

        it("should move to previous page to view previous set of rows", async () => {
            const nextButton = screen.getByLabelText("Go to next page", { selector: "button" });
            const previousButton = screen.getByLabelText("Go to previous page", {
                selector: "button",
            });
            await act(async () => {
                fireEvent.click(nextButton);
            });

            await act(async () => {
                fireEvent.click(previousButton);
            });

            fakeData.slice(0, 7).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(7).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
        });

        it("should allow change in number of rows per page", async () => {
            await act(async () => {
                fireEvent.mouseDown(screen.getByRole("combobox", { name: "Rows per page" }));
            });

            // wait for listbox to show
            let listbox = await screen.findByRole("listbox");

            // click the option
            await act(async () => {
                fireEvent.click(within(listbox).getByRole("option", { name: "5" }));
            });
            fakeData.slice(0, 5).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(5).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
            await act(async () => {
                fireEvent.mouseDown(screen.getByRole("combobox", { name: "Rows per page" }));
            });

            // wait for listbox to show
            listbox = await screen.findByRole("listbox");

            // click the option
            await act(async () => {
                fireEvent.click(within(listbox).getByRole("option", { name: "7" }));
            });
            fakeData.slice(0, 7).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(7).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
        });

        it("should move to final page when last page button is clicked and first page when first page button is clicked", async () => {
            await act(async () => {
                fireEvent.mouseDown(screen.getByRole("combobox", { name: "Rows per page" }));
            });

            // wait for listbox to show
            const listbox = await screen.findByRole("listbox");

            // click the option
            await act(async () => {
                fireEvent.click(within(listbox).getByRole("option", { name: "5" }));
            });

            await act(async () => {
                fireEvent.click(screen.getByLabelText("Go to last page", { selector: "button" }));
            });

            await screen.findByText(fakeData[fakeData.length - 2].full_name);

            fakeData.slice(fakeData.length - 5).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(0, fakeData.length - 5).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
            await act(async () => {
                fireEvent.click(screen.getByLabelText("Go to first page", { selector: "button" }));
            });
            fakeData.slice(0, 5).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(5).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
        });
    });

    describe("Table with pagination and checkboxes", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{ isPaginationIncluded: true, isCheckboxIncluded: true }}
                    />
                </StyleManager>
            );
        });

        it("should have checkboxes unaffected by pagination", async () => {
            for (let index = 0; index < 7; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }
            const checkbox = screen.getByLabelText("Select row 0");
            await act(async () => {
                fireEvent.click(checkbox);
            });
            expect(screen.getByLabelText("Select row 0")).toBeChecked();

            const nextButton = screen.getByLabelText("Go to next page", { selector: "button" });
            await act(async () => {
                fireEvent.click(nextButton);
            });
            for (let index = 0; index < 7; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }

            const prevButton = screen.getByLabelText("Go to previous page", { selector: "button" });
            await act(async () => {
                fireEvent.click(prevButton);
            });
            expect(screen.getByLabelText("Select row 0")).toBeChecked();

            for (let index = 1; index < 7; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }
        });

        it("should have checkboxes unaffected by change in rows per page", async () => {
            await act(async () => {
                fireEvent.click(screen.getByLabelText("Select row 0"));
            });

            await act(async () => {
                fireEvent.click(screen.getByLabelText("Select row 6"));
            });

            for (let index = 1; index < 6; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }
            expect(screen.getByLabelText("Select row 0")).toBeChecked();
            expect(screen.getByLabelText("Select row 6")).toBeChecked();

            await act(async () => {
                fireEvent.mouseDown(screen.getByRole("combobox", { name: "Rows per page" }));
            });

            // wait for listbox to show
            let listbox = await screen.findByRole("listbox");

            // click the option
            await act(async () => {
                fireEvent.click(within(listbox).getByRole("option", { name: "5" }));
            });

            expect(screen.getByLabelText("Select row 0")).toBeChecked();
            for (let index = 1; index < 5; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }

            await act(async () => {
                fireEvent.mouseDown(screen.getByRole("combobox", { name: "Rows per page" }));
            });

            // wait for listbox to show
            listbox = await screen.findByRole("listbox");

            // click the option
            await act(async () => {
                fireEvent.click(within(listbox).getByRole("option", { name: "7" }));
            });

            for (let index = 1; index < 6; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }
            expect(screen.getByLabelText("Select row 0")).toBeChecked();
            expect(screen.getByLabelText("Select row 6")).toBeChecked();
        });
    });

    describe("Table with toggleable headers", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeSmallerData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{ isHeaderTogglesIncluded: true }}
                    />
                </StyleManager>
            );
        });

        it("should render the table with toggleable headers", () => {
            expect(screen.getByTestId("select-columns-button")).toBeInTheDocument();
        });

        it("should render with only default shown headers", async () => {
            fakeDataHeaders.forEach((header, index) => {
                index < fakeDataHeaders.length - 1
                    ? expect(screen.getByText(header[1])).toBeInTheDocument()
                    : expect(screen.queryByText(header[1])).toBeNull();
            });

            const selectColumnsButton = screen.getByTestId("select-columns-button");
            await act(async () => {
                fireEvent.click(selectColumnsButton);
            });

            fakeDataHeaders.forEach((header, index) => {
                switch (index) {
                    case 0:
                        break;
                    case fakeDataHeaders.length - 1:
                        expect(
                            within(screen.getByTestId(`option-${header[0]}`)).getByRole("checkbox")
                        ).not.toBeChecked();
                        break;
                    default:
                        expect(
                            within(screen.getByTestId(`option-${header[0]}`)).getByRole("checkbox")
                        ).toBeChecked();
                        break;
                }
            });
        });

        it("should only have toggleable headers in the select columns dropdown", async () => {
            const selectColumnsButton = screen.getByTestId("select-columns-button");
            await act(async () => {
                fireEvent.click(selectColumnsButton);
            });
            fakeDataHeaders.forEach((header, index) => {
                index === 0
                    ? expect(screen.queryByTestId(`option-${header[0]}`)).toBeNull()
                    : expect(screen.getByTestId(`option-${header[0]}`)).toBeInTheDocument();
            });
        });

        it("should have headers be toggled on and off", async () => {
            const last_header = fakeDataHeaders[fakeDataHeaders.length - 1];

            expect(screen.queryByText(last_header[1])).toBeNull();
            expect(screen.queryByTestId("checkbox-group-popup")).toBeFalsy();

            const selectColumnsButton = screen.getByTestId("select-columns-button");
            await act(async () => {
                fireEvent.click(selectColumnsButton);
            });
            expect(screen.queryByTestId("checkbox-group-popup")).toBeTruthy();

            expect(
                within(screen.getByTestId(`option-${last_header[0]}`)).getByRole("checkbox")
            ).not.toBeChecked();

            await act(async () => {
                fireEvent.click(screen.getByTestId(`option-${last_header[0]}`));
            });
            expect(
                within(screen.getByTestId(`option-${last_header[0]}`)).getByRole("checkbox")
            ).toBeChecked();

            await userEvent.keyboard("{Escape}");
            expect(screen.queryByTestId("checkbox-group-popup")).toBeFalsy();

            expect(screen.getByText(last_header[1])).toBeInTheDocument();

            await act(async () => {
                fireEvent.click(selectColumnsButton);
            });
            expect(
                within(screen.getByTestId(`option-${last_header[0]}`)).getByRole("checkbox")
            ).toBeChecked();

            await act(async () => {
                fireEvent.click(screen.getByTestId(`option-${last_header[0]}`));
            });
            expect(
                within(screen.getByTestId(`option-${last_header[0]}`)).getByRole("checkbox")
            ).not.toBeChecked();

            await userEvent.keyboard("{Escape}");

            expect(screen.queryByText(last_header[1])).toBeNull();
        });
    });

    describe("Table with action on row click", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeMidData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{ isRowClickIncluded: true }}
                    />
                </StyleManager>
            );
        });

        it("should complete row click action when clicked", async () => {
            expect(screen.queryByText(`row clicked ${fakeMidData[0].full_name}`)).toBeNull();
            await act(async () => {
                fireEvent.click(screen.getByText(fakeMidData[0].full_name));
            });
            expect(screen.getByText(`row clicked ${fakeMidData[0].full_name}`)).toBeInTheDocument();
        });

        it("should have every row be clickable", async () => {
            for (const data of fakeMidData) {
                expect(screen.queryByText(`row clicked ${data.full_name}`)).toBeNull();

                await act(async () => {
                    fireEvent.click(screen.getByText(data.full_name));
                });

                expect(screen.getByText(`row clicked ${data.full_name}`)).toBeInTheDocument();
            }
        });
    });

    describe("Table with rows that can be edited", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeMidData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{ isRowEditableIncluded: true }}
                    />
                </StyleManager>
            );
        });

        it("should render edit button on every row", () => {
            fakeMidData.forEach((_, index) => {
                expect(screen.getByTestId(`button-edit-row-${index}`)).toBeInTheDocument();
            });
        });

        it("should render delete button on every row except first", () => {
            expect(screen.queryByTestId("button-delete-row-0")).toBeNull();
            fakeMidData.forEach((_, index) => {
                index !== 0 &&
                    expect(screen.getByTestId(`button-delete-row-${index}`)).toBeInTheDocument();
            });
        });

        it("should have edit button perform edit action", () => {
            expect(screen.queryByText("Edit clicked: 0")).toBeNull();
            expect(screen.queryByText("Edit clicked: 1")).toBeNull();
            act(() => fireEvent.click(screen.getByTestId("button-edit-row-0")));
            expect(screen.getByText("Edit clicked: 0")).toBeInTheDocument();
            expect(screen.queryByText("Edit clicked: 1")).toBeNull();
            act(() => fireEvent.click(screen.getByTestId("button-edit-row-1")));
            expect(screen.getByText("Edit clicked: 1")).toBeInTheDocument();
            expect(screen.queryByText("Edit clicked: 0")).toBeNull();
        });

        it("should have delete button perform delete action", () => {
            expect(screen.queryByText("Delete clicked: 1")).toBeNull();
            expect(screen.queryByText("Delete clicked: 2")).toBeNull();
            act(() => fireEvent.click(screen.getByTestId("button-delete-row-1")));
            expect(screen.getByText("Delete clicked: 1")).toBeInTheDocument();
            expect(screen.queryByText("Delete clicked: 2")).toBeNull();
            act(() => fireEvent.click(screen.getByTestId("button-delete-row-2")));
            expect(screen.getByText("Delete clicked: 2")).toBeInTheDocument();
            expect(screen.queryByText("Delete clicked: 1")).toBeNull();
        });
    });

    describe("Table with column display functions", () => {
        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeMidData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{ isColumnDisplayFunctionsIncluded: true }}
                    />
                </StyleManager>
            );
        });

        it("should render the table with column display functions", () => {
            fakeMidData.forEach((data) => {
                expect(screen.getByText(data.full_name.toUpperCase())).toBeInTheDocument();
            });
        });
    });

    describe("Table with sorting", () => {
        const mockSortMethod = jest.fn();

        beforeEach(() => {
            render(
                <StyleManager>
                    <WrappedTableForTest
                        mockData={fakeMidData}
                        mockHeaders={fakeDataHeaders}
                        testableContent={{
                            sortingFlags: {
                                isSortingOptionsIncluded: true,
                                sortMethod: mockSortMethod,
                            },
                        }}
                    />
                </StyleManager>
            );
        });

        it("should not trigger sort function when sorting a disable sort column", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText(fakeDataHeaders[1][1]));
            });
            expect(mockSortMethod).not.toHaveBeenCalled();
        });

        it("should trigger sort function with correct asc or desc argument", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText(fakeDataHeaders[0][1]));
            });
            expect(mockSortMethod).toHaveBeenCalledWith("asc");
            await act(async () => {
                fireEvent.click(screen.getByText("Name"));
            });
            expect(mockSortMethod).toHaveBeenCalledWith("desc");
        });
    });
});
