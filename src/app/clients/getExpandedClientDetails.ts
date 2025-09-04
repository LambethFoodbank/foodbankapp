import { Schema } from "@/databaseUtils";
import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { logErrorReturnLogId } from "@/logger/logger";
import { formatAddress } from "@/common/format";
import {
    getAdultAgeStringUsingBirthYear,
    getChildAgeStringUsingBirthYearAndMonth,
    isAdultFamilyMember,
    isChildFamilyMember,
} from "@/common/getAgesOfFamily";
import { ListType } from "@/common/databaseListTypes";
import { getGenderStringFromGenderField } from "@/common/getGendersOfFamily";
import { dietaryRequirementOptions } from "./form/formSections/DietaryRequirementCard";
import { sortArrayByCanonicalOrder } from "@/components/Form/formFunctions";
import { petFoodOptions } from "./form/formSections/PetFoodCard";
import { cookingFacilitiesOptions } from "./form/formSections/CookingFacilitiesCard";
import { signpostingCallOptions } from "./form/formSections/SignpostingCallCard";
import { babyOtherItemsOptions } from "./form/formSections/BabyProductsCard";

const getExpandedClientDetails = async (clientId: string): Promise<ExpandedClientData> => {
    const rawClientDetails = await getRawClientDetails(clientId);
    return rawDataToExpandedClientDetails(rawClientDetails);
};
export default getExpandedClientDetails;

export type RawClientDetails = Awaited<ReturnType<typeof getRawClientDetails>>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getRawClientDetails = async (clientId: string) => {
    const { data, error } = await supabase
        .from("clients")
        .select(
            `
            full_name,
            phone_number,
            email,
            delivery_instructions,
            address_1,
            address_2,
            address_town,
            address_county,
            address_postcode,
    
            family:families(
                birth_year,
                birth_month,
                gender,
                recorded_as_child
            ),

            cooking_facilities,
            dietary_requirements,
            
            diets:clients_diets(
                diet_id,
                diet:diets(
                    name
                )
            ),
            
            preferred_items:clients_preferred_items(
                item_id,
                item:lists(
                    item_name,
                    item_type
                ),
                notes
            ),
            
            hygiene_tampons,
            hygiene_pads,
            hygiene_other_items,
            baby_food,
            baby_formula,
            baby_nappies,
            baby_other_items,
            pet_food,
            other_items,
            extra_information,
            signposting_call_required,
            last_updated,
            signposting_call_reasons,
            notes,
            is_active,
            default_list
        `
        )
        .eq("primary_key", clientId)
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Clients expanded data", error);
        throw new DatabaseError("fetch", "clients", logId);
    }
    return data;
};

export const familyCountToFamilyCategory = (count: number): string => {
    if (count <= 1) {
        return "Single";
    }

    if (count <= 9) {
        return `Family of ${count}`;
    }

    return "Family of 10+";
};

export interface ClientDietWithName extends Pick<Schema["clients_diets"], "diet_id"> {
    diet: { name: string | null } | null;
}

export interface ClientItemWithName extends Pick<Schema["clients_preferred_items"], "item_id"> {
    item: { item_name: string | null } | null;
}

export interface ExpandedClientData {
    fullName: string;
    address: string;
    deliveryInstructions: string;
    phoneNumber: string;
    email: string;
    household: string;
    adults: string;
    children: string;
    cookingFacilities: string;
    dietaryRequirements: string;
    diets: string;
    preferredItems: string;
    hygieneProducts: string;
    babyProducts: string;
    petFood: string;
    otherRequirements: string;
    extraInformation: string;
    signpostingCallRequired: boolean;
    lastUpdated: string;
    signpostingCallReasons: string;
    notes: string | null;
    isActive: boolean;
    defaultList: ListType;
}

