import { PostgrestError } from "@supabase/supabase-js";
import { Tables } from "@/databaseTypesFile";
import { Schema } from "@/databaseUtils";
import { logErrorReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import { CollectionCentresTableRow } from "@/app/admin/collectionCentresTable/CollectionCentreActions";

export interface DietaryRequirementsRawData {
    id: Schema["dietary_requirements"]["id"];
    halal: Schema["dietary_requirements"]["halal"];
    vegetarian: Schema["dietary_requirements"]["vegetarian"];
    vegan: Schema["dietary_requirements"]["vegan"];
    meat: Schema["dietary_requirements"]["meat"];
    glutenFree: Schema["dietary_requirements"]["gluten_free"];
    pescatarian: Schema["dietary_requirements"]["pescatarian"];
    dairyFree: Schema["dietary_requirements"]["dairy_free"];
    seafoodAllergy: Schema["dietary_requirements"]["seafood_allergy"];
    petFood: Schema["dietary_requirements"]["pet_food"];
}

export interface DietaryRequirementsTableRow {
    id: Schema["dietary_requirements"]["id"];
    dietary_requirement: string;
    included: string;
    excluded: string;
    isNew: boolean;
}

type FetchDietaryRequirementsResult =
    | {
          data: DietaryRequirementsTableRow[];
          error: null;
      }
    | {
          data: null;
          error: { type: "failedToFetchDietaryRequirements"; logId: string };
      };

export const fetchDietaryRequirementsForTable =
    async (): Promise<FetchDietaryRequirementsResult> => {
        const { data, error } = await supabase.from("dietary_requirements").select();
        if (error) {
            const logId = await logErrorReturnLogId("Failed to fetch dietary requirements", {
                error,
            });
            return { data: null, error: { type: "failedToFetchDietaryRequirements", logId } };
        }

        const rawData = data.map(
            (row): DietaryRequirementsRawData => ({
                id: row.id,
                halal: row.halal,
                vegetarian: row.vegetarian,
                vegan: row.vegan,
                meat: row.meat,
                glutenFree: row.gluten_free,
                pescatarian: row.pescatarian,
                dairyFree: row.dairy_free,
                seafoodAllergy: row.seafood_allergy,
                petFood: row.pet_food,
            })
        );

        console.log("data" + formattedData);

        return { data: formattedData, error: null };
    };

function getIncludeItems(diet: string, rawData: DietaryRequirementsRawData[]): string {}
