import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import { ServerSideFilter, ServerSideFilterMethod } from "@/components/Tables/Filters";
import { SortState } from "@/components/Tables/Table";
import { ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { DbEmergencyBagRow, EmergencyBagStatus, Schema } from "@/databaseUtils";

export interface EmergencyBagsTableRow {
    emergencyBagId: Schema["emergency_bags"]["id"];
    type: string;
    amount: number;
    deliveryCollection: {
        collectionCentreName: string;
        collectionCentreAcronym: string;
    };
    lastStatus: {
        name: string;
        timestamp: Date;
        eventData: string | null;
        workflowOrder: number;
    } | null;
    allStatuses: string[] | null;
    packingDate: Date | null;
    createdAt: Date | null;
}

export type GetEmergencyBagDataAndIdsResult =
    | {
          data: {
              emergencyBagTableRows: EmergencyBagsTableRow[];
              allEmergencyBagIds: string[];
          };
          error: null;
      }
    | {
          data: null;
          error: {
              type: GetEmergencyBagDataAndCountErrorType;
              logId: string;
          };
      };

export type GetEmergencyBagDataAndCountErrorType =
    | "unknownError"
    | "failedToFetchEmergencyBags"
    | "abortedFetch";

export interface CollectionCentresOptions {
    key: string;
    value: string;
}

export interface StatusResponseRow {
    event_name: string;
}

export type EmergencyBagStatusesError = "failedToFetchStatuses";
export type EmergencyBagStatusesReturnType =
    | {
          data: EmergencyBagStatus[];
          error: null;
      }
    | {
          data: null;
          error: { type: EmergencyBagStatusesError; logId: string };
      };

export type EmergencyBagsFilterMethod<State> = ServerSideFilterMethod<DbEmergencyBagRow, State>;
export type EmergencyBagsFilter<State> = ServerSideFilter<
    EmergencyBagsTableRow,
    State,
    DbEmergencyBagRow
>;
export type EmergencyBagsFiltersAllStates =
    | EmergencyBagsFilter<string>
    | EmergencyBagsFilter<string[]>
    | EmergencyBagsFilter<DateRangeState>;
export type EmergencyBagsFilters = EmergencyBagsFiltersAllStates[];
export type EmergencyBagsSortMethod = ServerSideSortMethod<DbEmergencyBagRow>;
export type EmergencyBagsSortState = SortState<EmergencyBagsTableRow, EmergencyBagsSortMethod>;

export type GetDbEmergencyBagDataResult =
    | {
          emergencyBags: DbEmergencyBagRow[];
          error: null;
      }
    | {
          emergencyBags: null;
          error: {
              type: GetDbEmergencyBagDataErrorType;
              logId: string;
          };
      };

export type GetDbEmergencyBagDataErrorType = "abortedFetch" | "failedToFetchEmergencyBagTable";
