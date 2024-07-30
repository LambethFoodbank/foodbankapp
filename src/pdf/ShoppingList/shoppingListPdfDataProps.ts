import { ParcelInfo } from "@/pdf/ShoppingList/getParcelsData";
import { ClientSummary, RequirementSummary } from "@/common/formatClientsData";
import { HouseholdSummary } from "@/common/formatFamiliesData";
import { fetchLists, FetchListsErrorType } from "@/common/fetch";
import supabase from "@/supabaseClient";
import { Schema } from "@/databaseUtils";
import { logErrorReturnLogId } from "@/logger/logger";
import { ListName } from "@/app/lists/ListDataview";

export interface Item {
    description: string;
    quantity: string;
    notes: string;
}

export interface ItemExtendedWithListType {
    itemOutputContent: Item;
    listType: ListName;
}

export interface ShoppingListPdfData {
    postcode: string | null;
    parcelInfo: ParcelInfo;
    clientSummary: ClientSummary;
    householdSummary: HouseholdSummary;
    requirementSummary: RequirementSummary;
    itemsList: Item[];
    endNotes: string;
}

type PrepareItemsListResult =
    | {
          data: ItemExtendedWithListType[];
          error: null;
      }
    | {
          data: null;
          error: { type: FetchListsErrorType | GetQuantityAndNotesErrorType; logId: string };
      };

const allowedFamilySizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
type FamilySize = (typeof allowedFamilySizes)[number];

function numberIsValidFamilySize(value: number): value is FamilySize {
    for (const allowedFamilySize of allowedFamilySizes) {
        if (allowedFamilySize === value) {
            return true;
        }
    }
    return false;
}

export type GetQuantityAndNotesErrorType = "invalidFamilySize";
export type GetQuantityAndNotesError = { type: GetQuantityAndNotesErrorType; logId: string };
type GetQuantityAndNotesResult =
    | { data: Pick<Item, "quantity" | "notes">; error: null }
    | { data: null; error: GetQuantityAndNotesError };

const getQuantityAndNotes = async (
    row: Schema["lists"],
    size: number
): Promise<GetQuantityAndNotesResult> => {
    if (size >= 10) {
        size = 10;
    }

    if (!numberIsValidFamilySize(size)) {
        const logId = await logErrorReturnLogId("Invalid family size for shopping list pdf");
        return { data: null, error: { type: "invalidFamilySize", logId } };
    }
    const sizeQuantity: keyof Schema["lists"] = `quantity_for_${size}`;
    const sizeNotes: keyof Schema["lists"] = `notes_for_${size}`;
    return {
        data: {
            quantity: row[sizeQuantity] ?? "",
            notes: row[sizeNotes] ?? "",
        },
        error: null,
    };
};

export const prepareItemsListForHousehold = async (
    householdSize: number
): Promise<PrepareItemsListResult> => {
    const { data: listData, error } = await fetchLists(supabase);
    if (error) {
        return { data: null, error: error };
    }
    const itemsList: ItemExtendedWithListType[] = [];
    for (const row of listData) {
        const { data: listItemData, error: listItemError } = await getQuantityAndNotes(
            row,
            householdSize
        );
        if (listItemError) {
            return { data: null, error: listItemError };
        }
        itemsList.push({
            itemOutputContent: { description: row.item_name, ...listItemData },
            listType: row.list_type,
        });
    }
    return { data: itemsList, error: null };
};

export const filterItemsbyListType = (
    itemsList: ItemExtendedWithListType[],
    listType: ListName
): Item[] => {
    const filteredItems: Item[] = [];
    for (const item of itemsList) {
        listType === item.listType && filteredItems.push(item.itemOutputContent);
    }
    return filteredItems;
};
