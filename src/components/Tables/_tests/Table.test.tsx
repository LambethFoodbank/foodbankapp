import React from "react";
import "@testing-library/jest-dom/jest-globals";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import StyleManager from "@/app/themes";
import {
    fakeData,
    fakeSmallerData,
    fakeMidData,
    fakeDataHeaders,
    MRT_RowData,
    fullNameTextFilterTest,
    typeButtonFilterTest,
} from "./testHelpers";
import { expect, it } from "@jest/globals";
import WrappedTableForTest from "./WrappedTable";
import userEvent from "@testing-library/user-event";
import { ClientPaginatedMaterialTable } from "@/components/Tables/MaterialTable";

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
            expect(screen.queryByLabelText("Rows per page:")).toBeNull();
            expect(screen.queryByLabelText("First Page")).toBeNull();
            expect(screen.queryByLabelText("Previous Page")).toBeNull();
            expect(screen.queryByLabelText("Next Page")).toBeNull();
            expect(screen.queryByLabelText("Last Page")).toBeNull();
        });

        it("should have no action on row click", () => {
            fireEvent.click(screen.getByText("Tom"));
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

        it("should allow checkboxes to be toggled on and off and have no impact on other checkboxes", () => {
            fakeMidData.forEach((_, index) => {
                const checkbox = screen.getByLabelText(`Select row ${index}`);
                fireEvent.click(checkbox);
                expect(checkbox).toBeChecked();
                if (index > 0) {
                    expect(screen.getByLabelText(`Select row ${index - 1}`)).not.toBeChecked();
                }
                fireEvent.click(checkbox);
                expect(checkbox).not.toBeChecked();
            });
        });

        it("should have checkall box that toggles every checkbox", () => {
            const selectAllCheckbox = screen.getByLabelText("Select all rows");

            fireEvent.click(selectAllCheckbox);
            for (let index = 0; index < fakeMidData.length; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).toBeChecked();
            }

            fireEvent.click(selectAllCheckbox);
            fakeMidData.forEach((_, index) => {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            });
        });

        it("should have checkall box triggered when all rows checkboxes are checked", () => {
            for (let index = 0; index < fakeMidData.length; index++) {
                fireEvent.click(screen.getByLabelText(`Select row ${index}`));
            }
            expect(screen.getByLabelText("Select all rows")).toBeChecked();
        });

        it("should have checkall box unchecked when one row is unchecked", () => {
            const selectAllCheckbox = screen.getByLabelText("Select all rows");

            fireEvent.click(selectAllCheckbox);
            expect(selectAllCheckbox).toBeChecked();

            const row1Checkbox = screen.getByLabelText("Select row 0");
            expect(row1Checkbox).toBeChecked();

            fireEvent.click(row1Checkbox);
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

        it("should have button filter correctly select table rows by type", () => {
            fireEvent.click(screen.getByText("Hotel"));
            fakeMidData.forEach((data) => {
                data.type === "regular"
                    ? expect(screen.queryByText(data.full_name)).toBeNull()
                    : expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fireEvent.click(screen.getByText("Regular"));
            fakeMidData.forEach((data) => {
                data.type === "regular"
                    ? expect(screen.getByText(data.full_name)).toBeInTheDocument()
                    : expect(screen.queryByText(data.full_name)).toBeNull();
            });
        });

        it("should have clear button remove all filters except those that specify to persist", () => {
            const nameInput = screen.getByLabelText("Name");
            const clearButton = screen.getByText("Clear");
            const hotelButton = screen.getByText("Hotel");
            fireEvent.click(hotelButton);
            fireEvent.change(nameInput, { target: { value: "Sam" } });
            fakeMidData.forEach((data) => {
                data.full_name === "Sam"
                    ? expect(screen.getByText(data.full_name)).toBeInTheDocument()
                    : expect(screen.queryByText(data.full_name)).toBeNull();
            });
            fireEvent.click(clearButton);
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

        it("should have more filters button toggle additional filters on and off", () => {
            const moreButton = screen.getByText("More");
            expect(screen.queryByText("Regular")).toBeNull();
            fireEvent.click(moreButton);
            expect(screen.getByText("Regular")).toBeInTheDocument();
            expect(screen.getByText("Less")).toBeInTheDocument();
            fireEvent.click(moreButton);
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

        it("should have checkboxes unaffected by filtering", () => {
            for (let index = 0; index < fakeMidData.length; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }
            const checkbox = screen.getByLabelText("Select row 0");
            fireEvent.click(checkbox);
            expect(screen.getByLabelText("Select row 0")).toBeChecked();
            const nameInput = screen.getByLabelText("Name");
            fireEvent.change(nameInput, { target: { value: "Sam" } });
            const clearButton = screen.getByText("Clear");
            fireEvent.click(clearButton);
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

        it("should move to next page to view next set of rows", () => {
            const nextButton = screen.getByLabelText("Next Page");
            fireEvent.click(nextButton);
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

        it("should move to previous page to view previous set of rows", () => {
            const nextButton = screen.getByLabelText("Next Page");
            const previousButton = screen.getByLabelText("Previous Page");
            fireEvent.click(nextButton);
            fireEvent.click(previousButton);
            fakeData.slice(0, 7).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(7).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
        });

        it("should allow change in number of rows per page", () => {
            fireEvent.change(screen.getByLabelText("Rows per page:"), { target: { value: 5 } });
            fakeData.slice(0, 5).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(5).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
            fireEvent.change(screen.getByLabelText("Rows per page:"), { target: { value: 7 } });
            fakeData.slice(0, 7).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(7).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
        });

        it("should move to final page when last page button is clicked and first page when first page button is clicked", () => {
            fireEvent.change(screen.getByLabelText("Rows per page:"), { target: { value: 5 } });
            fireEvent.click(screen.getByLabelText("Last Page"));
            fakeData.slice(fakeData.length - 5).forEach((data) => {
                expect(screen.getByText(data.full_name)).toBeInTheDocument();
            });
            fakeData.slice(0, fakeData.length - 5).forEach((data) => {
                expect(screen.queryByText(data.full_name)).toBeNull();
            });
            fireEvent.click(screen.getByLabelText("First Page"));
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

        it("should have checkboxes unaffected by pagination", () => {
            for (let index = 0; index < 7; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }
            const checkbox = screen.getByLabelText("Select row 0");
            fireEvent.click(checkbox);
            expect(screen.getByLabelText("Select row 0")).toBeChecked();

            const nextButton = screen.getByLabelText("Next Page");
            fireEvent.click(nextButton);
            for (let index = 0; index < 7; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }

            const prevButton = screen.getByLabelText("Previous Page");
            fireEvent.click(prevButton);
            expect(screen.getByLabelText("Select row 0")).toBeChecked();

            for (let index = 1; index < 7; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }
        });

        it("should have checkboxes unaffected by change in rows per page", () => {
            fireEvent.click(screen.getByLabelText("Select row 0"));
            fireEvent.click(screen.getByLabelText("Select row 6"));

            for (let index = 1; index < 6; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }
            expect(screen.getByLabelText("Select row 0")).toBeChecked();
            expect(screen.getByLabelText("Select row 6")).toBeChecked();

            fireEvent.change(screen.getByLabelText("Rows per page:"), { target: { value: 5 } });

            expect(screen.getByLabelText("Select row 0")).toBeChecked();
            for (let index = 1; index < 5; index++) {
                expect(screen.getByLabelText(`Select row ${index}`)).not.toBeChecked();
            }

            fireEvent.change(screen.getByLabelText("Rows per page:"), { target: { value: 7 } });

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

        it("should render with only default shown headers", () => {
            fakeDataHeaders.forEach((header, index) => {
                index < fakeDataHeaders.length - 1
                    ? expect(screen.getByText(header[1])).toBeInTheDocument()
                    : expect(screen.queryByText(header[1])).toBeNull();
            });

            const selectColumnsButton = screen.getByTestId("select-columns-button");
            fireEvent.click(selectColumnsButton);

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

        it("should only have toggleable headers in the select columns dropdown", () => {
            const selectColumnsButton = screen.getByTestId("select-columns-button");
            fireEvent.click(selectColumnsButton);
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
            fireEvent.click(selectColumnsButton);
            expect(screen.queryByTestId("checkbox-group-popup")).toBeTruthy();

            expect(
                within(screen.getByTestId(`option-${last_header[0]}`)).getByRole("checkbox")
            ).not.toBeChecked();

            fireEvent.click(screen.getByTestId(`option-${last_header[0]}`));
            expect(
                within(screen.getByTestId(`option-${last_header[0]}`)).getByRole("checkbox")
            ).toBeChecked();

            await userEvent.keyboard("{Escape}");
            expect(screen.queryByTestId("checkbox-group-popup")).toBeFalsy();

            expect(screen.getByText(last_header[1])).toBeInTheDocument();

            fireEvent.click(selectColumnsButton);
            expect(
                within(screen.getByTestId(`option-${last_header[0]}`)).getByRole("checkbox")
            ).toBeChecked();

            fireEvent.click(screen.getByTestId(`option-${last_header[0]}`));
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

        it("should complete row click action when clicked", () => {
            expect(screen.queryByText(`row clicked ${fakeMidData[0].full_name}`)).toBeNull();
            fireEvent.click(screen.getByText(fakeMidData[0].full_name));
            expect(screen.getByText(`row clicked ${fakeMidData[0].full_name}`)).toBeInTheDocument();
        });

        it("should have every row be clickable", () => {
            fakeMidData.forEach((data) => {
                expect(screen.queryByText(`row clicked ${data.full_name}`)).toBeNull();
                fireEvent.click(screen.getByText(data.full_name));
                expect(screen.getByText(`row clicked ${data.full_name}`)).toBeInTheDocument();
            });
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

        it("should render up and down reorder buttons on every row", () => {
            fakeMidData.forEach((_, index) => {
                expect(screen.getByTestId(`button-move-row-up-${index}`)).toBeInTheDocument();
                expect(screen.getByTestId(`button-move-row-down-${index}`)).toBeInTheDocument();
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

        it("should swap rows when row swap buttons are clicked", async () => {
            expect(screen.queryByText(fakeMidData[0].full_name)).toHaveProperty("id", "cell-2-0");
            expect(screen.queryByText(fakeMidData[1].full_name)).toHaveProperty("id", "cell-2-1");
            await act(async () => {
                fireEvent.click(screen.getByTestId("button-move-row-up-1"));
            });
            expect(screen.queryByText(fakeMidData[0].full_name)).toHaveProperty("id", "cell-2-1");
            expect(screen.queryByText(fakeMidData[1].full_name)).toHaveProperty("id", "cell-2-0");
        });

        it("should swap rows without affecting deletable status", async () => {
            await act(async () => {
                fireEvent.click(screen.getByTestId("button-move-row-up-1"));
            });
            expect(screen.queryByTestId("button-delete-row-1")).toBeNull();
            expect(screen.getByTestId("button-delete-row-0")).toBeInTheDocument();
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
                                isDefaultSortIncluded: false,
                                sortMethod: mockSortMethod,
                            },
                        }}
                    />
                </StyleManager>
            );
        });

        it("should not trigger sort function when sorting a disable sort column", () => {
            fireEvent.click(screen.getByText(fakeDataHeaders[1][1]));
            expect(mockSortMethod).not.toHaveBeenCalled();
        });

        it("should trigger sort function with correct asc or desc argument", () => {
            fireEvent.click(screen.getByText(fakeDataHeaders[0][1]));
            expect(mockSortMethod).toHaveBeenCalledWith("asc");
            fireEvent.click(screen.getByText("Name"));
            expect(mockSortMethod).toHaveBeenCalledWith("desc");
        });
    });

    describe("Table with default sort", () => {
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
                                isDefaultSortIncluded: true,
                                sortMethod: mockSortMethod,
                            },
                        }}
                    />
                </StyleManager>
            );
        });

        it("should show sorted when loads", () => {
            //if it is already sorted by ascending then clicking the header again should sort by descending
            fireEvent.click(screen.getByText(fakeDataHeaders[0][1]));
            expect(mockSortMethod).toHaveBeenCalledWith("desc");
        });
    });
});
