import { SortState } from "@/components/Tables/materialTable/tableTypes";
import { ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { DbReportRow } from "@/databaseUtils";

export type ReportsSortMethod = ServerSideSortMethod<DbReportRow>;
export type ReportsSortState = SortState<ReportsTableRow, ReportsSortMethod>;

export type GetReportsDataAndCountErrorType =
    | "abortedFetchingReportsTable"
    | "abortedFetchingReportsTableCount"
    | "failedToFetchReportsTable"
    | "failedToFetchReportsTableCount";

export type GetReportsReturnType =
    | {
          data: {
              reportsData: ReportsTableRow[];
              count: number;
          };
          error: null;
      }
    | {
          data: null;
          error: { type: GetReportsDataAndCountErrorType; logId: string };
      };

export type GetReportsCountReturnType =
    | {
          data: number;
          error: null;
      }
    | {
          data: null;
          error: { type: GetReportsDataAndCountErrorType; logId: string };
      };

export interface ReportsTableRow {
    weekCommencing: string;
    familySize1: number;
    familySize2: number;
    familySize3: number;
    familySize4: number;
    familySize5: number;
    familySize6: number;
    familySize7: number;
    familySize8: number;
    familySize9: number;
    familySize10Plus: number;
    total: number;
    cat: number;
    dog: number;
    catAndDog: number;
    totalWithPets: number;
}
