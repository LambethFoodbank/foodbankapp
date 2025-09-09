import { ServerSideFilter, ServerSideFilterMethod } from "@/components/Tables/Filters";
import { SortState } from "@/components/Tables/Table";
import { ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { DbClientRow, Schema } from "@/databaseUtils";

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
    clientId: Schema["clients"]["primary_key"];
    fullName: Schema["clients"]["full_name"];
    familyCategory: string;
    addressPostcode: {
        postcode: Schema["clients"]["address_postcode"];
        isDeliverable: boolean | null;
    };
    phoneNumber: Schema["clients"]["phone_number"];
    email: string | null;
}
