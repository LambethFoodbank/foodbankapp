import { ParcelInfo } from "@/app/parcels/ActionBar/ActionButtons/ShoppingList/getParcelsData";
import { ClientSummary, RequirementSummary } from "@/common/formatClientsData";
import { HouseholdSummary } from "@/common/formatFamiliesData";
import { fetchLists, FetchListsErrorType } from "@/common/fetch";
import { ListType } from "@/common/databaseListTypes";
import supabase from "@/supabaseClient";
import { Schema } from "@/databaseUtils";
import { logErrorReturnLogId } from "@/logger/logger";
import { Tables } from "@/databaseTypesFile";

export interface Item {
    description: string;
    quantity: string;
    notes: string;
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
          data: Item[];
          error: null;
      }
    | {
          data: null;
          error: { type: FetchListsErrorType | GetQuantityAndNotesErrorType; logId: string };
      };

type ItemsByRequirement = {
    includedItems: string[];
    excludedItems: string[];
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

const getItemsByDietaryRequirements = async (
    dietaryRequirements: string[] | null
): Promise<ItemsByRequirement> => {
    const includedItems: Set<string> = new Set();
    const excludedItems: Set<string> = new Set();

    if (!dietaryRequirements) {
        return { includedItems: [], excludedItems: [] };
    }

    const listData = await supabase.from("dietary_requirements_plus").select();

    for (const row of listData.data ?? []) {
        for (const requirement of dietaryRequirements) {
            console.log(requirement);
            const value = row[requirement as keyof Tables<"dietary_requirements_plus">];
            if (value === "excluded" && row.item_name) {
                excludedItems.add(row.item_name);
            }
            if (value === "included" && row.item_name) {
                includedItems.add(row.item_name);
            }
        }
    }

    return {
        includedItems: Array.from(includedItems),
        excludedItems: Array.from(excludedItems),
    };
};

function toSnakeCase(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/[\s-]+/g, "_")
        .toLowerCase();
}

export const prepareItemsListForHousehold = async (
    householdSize: number,
    listType: ListType,
    dietaryRequirements: string[] | null
): Promise<PrepareItemsListResult> => {
    const { data: listData, error } = await fetchLists(supabase);
    if (error) {
        return { data: null, error: error };
    }
    const itemsList: Item[] = [];

    const mappedDietaryRequirements = dietaryRequirements
        ? dietaryRequirements.map((dietary) => toSnakeCase(dietary))
        : null;

    const itemsByRequirement = await getItemsByDietaryRequirements(mappedDietaryRequirements);

    const itemsIncludedPetFood = await getItemsByDietaryRequirements(["pet_food"]);

    for (const row of listData) {
        if (row.list_type !== listType) {
            continue;
        }
        const { data: listItemData, error: listItemError } = await getQuantityAndNotes(
            row,
            householdSize
        );
        if (listItemError) {
            return { data: null, error: listItemError };
        }

        if (!["", "0"].includes(listItemData.quantity.trim())) {
            const isIncluded = itemsByRequirement.includedItems.includes(row.item_name);
            const isExcluded = itemsByRequirement.excludedItems.includes(row.item_name);

            const currentItem = { description: row.item_name, ...listItemData };

            if (!isExcluded) {
                if (!itemsIncludedPetFood.includedItems.includes(row.item_name)) {
                    itemsList.push(currentItem);
                }
            }

            if (isIncluded) {
                if (!itemsList.includes(currentItem)) {
                    itemsList.push(currentItem);
                }
            }
        }
    }
    return { data: itemsList, error: null };
};
