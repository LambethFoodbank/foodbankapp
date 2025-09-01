import { SortOptions } from "@/components/Tables/materialTable/tableTypes";
import { ReportsSortMethod, ReportsTableRow } from "@/app/reports/reportsTable/types";

const reportsSortableColumns: SortOptions<ReportsTableRow, ReportsSortMethod>[] = [
    {
        key: "weekCommencing",
        sortMethod: (sortDirection, query) =>
            query.order("week_commencing", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familySize1",
        sortMethod: (sortDirection, query) =>
            query.order("family_size_1", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familySize2",
        sortMethod: (sortDirection, query) =>
            query.order("family_size_2", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familySize3",
        sortMethod: (sortDirection, query) =>
            query.order("family_size_3", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familySize4",
        sortMethod: (sortDirection, query) =>
            query.order("family_size_4", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familySize5",
        sortMethod: (sortDirection, query) =>
            query.order("family_size_5", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familySize6",
        sortMethod: (sortDirection, query) =>
            query.order("family_size_6", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familySize7",
        sortMethod: (sortDirection, query) =>
            query.order("family_size_7", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familySize8",
        sortMethod: (sortDirection, query) =>
            query.order("family_size_8", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familySize9",
        sortMethod: (sortDirection, query) =>
            query.order("family_size_9", { ascending: sortDirection === "asc" }),
    },
    {
        key: "familySize10Plus",
        sortMethod: (sortDirection, query) =>
            query.order("family_size_10_plus", { ascending: sortDirection === "asc" }),
    },
    {
        key: "total",
        sortMethod: (sortDirection, query) =>
            query.order("total_parcels", { ascending: sortDirection === "asc" }),
    },
    {
        key: "cat",
        sortMethod: (sortDirection, query) =>
            query.order("cat", { ascending: sortDirection === "asc" }),
    },
    {
        key: "dog",
        sortMethod: (sortDirection, query) =>
            query.order("dog", { ascending: sortDirection === "asc" }),
    },
    {
        key: "catAndDog",
        sortMethod: (sortDirection, query) =>
            query.order("cat_and_dog", { ascending: sortDirection === "asc" }),
    },
    {
        key: "totalWithPets",
        sortMethod: (sortDirection, query) =>
            query.order("total_with_pets", { ascending: sortDirection === "asc" }),
    },
];

export default reportsSortableColumns;
