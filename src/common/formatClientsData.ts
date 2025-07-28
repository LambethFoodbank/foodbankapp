import { Schema } from "@/databaseUtils";
import { displayPostcodeForHomelessClient, formatAddress } from "@/common/format";
import {
    formatBabyProducts,
    formatExtraInformation,
    formatHygieneProducts,
    formatRequirementsByCanonicalOrder,
} from "@/app/clients/getExpandedClientDetails";
import { dietaryRequirementOptions } from "@/app/clients/form/formSections/DietaryRequirementCard";
import { otherRequirementOptions } from "@/app/clients/form/formSections/OtherItemsCard";
import { petFoodOptions } from "@/app/clients/form/formSections/PetFoodCard";
import { cookingFacilitiesOptions } from "@/app/clients/form/formSections/CookingFacilitiesCard";

export interface ClientSummary {
    name: string;
    contact: string;
    address: string;
    email: string;
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

export const prepareClientSummary = (clientData: Schema["clients"]): ClientSummary => {
    const {
        address_1,
        address_2,
        address_town,
        address_county,
        address_postcode,
        full_name,
        phone_number,
        email,
        extra_information,
    } = clientData;

    const formattedAddress = formatAddress(
        address_1,
        address_2,
        address_town,
        address_county,
        address_postcode
    );

    return {
        name: full_name ?? "",
        contact: phone_number ?? "",
        address: address_postcode ? formattedAddress : displayPostcodeForHomelessClient,
        email: email ?? "",
        extraInformation: formatExtraInformation(extra_information),
    };
};

export const prepareRequirementSummary = (clientData: Schema["clients"]): RequirementSummary => {
    return {
        hygieneProducts: formatHygieneProducts(
            clientData.hygiene_tampons,
            clientData.hygiene_pads,
            clientData.hygiene_other_items
        ),
        babyProducts: formatBabyProducts(
            clientData.baby_food,
            clientData.baby_formula,
            clientData.baby_nappies,
            clientData.baby_other_items
        ),
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
