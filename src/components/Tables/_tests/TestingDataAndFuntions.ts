import { LIST_TYPES_ARRAY } from "@/common/fetch";
import { buttonGroupFilter, filterRowbyButton } from "../ButtonFilter";
import { buildClientSideTextFilter, filterRowByText } from "../TextFilter";
import { TableHeaders } from "../Table";
import { ClientSideFilter } from "../Filters";
import { SortOrder } from "react-data-table-component/dist/DataTable/types";

export interface MockTableProps<Data> {
    mockData: Data[];
    mockHeaders: TableHeaders<Data>;
    testableContent: TestableContent;
}

interface TestableContent {
    isCheckboxIncluded?: boolean;
    filters?: {
        primaryFilters: ClientSideFilter<TestData, string>[];
        additionalFilters: ClientSideFilter<TestData, string>[];
    };
    isPaginationIncluded?: boolean;
    sortingFlags?: {
        isSortingOptionsIncluded: boolean;
        isDefaultSortIncluded: boolean;
        sortMethod: (sortOrder: SortOrder) => void;
    };
    isRowEditableIncluded?: boolean;
    isHeaderTogglesIncluded?: boolean;
    isColumnDisplayFunctionsIncluded?: boolean;
    isRowClickIncluded?: boolean;
}

export interface TestData {
    full_name: string;
    phone_number: string;
    type: "hotel" | "regular";
    id: string;
}

export const fakeData: TestData[] = [
    {
        full_name: "Tom",
        phone_number: "123456",
        type: "regular",
        id: "0",
    },
    {
        full_name: "Sam",
        phone_number: "999",
        type: "hotel",
        id: "1",
    },
    {
        full_name: "Harper",
        phone_number: "2171786554",
        type: "regular",
        id: "2",
    },
    {
        full_name: "Adrian",
        phone_number: "3650099130",
        type: "hotel",
        id: "3",
    },
    {
        full_name: "Harrell Wallace",
        phone_number: "4650047935",
        type: "regular",
        id: "4",
    },
    {
        full_name: "Oneill Curtis",
        phone_number: "7058491995",
        type: "regular",
        id: "5",
    },
    {
        full_name: "Herring Rutledge",
        phone_number: "1440882899",
        type: "regular",
        id: "6",
    },
    {
        full_name: "Eloise Rowland",
        phone_number: "2580325390",
        type: "regular",
        id: "7",
    },
    {
        full_name: "Cathryn Burks",
        phone_number: "7136166489",
        type: "regular",
        id: "8",
    },
    {
        full_name: "Paopao",
        phone_number: "7136166469",
        type: "regular",
        id: "9",
    },
    {
        full_name: "Forbes Doyle",
        phone_number: "1377097191",
        type: "regular",
        id: "10",
    },
    {
        full_name: "Agnes Rosales",
        phone_number: "3334796379",
        type: "regular",
        id: "11",
    },
    {
        full_name: "Jan Orr",
        phone_number: "1526538148",
        type: "regular",
        id: "12",
    },
    {
        full_name: "Colleen Lowery",
        phone_number: "3980156139",
        type: "regular",
        id: "13",
    },
    {
        full_name: "Chloe",
        phone_number: "4567894522",
        type: "regular",
        id: "14",
    },
];

export const fakeSmallerData = fakeData.slice(0, 3);

export const fakeMidData = fakeData.slice(0, 7);

export const fakeDataHeaders = [
    ["full_name", "Name"],
    ["phone_number", "Phone Number"],
    ["type", "Type"],
] as const;

export const selectorForRowCheckboxWithAriaLabel = (ariaLabel: string): string => {
    return "span[aria-label='" + ariaLabel + "'] > input[type='checkbox']";
};

export const fullNameTextFilterTest = buildClientSideTextFilter<TestData>({
    key: "full_name",
    headers: fakeDataHeaders,
    label: "Name",
    method: filterRowByText,
});

export const typeButtonFilterTest = buttonGroupFilter<TestData>({
    key: "type",
    filterLabel: "",
    filterOptions: LIST_TYPES_ARRAY,
    initialActiveFilter: "regular",
    method: filterRowbyButton,
    shouldPersistOnClear: true,
});