export const rawDataToExpandedClientDetails = (client: RawClientDetails): ExpandedClientData => {
    return {
        fullName: client.full_name ?? "",
        address: formatAddressFromClientDetails(client),
        deliveryInstructions: client.delivery_instructions ?? "",
        phoneNumber: client.phone_number ?? "",
        email: client.email ?? "",
        defaultList: client.default_list,
        household: formatHouseholdFromFamilyDetails(client.family),
        adults: formatBreakdownOfAdultsFromFamilyDetails(client.family),
        children: formatBreakdownOfChildrenFromFamilyDetails(client.family),
        cookingFacilities: formatRequirementsByCanonicalOrder(
            client.cooking_facilities,
            cookingFacilitiesOptions
        ),
        dietaryRequirements: formatRequirementsByCanonicalOrder(
            client.dietary_requirements,
            dietaryRequirementOptions
        ),
        diets: formatBreakdownFromArray(
            client.diets ?? [],
            (diet) => diet.diet?.name ?? diet.diet_id
        ),
        preferredItems: formatBreakdownFromArray(
            client.preferred_items.filter((item) => item.item?.item_type === "alternative_food"),
            (item) => item.item?.item_name ?? item.item_id,
            (item) => item.notes
        ),
        hygieneProducts: formatBreakdownFromArray(
            client.preferred_items.filter((item) => item.item?.item_type === "hygiene_product"),
            (item) => item.item?.item_name ?? item.item_id,
            (item) => item.notes
        ),
        babyProducts: formatBabyProducts(
            client.baby_food,
            client.baby_formula,
            client.baby_nappies,
            client.baby_other_items
        ),
        petFood: formatRequirementsByCanonicalOrder(client.pet_food, petFoodOptions),
        otherRequirements: formatBreakdownFromArray(
            client.preferred_items.filter((item) => item.item?.item_type === "others"),
            (item) => item.item?.item_name ?? item.item_id,
            (item) => item.notes
        ),
        extraInformation: formatExtraInformation(client.extra_information),
        signpostingCallRequired: client.signposting_call_required ?? false,
        lastUpdated: client.last_updated,
        signpostingCallReasons:
            client.signposting_call_required === true
                ? formatRequirementsByCanonicalOrder(
                      client.signposting_call_reasons,
                      signpostingCallOptions
                  )
                : "",
        notes: client.notes,
        isActive: client.is_active,
    };
};

export const formatAddressFromClientDetails = (
    client: Pick<
        Schema["clients"],
        "address_1" | "address_2" | "address_town" | "address_county" | "address_postcode"
    >
): string => {
    return formatAddress(
        client.address_1,
        client.address_2,
        client.address_town,
        client.address_county,
        client.address_postcode,
        false
    );
};

export const formatExtraInformation = (extraInformation: string | null): string => {
    return extraInformation ? extraInformation.replace(/[\r\n]+/g, "\n") : "";
};

export const formatHouseholdFromFamilyDetails = (
    family: Pick<
        Schema["families"],
        "birth_year" | "birth_month" | "recorded_as_child" | "gender"
    >[]
): string => {
    let adultCount = 0;
    let childCount = 0;

    for (const familyMember of family) {
        if (isAdultFamilyMember(familyMember)) {
            adultCount++;
        } else {
            childCount++;
        }
    }

    const adultChildBreakdown = [];

    if (adultCount > 0) {
        adultChildBreakdown.push(`${adultCount} adult${adultCount > 1 ? "s" : ""}`);
    }

    if (childCount > 0) {
        adultChildBreakdown.push(`${childCount} child${childCount > 1 ? "ren" : ""}`);
    }

    const familyCategory = familyCountToFamilyCategory(family.length);
    const occupantDisplay = `Occupant${adultCount + childCount > 1 ? "s" : ""}`;

    return `${familyCategory} ${occupantDisplay} (${adultChildBreakdown.join(", ")})`;
};

