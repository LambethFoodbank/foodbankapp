import { Schema } from "@/databaseUtils";
import { displayPostcodeForHomelessClient, formatAddress } from "@/common/format";
import {
    formatHygieneProducts,
    formatRequirementsByCanonicalOrder,
} from "@/app/clients/getExpandedClientDetails";
import { dietaryRequirementOptions } from "@/app/clients/form/formSections/DietaryRequirementCard";
import { otherRequirementOptions } from "@/app/clients/form/formSections/OtherItemsCard";
import { petFoodOptions } from "@/app/clients/form/formSections/PetFoodCard";
import { cookingFacilitiesOptions } from "@/app/clients/form/formSections/CookingFacilitiesCard";

interface NappySizeAndExtraInformation {
    nappySize: string;
    extraInformation: string;
}

export interface ClientSummary {
    name: string;
    contact: string;
    address: string;
    extraInformation: string;
}

export interface RequirementSummary {
    hygieneProducts: string;
    babyProducts: string;
    petFood: string;
    dietaryRequirements: string;
    otherItems: string;
    cookingFacilities: string;
}

export const processExtraInformation = (original: string): NappySizeAndExtraInformation => {
    if (!original.startsWith("Nappy Size: ")) {
        return { nappySize: "", extraInformation: original };
    }

    const [nappySize, extraInformation] = original.split(", Extra Information: ");
    return { nappySize: nappySize, extraInformation: extraInformation };
};

export const prepareClientSummary = (clientData: Schema["clients"]): ClientSummary => {
    const {
        address_1,
        address_2,
        address_town,
        address_county,
        address_postcode,
        full_name,
        phone_number,
        extra_information,
    } = clientData;

    const formattedAddress = formatAddress(
        address_1,
        address_2,
        address_town,
        address_county,
        address_postcode
    );

    const { extraInformation } = processExtraInformation(extra_information ?? "");

    return {
        name: full_name ?? "",
        contact: phone_number ?? "",
        address: address_postcode ? formattedAddress : displayPostcodeForHomelessClient,
        extraInformation: extraInformation,
    };
};

export const prepareRequirementSummary = (clientData: Schema["clients"]): RequirementSummary => {
    let babyProduct: string;
    const { nappySize } = processExtraInformation(clientData.extra_information ?? "");

    switch (clientData.baby_food) {
        case true:
            babyProduct = "Yes";
            if (nappySize.length > 0) {
                babyProduct += ` (${nappySize})`;
            }
            break;
        case false:
            babyProduct = "No";
            break;
        case null:
            babyProduct = "Don't Know";
            break;
    }

    return {
        hygieneProducts: formatHygieneProducts(
            clientData.hygiene_tampons,
            clientData.hygiene_pads,
            clientData.hygiene_female_incontinence,
            clientData.hygiene_male_incontinence
        ),
        babyProducts: babyProduct,
        petFood: formatRequirementsByCanonicalOrder(clientData.pet_food, petFoodOptions),
        dietaryRequirements: formatRequirementsByCanonicalOrder(
            clientData.dietary_requirements,
            dietaryRequirementOptions
        ),
        otherItems: formatRequirementsByCanonicalOrder(
            clientData.other_items,
            otherRequirementOptions
        ),
        cookingFacilities: formatRequirementsByCanonicalOrder(
            clientData.cooking_facilities,
            cookingFacilitiesOptions
        ),
    };
};
