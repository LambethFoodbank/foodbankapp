import { getCurrentMonth, getCurrentYear } from "@/common/date";

export const getChildBirthYears = (): string[] => {
    const currentYear = getCurrentYear();
    const childBirthYears: string[] = Array.from({ length: 17 }, (_, index) => {
        return (currentYear - index).toString();
    });
    return childBirthYears;
};

export const getAdultBirthYears = (): string[] => {
    const currentYear = getCurrentYear();
    const adultBirthYears: string[] = Array.from({ length: 120 }, (_, index) => {
        return (currentYear - index - 16).toString();
    });
    return adultBirthYears;
};

const monthsOfTheYear = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const childBirthMonthList: [string, string][] = monthsOfTheYear.map((month, index) => {
    return [month, (index + 1).toString()];
});

export const getCurrentYearChildBirthMonthList = (): [string, string][] => {
    const currentMonth = getCurrentMonth();
    const currentYearChildBirthMonths = monthsOfTheYear.slice(0, currentMonth);
    return currentYearChildBirthMonths.map((month, index) => {
        return [month, (index + 1).toString()];
    });
};
