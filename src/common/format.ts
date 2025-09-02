import { Json } from "@/databaseTypesFile";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { BooleanGroup } from "@/components/DataInput/inputHandlerFactories";

const localeCode = "en-GB";

const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: "short",
    timeStyle: "short",
};

export const displayPostcodeForHomelessClient = "NFA";

export const displayNameForDeletedClient = "Deleted Client";

export const displayNameForNullDriverName = "Unknown Driver";

export const phoneNumberFormatSymbolsRegex = /[\s-()]/g;
// Following characters excluded from regex as are removed before checking format matches: ( ) - \s
export const phoneNumberRegex = /^((0|\+44)\d{9,11}|\+(?!44)\d{7,15})?$/;

export const emailFormatSymbolsRegex = /[\s]/g;
export const emailRegex = /^\S+@\S+$/;

export const formatPhoneNumber = (value: string): string => {
    const numericInput = value.replace(/(\D)/g, "");
    if (!numericInput) {
        return "";
    }
    return numericInput[0] === "0" ? "+44" + numericInput.slice(1) : "+" + numericInput;
};

export const formatEmail = (value: string): string => {
    return value.toLowerCase();
};

export const formatCamelCaseKey = (objectKey: string): string => {
    const withSpace = objectKey.replaceAll(/([a-z])([A-Z])/g, "$1 $2");
    return withSpace.toUpperCase();
};

export const toSnakeCase = (str: string): string =>
    str
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/[\s-]+/g, "_")
        .toLowerCase();

export const displayList = (data: string[]): string => {
    return data.length === 0 ? "None" : data.join(", ");
};

export const formatAddress = (
    addressLine1: string | null,
    addressLine2: string | null,
    addressTown: string | null,
    addressCounty: string | null,
    addressPostcode: string | null,
    useNewlines = true
): string => {
    if (!addressPostcode) {
        return displayPostcodeForHomelessClient;
    }

    const delimiter = useNewlines ? "\n" : ", ";

    return [addressLine1, addressLine2, addressTown, addressCounty, addressPostcode]
        .filter((value) => value !== null && value !== "")
        .join(delimiter);
};

export const formatDate = (date: Date): string => {
    return date.toLocaleString(localeCode, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });
};

export const formatTodayAsDate = (): string => {
    return formatDate(new Date());
};

export const formatDateStringAsDate = (dateString: string | null): string => {
    if (dateString === null) {
        return "";
    }
    return formatDate(new Date(dateString));
};

export const formatTimestampAsDatetime = (timestamp: number): string => {
    if (isNaN(timestamp)) {
        return "-";
    }

    return new Date(timestamp).toLocaleString(localeCode, dateTimeFormatOptions);
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
        return datetime.toLocaleString(localeCode, dateTimeFormatOptions);
    }

    if (datetime === null || isNaN(Date.parse(datetime))) {
        return "-";
    }

    return new Date(datetime).toLocaleString(localeCode, dateTimeFormatOptions);
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

export const formatAdditionalPhoneNumbers = (
    primaryPhoneNumber: string | null,
    additionalPhoneNumbers: string[] | null,
    documentName?: string
): string => {
    if (primaryPhoneNumber === null || primaryPhoneNumber.length === 0) {
        if (documentName !== null) {
            return "";
        }
        return "None";
    }

    if (additionalPhoneNumbers) {
        const allPhoneNumbers: string[] = [primaryPhoneNumber, ...additionalPhoneNumbers];
        if (documentName === "ShippingLabels") {
            return allPhoneNumbers.slice(0, 3).join(", ");
        }
        return allPhoneNumbers.join(", ");
    }
    return primaryPhoneNumber;
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

export const arrayToBooleanGroup = (data: string[]): BooleanGroup => {
    const reverted: BooleanGroup = {};
    data.forEach((value) => (reverted[value] = true));
    return reverted;
};
