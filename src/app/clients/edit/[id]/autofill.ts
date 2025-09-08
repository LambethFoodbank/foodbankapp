import { Schema } from "@/databaseUtils";
import { ClientFields } from "@/app/clients/form/ClientForm";
import { BooleanGroup } from "@/components/DataInput/inputHandlerFactories";
import { Diet, Item } from "@/components/Form/formFunctions";
import { isAdultFamilyMember, isChildFamilyMember } from "@/common/getAgesOfFamily";
import { getFormattedPeople } from "@/common/formatFamiliesData";

const arrayToBooleanGroup = (data: string[]): BooleanGroup => {
    const reverted: BooleanGroup = {};
    data.forEach((value) => (reverted[value] = true));
    return reverted;
};

const autofill = (
    clientData: Schema["clients"],
    familyData: Schema["families"][],
    dietsData: Schema["clients_diets"]["diet_id"][],
    itemsData: Item[]
): ClientFields => {
    const children = getFormattedPeople(familyData, isChildFamilyMember);

    const adults = getFormattedPeople(familyData, isAdultFamilyMember);

    const noPostcode = clientData.address_postcode === null;

    const preferredItems = itemsData.filter((item) => item.type === "alternative_food");
    const otherItems = itemsData.filter((item) => item.type === "others");
    const hygieneItems = itemsData.filter((item) => item.type === "hygiene_product");
    const babyItems = itemsData.filter((item) => item.type === "baby_product");

    return {
        fullName: clientData.full_name ?? "",
        phoneNumber: clientData.phone_number ?? "",
        email: clientData.email ?? "",
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
        cookingFacilities:
            clientData.cooking_facilities !== null
                ? arrayToBooleanGroup(clientData.cooking_facilities)
                : null,
        dietaryRequirements:
            clientData.dietary_requirements !== null
                ? arrayToBooleanGroup(clientData.dietary_requirements)
                : null,
        diets: dietsData.map((diet) => ({ primaryKey: diet }) as Diet),
        preferredItems: preferredItems,
        hygieneProducts: hygieneItems,
        babyProducts: babyItems,
        petFood: arrayToBooleanGroup(clientData.pet_food ?? []),
        otherItems: otherItems,
        deliveryInstructions: clientData.delivery_instructions ?? "",
        extraInformation: clientData.extra_information ?? "",
        attentionFlag: clientData.flagged_for_attention ?? false,
        signpostingCall: clientData.signposting_call_required ?? false,
        signpostingCallReasons:
            clientData.signposting_call_reasons !== null
                ? arrayToBooleanGroup(clientData.signposting_call_reasons)
                : null,
        lastUpdated: clientData.last_updated,
        notes: clientData.notes,
    };
};

export default autofill;
