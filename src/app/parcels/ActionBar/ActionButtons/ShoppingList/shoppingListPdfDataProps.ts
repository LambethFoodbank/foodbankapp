import { ParcelInfo } from "@/app/parcels/ActionBar/ActionButtons/ShoppingList/getParcelsData";
import { ClientSummary, RequirementSummary } from "@/common/formatClientsData";
import { HouseholdSummary } from "@/common/formatFamiliesData";
import { fetchLists, FetchListsErrorType } from "@/common/fetch";
import { ListType } from "@/common/databaseListTypes";
import supabase from "@/supabaseClient";
import { Schema } from "@/databaseUtils";
import { logErrorReturnLogId } from "@/logger/logger";

export interface ShoppingListItem {
    description: string;
    quantity: string;
    notes: string;
    additionalClientInfo: string;
}

export interface ShoppingListPdfData {
    postcode: string | null;
    parcelInfo: ParcelInfo;
    clientSummary: ClientSummary;
    householdSummary: HouseholdSummary;
    requirementSummary: RequirementSummary;
    itemsList: ShoppingListItem[];
    endNotes: string;
}

type PrepareItemsListResult =
    | {
          data: ShoppingListItem[];
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
    | { data: Pick<ShoppingListItem, "quantity" | "notes">; error: null }
    | { data: null; error: GetQuantityAndNotesError };

type DietaryRulesPlusRow = {
    diet_id: string;
    item_name: string;
    status: "included" | "excluded" | "not_specified";
};

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
        return { includedItems: [], excludedItems: [], error: undefined };
    }

    const { data, error } = await supabase
        .from("dietary_rules_plus")
        .select("item_name, diet_id, status");

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

    return (data ?? [])
        .filter(
            (row): row is DietaryRulesPlusRow =>
                row.item_name !== null && row.diet_id !== null && row.status !== null
        )
        .reduce<ItemIncludedPartition>(
            (acc, row) => {
                const { item_name, diet_id, status } = row;

                if (!dietaryRequirements.includes(diet_id)) {
                    return acc;
                }

                if (status === "excluded") {
                    acc.excludedItems.push(item_name);
                } else if (status === "included") {
                    acc.includedItems.push(item_name);
                }

                return acc;
            },
            { includedItems: [], excludedItems: [], error: undefined }
        );
};

export const prepareItemsListForHousehold = async (
    householdSize: number,
    listType: ListType,
    dietsIds: string[],
    clientPreferredItems: ShoppingListItem[]
): Promise<PrepareItemsListResult> => {
    const { data: listData, error } = await fetchLists(supabase);
    if (error) {
        return { data: null, error: error };
    }
    const itemsList: ShoppingListItem[] = [];

    const itemsByRequirement = dietsIds
        ? await getItemsByDietaryRequirements(dietsIds)
        : { includedItems: [], excludedItems: [] };

    if (itemsByRequirement.error) {
        return { data: null, error: itemsByRequirement.error };
    }

    console.log(clientPreferredItems);

    for (const row of listData) {
        console.log(row.item_name);
        if (!row.is_available) {
            continue;
        }

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
            const isRegularFood = row.item_type === "regular_food";
            const isPreferredItem = clientPreferredItems.find(
                (item) => item.description === row.item_name
            );

            const currentItem = {
                description: row.item_name,
                ...listItemData,
                additionalClientInfo:
                    clientPreferredItems.find((item) => item.description === row.item_name)
                        ?.additionalClientInfo ?? "",
            };

            // Add item if:
            // 1. It's not excluded has type "regular_food"
            // 2. It's explicitly included
            const shouldAddItem = (!isExcluded && isRegularFood) || isIncluded || isPreferredItem;

            if (shouldAddItem) {
                itemsList.push(currentItem);
            }
        }
    }
    return { data: itemsList, error: null };
};
