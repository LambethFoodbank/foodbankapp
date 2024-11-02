import { Gender } from "@/components/Form/formFunctions";

export const genderSelectValueForUnknown = "?";

export const getGenderStringFromGenderField = (gender?: Gender | null): string => {
    if (!gender) {
        return "unknown gender";
    } else if (gender === "other") {
        return "other gender";
    } else {
        return gender;
    }
};

export const getGenderShortStringFromGenderField = (gender?: Gender | null): string => {
    if (gender === "male") {
        return "M";
    } else if (gender === "female") {
        return "F";
    } else if (gender === "other") {
        return "O";
    } else {
        return "unknown gender";
    }
};

export const getUserFormStringForGender = (gender?: Gender | null): string => {
    if (!gender) {
        return "Unknown";
    } else if (gender === "female") {
        return "Female";
    } else if (gender === "male") {
        return "Male";
    }

    return "Prefer not to say";
};

export const getGenderForUserFormString = (value: string): Gender | null => {
    if (value === genderSelectValueForUnknown) {
        return null;
    } else if (value === "Female") {
        return "female";
    } else if (value === "Male") {
        return "male";
    }

    return "other";
};

export const getGenderSelectLabelsAndValues = (): [string, string][] => {
    return [
        [getUserFormStringForGender(null), genderSelectValueForUnknown],
        [getUserFormStringForGender("female"), "female"],
        [getUserFormStringForGender("male"), "male"],
        [getUserFormStringForGender("other"), "other"],
    ];
};
