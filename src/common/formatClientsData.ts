import { Schema } from "@/databaseUtils";
import { displayPostcodeForHomelessClient, formatAddress } from "@/common/format";
import {
    formatBreakdownFromArray,
    formatExtraInformation,
    formatRequirementsByCanonicalOrder,
} from "@/app/clients/getExpandedClientDetails";
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
    choiceItems: string;
    seasonalItems: string;
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
        hygieneProducts: formatBreakdownFromArray(
            clientPreferredItems.filter((item) => item.type === "hygiene_product"),
            (item) => item.name,
            (item) => item.notes
        ),
        babyProducts: formatBreakdownFromArray(
            clientPreferredItems.filter((item) => item.type === "baby_product"),
            (item) => item.name,
            (item) => item.notes
        ),
        petFood: formatBreakdownFromArray(
            clientPreferredItems.filter((item) => item.type === "pet_food"),
            (item) => item.name,
            (item) => item.notes
        ),
        diets: clientDiets.map((diet) => diet.name).join(", ") || "None",
        preferredItems: formatBreakdownFromArray(
            clientPreferredItems.filter((item) => item.type === "alternative_food"),
            (item) => item.name,
            (item) => item.notes
        ),
        choiceItems: formatBreakdownFromArray(
            clientPreferredItems.filter((item) => item.type === "choice_food"),
            (item) => item.name,
            (item) => item.notes
        ),
        seasonalItems: formatBreakdownFromArray(
            clientPreferredItems.filter((item) => item.type === "seasonal_product"),
            (item) => item.name,
            (item) => item.notes
        ),
        otherItems: formatBreakdownFromArray(
            clientPreferredItems.filter((item) => item.type === "others"),
            (item) => item.name,
            (item) => item.notes
        ),
        cookingFacilities: formatRequirementsByCanonicalOrder(
            clientData.cooking_facilities,
            cookingFacilitiesOptions
        ),
    };
};
