import { logErrorReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";

export interface DietaryRequirementsRawData {
    id: string | null;
    name: string | null;
    halal: string | null;
    vegetarian: string | null;
    vegan: string | null;
    meat: string | null;
    glutenFree: string | null;
    pescatarian: string | null;
    dairyFree: string | null;
    seafoodAllergy: string | null;
    petFood: string | null;
}

export const dietaryRequirementTypes = [
    { key: "halal", label: "Halal" },
    { key: "vegetarian", label: "Vegetarian" },
    { key: "vegan", label: "Vegan" },
    { key: "meat", label: "Meat" },
    { key: "gluten_free", label: "Gluten Free" },
    { key: "pescatarian", label: "Pescatarian" },
    { key: "dairy_free", label: "Dairy Free" },
    { key: "seafood_allergy", label: "Seafood Allergy" },
    { key: "pet_food", label: "Pet Food" },
];

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
            included,
            excluded,
            isNew: false,
        };
    });
}
