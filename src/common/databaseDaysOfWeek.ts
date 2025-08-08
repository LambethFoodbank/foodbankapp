import { Database } from "@/databaseTypesFile";

export type DaysOfWeekType = Database["public"]["Enums"]["day_of_week"] | "";

export const DAYSOFWEEK_ARRAY: DaysOfWeekType[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "",
] as const;
