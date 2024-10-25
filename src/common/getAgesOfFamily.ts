import { getCurrentMonth, getCurrentYear } from "@/common/date";
import { Schema } from "@/databaseUtils";

const MIN_AGE_OF_ADULT = 16;

export const isAdultFamilyMember = (
    person: Pick<Schema["families"], "birth_year" | "birth_month" | "recorded_as_child">
): boolean => {
    return !isChildFamilyMember(person);
};

export const isChildFamilyMember = (
    person: Pick<Schema["families"], "birth_year" | "birth_month" | "recorded_as_child">
): boolean => {
    if (person.birth_year) {
        // If the person is in their 16th year and we don't know their birth month, then assume they're still a child
        const ageByYear = getCurrentYear() - person.birth_year;
        if (ageByYear < MIN_AGE_OF_ADULT) {
            return true;
        } else if (ageByYear > MIN_AGE_OF_ADULT) {
            return false;
        } else if (person.birth_month === null) {
            return true;
        } else {
            return getCurrentMonth() <= person.birth_month;
        }
    } else {
        // Only check this flag if no birth year
        return !!person.recorded_as_child;
    }
};

export const getAdultAgeStringUsingBirthYear = (
    birthYear: number | null,
    shortHand: boolean
): string => {
    if (birthYear === null) {
        return "unknown age";
    }

    const years = getCurrentYear() - birthYear;
    return shortHand ? `${years}y` : `${years}-years-old`;
};

export const getChildAgeStringUsingBirthYearAndMonth = (
    birthYear: number | null,
    birthMonth: number | null,
    shortHand: boolean
): string => {
    if (birthYear === null) {
        return "unknown age";
    }

    const years = getCurrentYear() - birthYear;
    const months = birthMonth ? getCurrentMonth() - birthMonth : 0;
    const totalMonths = years * 12 + months;

    if (totalMonths <= 1) {
        return shortHand ? `${totalMonths}m` : `${totalMonths}-month-old`;
    }
    if (totalMonths < 12) {
        return shortHand ? `${totalMonths}m` : `${totalMonths}-months-old`;
    }
    if (shortHand) {
        return `${years}y`;
    }
    return totalMonths < 24 ? `${years}-year-old` : `${years}-years-old`;
};
