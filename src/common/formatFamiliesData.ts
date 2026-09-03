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
import { getGenderShortStringFromGenderField } from "./getGendersOfFamily";

export interface HouseholdSummary {
    householdSize: string;
    ageAndGenderOfAdults: string;
    numberOfBabies: string;
    ageAndGenderOfChildren: string;
}

const getPersonSummary = (person: Person, age: string): string => {
    const genderString = getGenderShortStringFromGenderField(person.gender);

    return `${age} ${genderString}`;
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

export const prepareHouseholdSummary = (
    familyCount: number,
    familyData: Schema["families"][]
): HouseholdSummary => {
    const formattedChildren: Person[] = getFormattedPeople(familyData, isChildFamilyMember);
    const formattedAdults: Person[] = getFormattedPeople(familyData, isAdultFamilyMember);
    const numberBabies = familyData.filter(
        (member) => member.birth_year === getCurrentYear()
    ).length;

    return {
        householdSize: `${familyCount}`,
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
