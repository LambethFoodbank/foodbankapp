import { Schema } from "@/databaseUtils";
import { ClientFields } from "@/app/clients/form/ClientForm";
import { isAdultFamilyMember, isChildFamilyMember } from "@/common/getAgesOfFamily";
import { getFormattedPeople } from "@/common/formatFamiliesData";
import { arrayToBooleanGroup } from "@/common/format";

const autofill = (
    clientData: Schema["clients"],
    familyData: Schema["families"][]
): ClientFields => {
    const children = getFormattedPeople(familyData, isChildFamilyMember);

    const adults = getFormattedPeople(familyData, isAdultFamilyMember);

    const noPostcode = clientData.address_postcode === null;

    return {
        fullName: clientData.full_name ?? "",
        phoneNumber: clientData.phone_number ?? "",
        email: clientData.email ?? "",
        addressLine1: noPostcode ? "" : clientData.address_1 ?? "",
        addressLine2: noPostcode ? "" : clientData.address_2 ?? "",
        addressTown: noPostcode ? "" : clientData.address_town ?? "",
        addressCounty: noPostcode ? "" : clientData.address_county ?? "",
        // This should not be set to the empty string because the null value is used to indicate an NFA client
        addressPostcode: clientData.address_postcode,
        numberOfAdults: adults.length,
        adults: adults,
        numberOfChildren: children.length,
        children: children,
        listType: clientData.default_list,
        cookingFacilities:
            clientData.cooking_facilities !== null
                ? arrayToBooleanGroup(clientData.cooking_facilities)
                : null,
        dietaryRequirements:
            clientData.dietary_requirements !== null
                ? arrayToBooleanGroup(clientData.dietary_requirements)
                : null,
        hygieneProductsTampons: clientData.hygiene_tampons,
        hygieneProductsPads: clientData.hygiene_pads,
        hygieneOtherItems: arrayToBooleanGroup(clientData.hygiene_other_items ?? []),
        babyFood: clientData.baby_food,
        babyFormula: clientData.baby_formula,
        babyNappies: clientData.baby_nappies,
        babyOtherItems: arrayToBooleanGroup(clientData.baby_other_items ?? []),
        petFood: arrayToBooleanGroup(clientData.pet_food ?? []),
        otherItems: arrayToBooleanGroup(clientData.other_items ?? []),
        deliveryInstructions: clientData.delivery_instructions ?? "",
        lastUpdated: clientData.last_updated,
        notes: clientData.notes,
        additionalPhoneNumbers: clientData.additional_phone_numbers ?? [],
    };
};

export default autofill;
