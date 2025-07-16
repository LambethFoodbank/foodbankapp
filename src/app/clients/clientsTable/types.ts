import { ServerSideFilter, ServerSideFilterMethod } from "@/components/Tables/Filters";
import { SortState } from "@/components/Tables/Table";
import { ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { DbClientRow } from "@/databaseUtils";

export type ClientsFilterMethod = ServerSideFilterMethod<DbClientRow, string>;
export type ClientsFilter = ServerSideFilter<ClientsTableRow, string, DbClientRow>;
export type ClientsSortMethod = ServerSideSortMethod<DbClientRow>;
export type ClientsSortState = SortState<ClientsTableRow, ClientsSortMethod>;

export type GetClientsDataAndCountErrorType =
    | "abortedFetchingClientsTable"
    | "abortedFetchingClientsTableCount"
    | "failedToFetchClientsTable"
    | "failedToFetchClientsTableCount";

export type GetClientsReturnType =
    | {
          data: {
              clientData: ClientsTableRow[];
              count: number;
          };
          error: null;
      }
    | {
          data: null;
          error: { type: GetClientsDataAndCountErrorType; logId: string };
      };

export type GetClientsCountReturnType =
    | {
          data: number;
          error: null;
      }
    | {
          data: null;
          error: { type: GetClientsDataAndCountErrorType; logId: string };
      };

export interface ClientsTableRow {
    clientId: string;
    fullName: string;
    familyCategory: string;
    addressPostcode: string | null;
    phoneNumber: string | null;
}
