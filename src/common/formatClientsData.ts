import { Schema } from "@/databaseUtils";
import { displayPostcodeForHomelessClient, formatAddress } from "@/common/format";
import {
    formatExtraInformation,
    formatRequirementsByCanonicalOrder,
} from "@/app/clients/getExpandedClientDetails";
import { dietaryRequirementOptions } from "@/app/clients/form/formSections/DietaryRequirementCard";
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
        email: email ?? "",
        address: address_postcode ? formattedAddress : displayPostcodeForHomelessClient,
        extraInformation: formatExtraInformation(extra_information),
    };
};

export const prepareRequirementSummary = (clientData: Schema["clients"]): RequirementSummary => {
    return {
        hygieneProducts: "-", //TODO: VFB-460
        babyProducts: "-", //TODO: VFB-460
        petFood: "-", //TODO: VFB-460
        dietaryRequirements: formatRequirementsByCanonicalOrder(
            clientData.dietary_requirements,
            dietaryRequirementOptions
        ),
        otherItems: "-", //TODO: VFB-460
        cookingFacilities: formatRequirementsByCanonicalOrder(
            clientData.cooking_facilities,
            cookingFacilitiesOptions
        ),
    };
};
