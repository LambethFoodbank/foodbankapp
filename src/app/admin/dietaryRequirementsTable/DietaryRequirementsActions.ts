import { logErrorReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";

export type DietTableRow = {
    id: string;
    dietary_requirement: string;
    included: string[];
    excluded: string[];
};

type FetchDietaryRequirementsResult =
    | {
          data: DietTableRow[];
          error: null;
      }
    | {
          data: null;
          error: { type: "failedToFetchDietaryRequirements"; logId: string };
      };

export const fetchDietaryRequirementsForTable =
    async (): Promise<FetchDietaryRequirementsResult> => {
        const { data: diets, error: dietsError } = await supabase
            .from("diets")
            .select("primary_key, name");

        if (dietsError) {
            const logId = await logErrorReturnLogId("Failed to fetch diets", { error: dietsError });
            return { data: null, error: { type: "failedToFetchDietaryRequirements", logId } };
        }

        const { data: rules, error: rulesError } = await supabase
            .from("dietary_rules_plus")
            .select();

        if (rulesError) {
            const logId = await logErrorReturnLogId("Failed to fetch dietary rules", {
                error: rulesError,
            });
            return { data: null, error: { type: "failedToFetchDietaryRequirements", logId } };
        }

        const rows: DietTableRow[] = (diets ?? []).map((diet) => {
            const rulesForDiet = (rules ?? []).filter((rule) => rule.diet_id === diet.primary_key);

            const included = rulesForDiet
                .filter((rule) => rule.status === "included")
                .map((rule) => rule.item_name ?? "Unnamed Item");

            const excluded = rulesForDiet
                .filter((rule) => rule.status === "excluded")
                .map((rule) => rule.item_name ?? "Unnamed Item");

            return {
                id: diet.primary_key,
                dietary_requirement: diet.name,
                included,
                excluded,
            };
        });

        return { data: rows, error: null };
    };
