import { PostgrestError } from "@supabase/supabase-js";
import { Tables } from "@/databaseTypesFile";
import { Schema } from "@/databaseUtils";
import { logErrorReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";

export interface DietaryRequirementsRawData {
    id: Schema["dietary_requirements_plus"]["id"];
    name: Schema["dietary_requirements_plus"]["item_name"];
    halal: Schema["dietary_requirements_plus"]["halal"];
    vegetarian: Schema["dietary_requirements_plus"]["vegetarian"];
    vegan: Schema["dietary_requirements_plus"]["vegan"];
    meat: Schema["dietary_requirements_plus"]["meat"];
    glutenFree: Schema["dietary_requirements_plus"]["gluten_free"];
    pescatarian: Schema["dietary_requirements_plus"]["pescatarian"];
    dairyFree: Schema["dietary_requirements_plus"]["dairy_free"];
    seafoodAllergy: Schema["dietary_requirements_plus"]["seafood_allergy"];
    petFood: Schema["dietary_requirements_plus"]["pet_food"];
}

export interface DietaryRequirementsTableRow {
    id: string;
    dietary_requirement: string;
    included: string[];
    excluded: string[];
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
        const { data, error } = await supabase.from("dietary_requirements_plus").select();
        if (error) {
            const logId = await logErrorReturnLogId("Failed to fetch dietary requirements", {
                error,
            });
            return { data: null, error: { type: "failedToFetchDietaryRequirements", logId } };
        }

        const rawData = data.map(
            (row): DietaryRequirementsRawData => ({
                id: row.id,
                name: row.item_name,
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

        const formattedData = getFormattedData(rawData);

        return { data: formattedData, error: null };
    };

function getFormattedData(rawData: DietaryRequirementsRawData[]): DietaryRequirementsTableRow[] {
    if (!rawData || rawData.length === 0) {
        return [];
    }

    const dietaryTypes = [
        { key: "halal", label: "Halal" },
        { key: "vegetarian", label: "Vegetarian" },
        { key: "vegan", label: "Vegan" },
        { key: "meat", label: "Meat" },
        { key: "glutenFree", label: "Gluten Free" },
        { key: "pescatarian", label: "Pescatarian" },
        { key: "dairyFree", label: "Dairy Free" },
        { key: "seafoodAllergy", label: "Seafood Allergy" },
        { key: "petFood", label: "Pet Food" },
    ];

    return dietaryTypes.map((type) => {
        const included = rawData
            .filter((row) => row[type.key as keyof DietaryRequirementsRawData] == "included")
            .map((row) => " " + row.name);
        const excluded = rawData
            .filter((row) => row[type.key as keyof DietaryRequirementsRawData] == "excluded")
            .map((row) => " " + row.name);

        return {
            id: type.key,
            dietary_requirement: type.label,
            included, // array of ids
            excluded, // array of ids
            isNew: false,
        };
    });
}
