import { Schema } from "@/databaseUtils";
import supabase from "@/supabaseClient";
import {
    FetchClientErrorType,
    FetchFamilyErrorType,
    FetchListsCommentError,
    FetchListsCommentErrorType,
    FetchListsError,
    FetchListsErrorType,
    FetchParcelError,
    FetchParcelErrorType,
    fetchClient,
    fetchListsComment,
    fetchFamily,
} from "@/common/fetch";
import { prepareClientSummary, prepareRequirementSummary } from "@/common/formatClientsData";
import { prepareHouseholdSummary } from "@/common/formatFamiliesData";
import { prepareParcelInfo } from "@/app/parcels/ActionBar/ActionButtons/ShoppingList/getParcelsData";
import {
    GetQuantityAndNotesError,
    GetQuantityAndNotesErrorType,
    prepareItemsListForHousehold,
    ShoppingListPdfData,
} from "@/app/parcels/ActionBar/ActionButtons/ShoppingList/shoppingListPdfDataProps";
import { logErrorReturnLogId } from "@/logger/logger";

interface ClientDataAndFamilyData {
    clientData: Schema["clients"];
    familyData: Schema["families"][];
}

type FetchShoppingListResponse =
    | {
          data: ClientDataAndFamilyData;
          error: null;
      }
    | {
          data: null;
          error: FetchShoppingListError;
      };

type FetchShoppingListErrorType = FetchClientErrorType | FetchFamilyErrorType;

interface FetchShoppingListError {
    type: FetchShoppingListErrorType;
    logId: string;
}

const getClientAndFamilyData = async (clientID: string): Promise<FetchShoppingListResponse> => {
    const { data: clientData, error: clientError } = await fetchClient(clientID, supabase);
    if (clientError) {
        return { data: null, error: clientError };
    }

    const { data: familyData, error: familyError } = await fetchFamily(
        clientData.family_id,
        supabase
    );
    if (familyError) {
        return { data: null, error: familyError };
    }

    return { data: { clientData: clientData, familyData: familyData }, error: null };
};

type FetchShoppingListForPdfResponse =
    | {
          data: ShoppingListPdfData;
          error: null;
      }
    | {
          data: null;
          error: ShoppingListPdfError;
      };

export type ShoppingListPdfError =
    | FetchShoppingListError
    | FetchListsError
    | FetchListsCommentError
    | FetchParcelError
    | GetQuantityAndNotesError
    | InactiveClientError;

export type ShoppingListPdfErrorType =
    | FetchShoppingListErrorType
    | FetchListsErrorType
    | FetchListsCommentErrorType
    | FetchParcelErrorType
    | GetQuantityAndNotesErrorType
    | InactiveClientErrorType;

export type InactiveClientErrorType = "inactiveClient";
export type InactiveClientError = { type: InactiveClientErrorType; logId: string };

const getShoppingListDataForSingleParcel = async (
    parcelId: string
): Promise<FetchShoppingListForPdfResponse> => {
    const { data: parcelInfoAndClientIdData, error: parcelInfoAndClientIdError } =
        await prepareParcelInfo(parcelId);
    if (parcelInfoAndClientIdError) {
        return { data: null, error: parcelInfoAndClientIdError };
    }

    const { data: clientAndFamilyData, error: clientAndFamilyError } = await getClientAndFamilyData(
        parcelInfoAndClientIdData.clientId
    );

    if (clientAndFamilyError) {
        return { data: null, error: clientAndFamilyError };
    }

    const familyData = clientAndFamilyData.familyData;
    const clientData = clientAndFamilyData.clientData;

    if (!clientData.is_active) {
        const logId = await logErrorReturnLogId("Generating shopping list pdf for inactive client");
        return { data: null, error: { type: "inactiveClient", logId: logId } };
    }

    const { data: itemsListData, error: itemsListError } = await prepareItemsListForHousehold(
        familyData.length,
        parcelInfoAndClientIdData.parcelInfo.listType
    );
    if (itemsListError) {
        return { data: null, error: itemsListError };
    }

    const clientSummary = prepareClientSummary(clientData);
    const householdSummary = prepareHouseholdSummary(familyData);
    const requirementSummary = prepareRequirementSummary(clientData);

    const { data: endNotes, error: listsCommentError } = await fetchListsComment(supabase);
    if (listsCommentError) {
        return { data: null, error: listsCommentError };
    }

    const data = {
        postcode: clientData.address_postcode,
        parcelInfo: parcelInfoAndClientIdData.parcelInfo,
        clientSummary: clientSummary,
        householdSummary: householdSummary,
        requirementSummary: requirementSummary,
        itemsList: itemsListData,
        endNotes: endNotes,
    };
    return { data: data, error: null };
};

type ShoppingListPdfListResponse =
    | {
          data: ShoppingListPdfData[];
          error: null;
      }
    | {
          data: null;
          error: ShoppingListPdfError;
      };

const getShoppingListData = async (parcelIds: string[]): Promise<ShoppingListPdfListResponse> => {
    const lists = await Promise.all(
        parcelIds.map(async (parcelId: string) => {
            return await getShoppingListDataForSingleParcel(parcelId);
        })
    );
    if (lists.some((list) => list.error)) {
        return {
            data: null,
            error: lists.filter((list) => list.error)[0].error as ShoppingListPdfError,
        };
    }
    return {
        data: lists
            .filter(
                (list): list is { data: ShoppingListPdfData; error: null } => list.data !== null
            )
            .map((list) => list.data),
        error: null,
    };
};

export default getShoppingListData;
