import { Schema } from "@/databaseUtils";
import { ClientFields } from "@/app/clients/form/ClientForm";
import { BooleanGroup } from "@/components/DataInput/inputHandlerFactories";
import { isAdultFamilyMember, isChildFamilyMember } from "@/common/getAgesOfFamily";
import { getFormattedPeople } from "@/common/formatFamiliesData";

const arrayToBooleanGroup = (data: string[]): BooleanGroup => {
    const reverted: BooleanGroup = {};
    data.forEach((value) => (reverted[value] = true));
    return reverted;
};

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
        addressLine1: noPostcode ? "" : clientData.address_1 ?? "",
        addressLine2: noPostcode ? "" : clientData.address_2 ?? "",
        addressTown: noPostcode ? "" : clientData.address_town ?? "",
        addressCounty: noPostcode ? "" : clientData.address_county ?? "",
        addressPostcode: clientData.address_postcode,
        numberOfAdults: adults.length,
        adults: adults,
        numberOfChildren: children.length,
        children: children,
        listType: clientData.default_list,
        cookingFacilities: arrayToBooleanGroup(clientData.cooking_facilities ?? []),
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
        extraInformation: clientData.extra_information ?? "",
        attentionFlag: clientData.flagged_for_attention ?? false,
        signpostingCall: clientData.signposting_call_required ?? false,
        signpostingCallReasons: arrayToBooleanGroup(clientData.signposting_call_reasons ?? []),
        lastUpdated: clientData.last_updated,
        notes: clientData.notes,
    };
};

export default autofill;