export const formatBreakdownOfAdultsFromFamilyDetails = (
    family: Pick<
        Schema["families"],
        "birth_year" | "birth_month" | "recorded_as_child" | "gender"
    >[]
): string => {
    const adultDetails = [];

    for (const familyMember of family) {
        if (isAdultFamilyMember(familyMember)) {
            const age = getAdultAgeStringUsingBirthYear(familyMember.birth_year, false);
            const gender = getGenderStringFromGenderField(familyMember.gender);
            adultDetails.push(`${age} ${gender}`);
        }
    }

    if (adultDetails.length === 0) {
        return "No Adults";
    }

    return adultDetails.join(", ");
};

export const formatBreakdownOfChildrenFromFamilyDetails = (
    family: Pick<
        Schema["families"],
        "birth_year" | "birth_month" | "recorded_as_child" | "gender"
    >[]
): string => {
    const childDetails = [];

    for (const familyMember of family) {
        if (isChildFamilyMember(familyMember)) {
            const age = getChildAgeStringUsingBirthYearAndMonth(
                familyMember.birth_year,
                familyMember.birth_month,
                false
            );
            const gender = getGenderStringFromGenderField(familyMember.gender);
            childDetails.push(`${age} ${gender}`);
        }
    }

    if (childDetails.length === 0) {
        return "No Children";
    }

    return childDetails.join(", ");
};

export const formatBreakdownFromArray = <T>(
    arr: T[] | null | undefined,
    getName: (item: T) => string | number | null | undefined,
    getAdditionalInfo?: (item: T) => string | null | undefined
): string => {
    if (!arr || arr.length === 0) {
        return "-";
    }
    const items = arr
        .map((item) => {
            const name = getName(item);
            if (name === null || name === undefined || `${name}`.trim() === "") {
                return null;
            }

            const extra = getAdditionalInfo?.(item);
            const extraClean = extra && extra.trim() !== "" ? extra : null;
            return extraClean ? `${name} (${extraClean})` : `${name}`;
        })
        .filter((item): item is string => item !== null);
    return items.length ? items.join(", ") : "None";
};

export const formatRequirementsByCanonicalOrder = (
    requirementsArray: string[] | null,
    canonicalOrder: string[]
): string => {
    if (requirementsArray === null) {
        return "Don't Know";
    } else if (requirementsArray.length === 0) {
        return "None";
    }

    return sortArrayByCanonicalOrder(requirementsArray, canonicalOrder).join(", ");
};

export const formatBabyProducts = (
    babyFood: string | null,
    babyFormula: string | null,
    babyNappySize: string | null,
    babyOtherItems: string[] | null
): string => {
    const items = [];

    if (babyNappySize !== null) {
        items.push("Nappies" + (babyNappySize.length > 0 ? ` (Size ${babyNappySize})` : ""));
    }

    if (babyFormula !== null) {
        items.push("Formula" + (babyFormula.length > 0 ? ` (${babyFormula})` : ""));
    }

    if (babyFood !== null) {
        items.push("Baby Food" + (babyFood.length > 0 ? ` (${babyFood})` : ""));
    }

    if (babyOtherItems !== null && babyOtherItems.length > 0) {
        items.push(formatRequirementsByCanonicalOrder(babyOtherItems, babyOtherItemsOptions));
    }

    return items.length > 0 ? items.join(", ") : "None";
};

type IsClientActiveErrorType = "failedClientIsActiveFetch";
export interface IsClientActiveError {
    type: IsClientActiveErrorType;
    logId: string;
}

type GetClientIsActiveResponse =
    | {
          error: null;
          isActive: boolean;
      }
    | {
          error: IsClientActiveError;
          isActive: null;
      };

export const getIsClientActive = async (clientId: string): Promise<GetClientIsActiveResponse> => {
    const { data: isActiveData, error: isActiveError } = await supabase
        .from("clients")
        .select("primary_key, is_active")
        .eq("primary_key", clientId)
        .single();

    if (isActiveError) {
        const logId = await logErrorReturnLogId("Error with fetch: client table", {
            error: isActiveError,
        });
        return { error: { type: "failedClientIsActiveFetch", logId }, isActive: null };
    }

    return { isActive: isActiveData.is_active, error: null };
};
