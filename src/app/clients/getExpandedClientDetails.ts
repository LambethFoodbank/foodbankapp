import { Schema } from "@/databaseUtils";
import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { logErrorReturnLogId } from "@/logger/logger";
import { displayPostcodeForHomelessClient } from "@/common/format";
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
import { otherRequirementOptions } from "./form/formSections/OtherItemsCard";
import { feminineProductOptions } from "./form/formSections/FeminineProductCard";
import { petFoodOptions } from "./form/formSections/PetFoodCard";
import { cookingFacilitiesOptions } from "./form/formSections/CookingFacilitiesCard";

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
            feminine_products,
            baby_food,
            pet_food,
            other_items,
            extra_information,
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

export interface ExpandedClientData {
    fullName: string;
    address: string;
    deliveryInstructions: string;
    phoneNumber: string;
    household: string;
    adults: string;
    children: string;
    cookingFacilities: string;
    dietaryRequirements: string;
    feminineProducts: string;
    babyProducts: boolean | null;
    petFood: string;
    otherRequirements: string;
    extraInformation: string;
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
        feminineProducts: formatRequirementsByCanonicalOrder(
            client.feminine_products,
            feminineProductOptions
        ),
        babyProducts: client.baby_food,
        petFood: formatRequirementsByCanonicalOrder(client.pet_food, petFoodOptions),
        otherRequirements: formatRequirementsByCanonicalOrder(
            client.other_items,
            otherRequirementOptions
        ),
        extraInformation: client.extra_information ?? "",
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
    if (!client.address_postcode) {
        return displayPostcodeForHomelessClient;
    }
    return [
        client.address_1,
        client.address_2,
        client.address_town,
        client.address_county,
        client.address_postcode,
    ]
        .filter((field) => field)
        .join(", ");
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
