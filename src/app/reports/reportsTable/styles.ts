const defaultColumnStyleOptions = { minWidth: "1rem", maxWidth: "5rem" };

const columnKeys = [
    "weekCommencing",
    "familySize1",
    "familySize2",
    "familySize3",
    "familySize4",
    "familySize5",
    "familySize6",
    "familySize7",
    "familySize8",
    "familySize9",
    "familySize10Plus",
    "total",
    "cat",
    "dog",
    "catAndDog",
    "totalWithPets",
] as const;

export const reportsTableColumnStyleOptions = Object.fromEntries(
    columnKeys.map((key) => [key, defaultColumnStyleOptions])
);
