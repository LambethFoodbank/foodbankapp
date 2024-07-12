import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import { ServerSideFilter, ServerSideFilterMethod } from "@/components/Tables/Filters";
import { SortState } from "@/components/Tables/Table";
import { ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { DbParcelRow, ParcelStatus, Schema } from "@/databaseUtils";

export interface ParcelsTableRow {
    parcelId: Schema["parcels"]["primary_key"];
    clientId: Schema["clients"]["primary_key"];
    fullName: Schema["clients"]["full_name"];
    familyCategory: string;
    addressPostcode: Schema["clients"]["address_postcode"];
    phoneNumber: Schema["clients"]["phone_number"];
    deliveryCollection: {
        collectionCentreName: string;
        collectionCentreAcronym: string;
        congestionChargeApplies: boolean;
    };
    packingSlot: string | null;
    collectionDatetime: Date | null;
    lastStatus: {
        name: string;
        timestamp: Date;
        eventData: string | null;
        workflowOrder: number;
    } | null;
    voucherNumber: string | null;
    iconsColumn: {
        flaggedForAttention: boolean;
        requiresFollowUpPhoneCall: boolean;
    };
    packingDate: Date | null;
    createdAt: Date | null;
    clientIsActive: boolean;
}

export type GetParcelDataAndCountResult =
    | {
          data: {
              parcelTableRows: ParcelsTableRow[];
              count: number;
          };
          error: null;
      }
    | {
          data: null;
          error: {
              type: GetParcelDataAndCountErrorType;
              logId: string;
          };
      };

export type GetParcelDataAndCountErrorType =
    | "unknownError"
    | "failedToFetchParcels"
    | "abortedFetch"
    | "failedToRetrieveCongestionChargeDetails";

export interface CollectionCentresOptions {
    key: string;
    value: string;
}
export interface StatusResponseRow {
    event_name: string;
}

export type ParcelStatusesError = "failedToFetchStatuses";
export type ParcelStatusesReturnType =
    | {
          data: ParcelStatus[];
          error: null;
      }
    | {
          data: null;
          error: { type: ParcelStatusesError; logId: string };
      };

export type ParcelsFilterMethod<State> = ServerSideFilterMethod<DbParcelRow, State>;
export type ParcelsFilter<State> = ServerSideFilter<ParcelsTableRow, State, DbParcelRow>;
export type ParcelsFiltersAllStates =
    | ParcelsFilter<string>
    | ParcelsFilter<string[]>
    | ParcelsFilter<DateRangeState>;
export type ParcelsFilters = ParcelsFiltersAllStates[];
export type ParcelsSortMethod = ServerSideSortMethod<DbParcelRow>;
export type ParcelsSortState = SortState<ParcelsTableRow, ParcelsSortMethod>;

export type CongestionChargeDetails = {
    postcode: string;
    congestionCharge: boolean;
};

export type GetDbParcelDataResult =
    | {
          parcels: DbParcelRow[];
          error: null;
      }
    | {
          parcels: null;
          error: {
              type: GetDbParcelDataErrorType;
              logId: string;
          };
      };

export type GetDbParcelDataErrorType = "abortedFetch" | "failedToFetchParcelTable";

export interface packingSlotOptionsSet {
    key: string;
    value: string;
}

type FetchClientIdAndIsActiveErrorType = "failedClientIdAndIsActiveFetch" | "noMatchingClient";
export interface FetchClientIdAndIsActiveError {
    type: FetchClientIdAndIsActiveErrorType;
    logId: string;
}

export type FetchClientIdResult =
    | {
          data: SelectedClientDetails;
          error: null;
      }
    | {
          data: null;
          error: FetchClientIdAndIsActiveError;
      };

export interface SelectedClientDetails {
    clientId: string;
    isClientActive: boolean;
}

export type ParcelPostcodeResult =
    | {
          postcodes: (string | null)[];
          error: null;
      }
    | {
          postcodes: null;
          error: {
              type: GetDbParcelDataErrorType;
              logId: string;
          };
      };
