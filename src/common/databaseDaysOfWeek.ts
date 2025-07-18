import { Database } from "@/databaseTypesFile";

export type DaysOfWeekType = Database["public"]["Enums"]["day_of_week"] | "";

export const DAYSOFWEEK_ARRAY: DaysOfWeekType[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    "",
] as const;

export type DaysOfWeekLabelsAndValues = [string, string, string, string, string, string, string][];
