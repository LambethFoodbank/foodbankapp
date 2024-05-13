import { Schema } from "@/databaseUtils";
import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { logErrorReturnLogId } from "@/logger/logger";
import { nullPostcodeDisplay } from "@/common/format";
import { getChildAgeUsingBirthYear } from "@/common/getCurrentYear";

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
                gender
            ),
    
            dietary_requirements,
            feminine_products,
            baby_food,
            pet_food,
            other_items,
            extra_information
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
    children: string;
    dietaryRequirements: string;
    feminineProducts: string;
    babyProducts: boolean | null;
    petFood: string;
    otherRequirements: string;
    extraInformation: string;
}

export const rawDataToExpandedClientDetails = (client: RawClientDetails): ExpandedClientData => {
    return {
        fullName: client.full_name,
        address: formatAddressFromClientDetails(client),
        deliveryInstructions: client.delivery_instructions,
        phoneNumber: client.phone_number,
        household: formatHouseholdFromFamilyDetails(client.family),
        children: formatBreakdownOfChildrenFromFamilyDetails(client.family),
        dietaryRequirements: client.dietary_requirements.join(", "),
        feminineProducts: client.feminine_products.join(", "),
        babyProducts: client.baby_food,
        petFood: client.pet_food.join(", "),
        otherRequirements: client.other_items.join(", "),
        extraInformation: client.extra_information,
    };
};

export const formatAddressFromClientDetails = (
    client: Pick<
        Schema["clients"],
        "address_1" | "address_2" | "address_town" | "address_county" | "address_postcode"
    >
): string => {
    if (!client.address_postcode) {
        return nullPostcodeDisplay;
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
    family: Pick<Schema["families"], "birth_year" | "gender">[]
): string => {
    let adultCount = 0;
    let childCount = 0;

    for (const familyMember of family) {
        if (familyMember.birth_year <= 2008) {
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

export const formatBreakdownOfChildrenFromFamilyDetails = (
    family: Pick<Schema["families"], "birth_year" | "gender">[]
): string => {
    const childDetails = [];

    for (const familyMember of family) {
        if (familyMember.birth_year !== null && familyMember.birth_year >= 2009) {
            const age = getChildAgeUsingBirthYear(familyMember.birth_year);
            childDetails.push(`${age}-year-old ${familyMember.gender}`);
        }
    }

    if (childDetails.length === 0) {
        return "No Children";
    }

    return childDetails.join(", ");
};
