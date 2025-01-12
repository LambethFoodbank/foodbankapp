import { Json } from "@/databaseTypesFile";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

const localeCode = "en-GB";

export const displayPostcodeForHomelessClient = "NFA";

export const displayNameForDeletedClient = "Deleted Client";

export const displayNameForNullDriverName = "Unknown Driver";

export const phoneNumberFormatSymbolsRegex = /[\s-()]/g;
// Following characters excluded from regex as are removed before checking format matches: ( ) - \s
export const phoneNumberRegex = /^((0|\+44)\d{9,11}|\+(?!44)\d{7,15})?$/;

export const formatPhoneNumber = (value: string): string => {
    const numericInput = value.replace(/(\D)/g, "");
    return numericInput[0] === "0" ? "+44" + numericInput.slice(1) : "+" + numericInput;
};

export const formatCamelCaseKey = (objectKey: string): string => {
    const withSpace = objectKey.replaceAll(/([a-z])([A-Z])/g, "$1 $2");
    return withSpace.toUpperCase();
};

export const displayList = (data: string[]): string => {
    return data.length === 0 ? "None" : data.join(", ");
};

export const formatTodayAsDate = (): string => {
    return new Date().toLocaleString(localeCode, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });
};

export const formatDateToDate = (dateString: string | null): string => {
    if (dateString === null) {
        return "";
    }
    return new Date(dateString).toLocaleString(localeCode, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });
};

export const formatTimestampAsDatetime = (timestamp: number): string => {
    if (isNaN(timestamp)) {
        return "-";
    }

    return new Date(timestamp).toLocaleString(localeCode);
};

export const formatDatetimeAsDate = (datetime: Date | string | null): string => {
    if (datetime instanceof Date) {
        return datetime.toLocaleDateString(localeCode);
    }

    if (datetime === null || isNaN(Date.parse(datetime))) {
        return "-";
    }

    return new Date(datetime).toLocaleDateString(localeCode);
};

export const formatDatetimeAsTime = (datetime: string | null): string => {
    if (datetime === null || isNaN(Date.parse(datetime))) {
        return "-";
    }

    return new Date(datetime).toLocaleTimeString(localeCode);
};

export const formatDateTime = (datetime: Date | string | null): string => {
    if (datetime instanceof Date) {
        return datetime.toLocaleString(localeCode);
    }

    if (datetime === null || isNaN(Date.parse(datetime))) {
        return "-";
    }

    return new Date(datetime).toLocaleString(localeCode);
};

export const getDbDate = (dateTime: Dayjs): string => dateTime.format("YYYY-MM-DD");

export const formatBooleanOrNull = (booleanOrNull: boolean | null): string =>
    booleanOrNull === null ? "" : booleanOrNull ? "True" : "False";

export const formatJson = (json: Json): string => JSON.stringify(json, null, 2);

export const capitaliseWords = (words: string): string =>
    words
        .split(" ")
        .map((word) => (word === "a" ? word : `${word[0].toUpperCase()}${word.slice(1)}`))
        .join(" ");

export const getReadableWebsiteDataName = (name: string): string =>
    name
        .split("_")
        .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
        .join(" ");

export const getParcelOverviewString = (
    addressPostcode: string | null,
    fullName: string | null,
    collectionDatetime: Date | null,
    clientIsActive: boolean
): string => {
    if (clientIsActive) {
        return (
            (addressPostcode ?? displayPostcodeForHomelessClient) +
            (fullName && ` - ${fullName}`) +
            (collectionDatetime ? ` @ ${dayjs(collectionDatetime).format("DD/MM/YYYY")}` : "")
        );
    }
    return (
        displayNameForDeletedClient +
        (collectionDatetime ? ` @ ${dayjs(collectionDatetime).format("DD/MM/YYYY")}` : "")
    );
};

export const formatTimeStringToHoursAndMinutes = (timeString: string): string => {
    dayjs.extend(customParseFormat);
    const dayjsTime = dayjs(timeString, "HH:mm:ss");
    const hours = String(dayjsTime.hour()).padStart(2, "0");
    const minutes = String(dayjsTime.minute()).padStart(2, "0");
    return `${hours}:${minutes}`;
};

export const formatDayjsToHoursAndMinutes = (dayjsTime: Dayjs): string => {
    const hours = String(dayjsTime.hour()).padStart(2, "0");
    const minutes = String(dayjsTime.minute()).padStart(2, "0");
    return `${hours}:${minutes}`;
};
