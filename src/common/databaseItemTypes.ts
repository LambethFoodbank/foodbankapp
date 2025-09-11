import { Database } from "@/databaseTypesFile";

export type ItemType = Database["public"]["Enums"]["item_type"];

export const itemTypeLabels = {
    regular_food: "Regular Food",
    alternative_food: "Alternative Food",
    choice_food: "Item with Options",
    pet_food: "Pet Food",
    hygiene_product: "Hygiene Product",
    baby_product: "Baby Product",
    seasonal_product: "Seasonal Product",
    others: "Others",
};
