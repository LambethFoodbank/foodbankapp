import { Schema } from "@/databaseUtils";
import { displayPostcodeForHomelessClient, formatAddress } from "@/common/format";
import {
    formatBabyProducts,
    formatBreakdownFromArray,
    formatExtraInformation,
    formatHygieneProducts,
    formatRequirementsByCanonicalOrder,
    getClientPreferredItemsByType,
} from "@/app/clients/getExpandedClientDetails";
import { otherRequirementOptions } from "@/app/clients/form/formSections/OtherItemsCard";
import { petFoodOptions } from "@/app/clients/form/formSections/PetFoodCard";
import { cookingFacilitiesOptions } from "@/app/clients/form/formSections/CookingFacilitiesCard";
import { Diet, Item } from "@/components/Form/formFunctions";

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
    diets: string;
    preferredItems: string;
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

export const prepareRequirementSummary = (
    clientData: Schema["clients"],
    clientDiets: Diet[],
    clientPreferredItems: Item[]
): RequirementSummary => {
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
        diets: clientDiets.map((diet) => diet.name).join(", ") || "None",
        preferredItems: formatBreakdownFromArray(
            getClientPreferredItemsByType(
                clientPreferredItems,
                (item) => item.name,
                (item) => item.type ?? null,
                "alternative_food"
            ),
            (item) => item
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
