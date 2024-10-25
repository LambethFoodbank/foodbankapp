import { Person } from "@/components/Form/formFunctions";
import { Schema } from "@/databaseUtils";
import { displayList } from "@/common/format";
import {
    getAdultAgeStringUsingBirthYear,
    getChildAgeStringUsingBirthYearAndMonth,
    isAdultFamilyMember,
    isChildFamilyMember,
} from "@/common/getAgesOfFamily";
import { getCurrentYear } from "@/common/date";

export interface HouseholdSummary {
    householdSize: string;
    ageAndGenderOfAdults: string;
    numberOfBabies: string;
    ageAndGenderOfChildren: string;
}

const getPersonSummary = (person: Person, age: string): string => {
    let gender;
    switch (person.gender) {
        case "male":
            gender = "M";
            break;
        case "female":
            gender = "F";
            break;
        case "other":
            gender = "O";
            break;
    }
    return `${age} ${gender}`;
};

const convertPlural = (value: number, description: string): string => {
    return `${value} ${description}${value !== 1 ? "s" : ""}`;
};

export const getFormattedPeople = (
    familyData: Schema["families"][],
    filterFunction: (person: Schema["families"]) => boolean
): Person[] => {
    const people = familyData.filter((member) => filterFunction(member));
    return people.map((person) => {
        return {
            gender: person.gender,
            birthMonth: person.birth_month,
            birthYear: person.birth_year,
            recordedAsChild: person.recorded_as_child,
        };
    });
};

export const prepareHouseholdSummary = (familyData: Schema["families"][]): HouseholdSummary => {
    const formattedChildren: Person[] = getFormattedPeople(familyData, isChildFamilyMember);
    const formattedAdults: Person[] = getFormattedPeople(familyData, isAdultFamilyMember);
    const householdSize = familyData.length;
    const numberBabies = familyData.filter(
        (member) => member.birth_year === getCurrentYear()
    ).length;

    const adultText = `${householdSize} (${convertPlural(
        householdSize - formattedChildren.length,
        "Adult"
    )}`;
    const childText = `${formattedChildren.length} Child${formattedChildren.length === 1 ? "" : "ren"})`;

    return {
        householdSize: `${adultText} ${childText}`,
        ageAndGenderOfAdults: displayList(
            formattedAdults.map((adult) =>
                getPersonSummary(
                    adult,
                    getAdultAgeStringUsingBirthYear(adult.birthYear ?? null, true)
                )
            )
        ),
        numberOfBabies: numberBabies.toString(),
        ageAndGenderOfChildren: displayList(
            formattedChildren.map((child) =>
                getPersonSummary(
                    child,
                    getChildAgeStringUsingBirthYearAndMonth(
                        child.birthYear ?? null,
                        child.birthMonth ?? null,
                        true
                    )
                )
            )
        ),
    };
};
