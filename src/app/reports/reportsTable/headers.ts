import { TableHeaders } from "@/components/Tables/materialTable/tableTypes";
import { ReportsTableRow } from "@/app/reports/reportsTable/types";

const clientsHeaders: TableHeaders<ReportsTableRow> = [
    ["weekCommencing", "Week Commencing"],
    ["familySize1", "Single"],
    ["familySize2", "Family of 2"],
    ["familySize3", "Family of 3"],
    ["familySize4", "Family of 4"],
    ["familySize5", "Family of 5"],
    ["familySize6", "Family of 6"],
    ["familySize7", "Family of 7"],
    ["familySize8", "Family of 8"],
    ["familySize9", "Family of 9"],
    ["familySize10Plus", "Family of 10+"],
    ["total", "Total"],
    ["cat", "Cat Only"],
    ["dog", "Dog Only"],
    ["catAndDog", "Cat and Dog"],
    ["totalWithPets", "Pets Total"],
];

export default clientsHeaders;
