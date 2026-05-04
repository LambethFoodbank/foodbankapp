import { ParcelInfo } from "@/app/parcels/ActionBar/ActionButtons/ShoppingList/getParcelsData";
import { toSnakeCase } from "@/common/format";
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
          error: {
              type:
                  | FetchListsErrorType
                  | FetchDietaryRequirementsErrorType
                  | GetQuantityAndNotesErrorType;
              logId: string;
          };
      };

type ItemIncludedPartition = {
    includedItems: string[];
    excludedItems: string[];
    error?: {
        type:
            | FetchListsErrorType
            | FetchDietaryRequirementsErrorType
            | GetQuantityAndNotesErrorType;
        logId: string;
    };
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

export type FetchDietaryRequirementsErrorType = "failedToFetchDietaryRequirements";
export type FetchDietaryRequirementsError = {
    type: FetchDietaryRequirementsErrorType;
    logId: string;
};
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
    dietaryRequirements?: string[]
): Promise<ItemIncludedPartition> => {
    if (!dietaryRequirements || !dietaryRequirements.length) {
        return { includedItems: [], excludedItems: [] };
    }

    const { data, error } = await supabase.from("dietary_requirements_plus").select();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to fetch dietary requirements", {
            error,
            dietaryRequirements,
        });
        return {
            includedItems: [],
            excludedItems: [],
            error: { type: "failedToFetchDietaryRequirements", logId },
        };
    }

    return (data ?? []).reduce<ItemIncludedPartition>(
        (acc, row) => {
            if (!row.item_name) {
                return acc;
            }

            dietaryRequirements.forEach((requirement) => {
                const value = row[requirement as keyof Tables<"dietary_requirements_plus">];
                if (row.item_name) {
                    if (value === "excluded") {
                        acc.excludedItems.push(row.item_name);
                    } else if (value === "included") {
                        acc.includedItems.push(row.item_name);
                    }
                }
            });
            return acc;
        },
        { includedItems: [], excludedItems: [] }
    );
};

export const prepareItemsListForHousehold = async (
    householdSize: number,
    listType: ListType,
    dietaryRequirements: string[]
): Promise<PrepareItemsListResult> => {
    const { data: listData, error } = await fetchLists(supabase);
    if (error) {
        return { data: null, error: error };
    }
    const itemsList: Item[] = [];

    const mappedDietaryRequirements = dietaryRequirements.length
        ? dietaryRequirements.map((dietary) => toSnakeCase(dietary))
        : null;

    const itemsByRequirement = mappedDietaryRequirements
        ? await getItemsByDietaryRequirements(mappedDietaryRequirements)
        : { includedItems: [], excludedItems: [] };

    if (itemsByRequirement.error) {
        return { data: null, error: itemsByRequirement.error };
    }

    const itemsIncludedPetFood = await getItemsByDietaryRequirements(["pet_food"]);
    if (itemsIncludedPetFood.error) {
        return { data: null, error: itemsIncludedPetFood.error };
    }

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
            const isPetFood = itemsIncludedPetFood.includedItems.includes(row.item_name);

            const currentItem = { description: row.item_name, ...listItemData };

            // Add item if:
            // 1. It's not excluded AND not pet food, OR
            // 2. It's explicitly included by dietary requirements
            //
            // in the future, we will change the logic to include only regular_food items by default
            const shouldAddItem = (!isExcluded && !isPetFood) || isIncluded;

            if (shouldAddItem) {
                itemsList.push(currentItem);
            }
        }
    }
    return { data: itemsList, error: null };
};
