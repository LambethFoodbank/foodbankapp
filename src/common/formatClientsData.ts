import { Schema } from "@/databaseUtils";
import {
    displayPostcodeForHomelessClient,
    formatAdditionalPhoneNumbers,
    formatAddress,
} from "@/common/format";
import {
    formatBabyProducts,
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
}

export interface ClientSummaryAndExtraInfo extends ClientSummary {
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
        additional_phone_numbers,
        email,
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
        contact: formatAdditionalPhoneNumbers(phone_number, additional_phone_numbers, true),
        email: email ?? "",
        address: address_postcode ? formattedAddress : displayPostcodeForHomelessClient,
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
