import { Person } from "@/components/Form/formFunctions";
import {
    getAllPeopleFromFamily,
    getClientFromClients,
} from "@/app/batch-create/helpers/supabaseHelpers";
import dayjs from "dayjs";
import { logErrorReturnLogId } from "@/logger/logger";
import { BatchClient } from "@/app/batch-create/types";
import {
    createBooleanGroupFromStrings,
    getNappySize,
    parseExtraInfo,
} from "@/app/batch-create/helpers/clientSideReducerHelpers";

const getChildrenAndAdults = async (
    familyId: string
): Promise<{ adults: Person[]; children: Person[] } | null> => {
    const { data, error } = await getAllPeopleFromFamily(familyId);

    const adults: Person[] = [];
    const children: Person[] = [];

    const currentDate = dayjs().startOf("day");

    if (error) {
        logErrorReturnLogId("Error with fetch: family_members", { error: error });
        return null;
    }
    if (!data) {
        return { adults: [], children: [] };
    }
    data.forEach((person) => {
        const formattedPerson: Person = {
            gender: person.gender,
            birthYear: person.birth_year,
            birthMonth: person.birth_month,
            recordedAsChild: person.recorded_as_child,
        };

        if (formattedPerson.birthYear) {
            const birthDate = dayjs()
                .year(formattedPerson.birthYear || 0)
                .month(formattedPerson.birthMonth || 0)
                .startOf("month");
            const age = currentDate.diff(birthDate, "year");
            if (age < 16) {
                children.push(formattedPerson);
            } else {
                adults.push(formattedPerson);
            }
        } else {
            adults.push(formattedPerson);
        }
    });
    return { adults, children };
};

export const getClientDataForBatchParcels = async (
    clientId: string
): Promise<BatchClient | null> => {
    const { data, error } = await getClientFromClients(clientId);

    if (error) {
        logErrorReturnLogId("Error with fetch: clients", { error: error });
        return null;
    }
    if (!data) {
        return null;
    }
    const ChildrenAndAdults = await getChildrenAndAdults(data.family_id);
    if (!ChildrenAndAdults) {
        return null;
    }
    const { adults, children } = ChildrenAndAdults;
    return {
        fullName: data.full_name ?? "",
        phoneNumber: data.phone_number ?? "",
        address: {
            addressLine1: data.address_1 ?? "",
            addressLine2: data?.address_2 ?? "",
            addressTown: data?.address_town ?? "",
            addressCounty: data?.address_county ?? "",
            addressPostcode: data?.address_postcode ?? "",
        },
        adultInfo: {
            adults: adults,
            numberOfAdults: adults.length,
        },
        childrenInfo: {
            children: children,
            numberOfChildren: children.length,
        },
        listType: data.default_list ?? "regular",
        cookingFacilities: createBooleanGroupFromStrings(data.cooking_facilities),
        dietaryRequirements: createBooleanGroupFromStrings(data.dietary_requirements),
        feminineProducts: createBooleanGroupFromStrings(data.feminine_products),
        babyProducts: data.baby_food === true ? "Yes" : data.baby_food === false ? "No" : null,
        nappySize: getNappySize(data.extra_information),
        petFood: createBooleanGroupFromStrings(data.pet_food),
        otherItems: createBooleanGroupFromStrings(data.other_items),
        deliveryInstructions: data.delivery_instructions,
        extraInformation: parseExtraInfo(data.extra_information),
        attentionFlag: data.flagged_for_attention ?? false,
        signpostingCall: data.signposting_call_required ?? false,
        notes: data.notes,
    };
};
