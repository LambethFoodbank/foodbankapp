import { TableHeaders } from "@/components/Tables/Table";
import { EmergencyBagsTableRow } from "./types";

export const emergencyBagTableHeaderKeysAndLabels: TableHeaders<EmergencyBagsTableRow> = [
    ["iconsColumn", ""],
    ["type", "Type"],
    ["amount", "Amount"],
    ["deliveryCollection", "Hub"],
    ["packingDate", "Packing Date"],
    ["lastStatus", "Last Status"],
    ["createdAt", "Created At"],
];

export const emergencyBagTableDefaultShownHeaders: (keyof EmergencyBagsTableRow)[] = [
    "iconsColumn",
    "type",
    "amount",
    "deliveryCollection",
    "packingDate",
    "lastStatus",
];

export const emergencyBagTableToggleableHeaders: (keyof EmergencyBagsTableRow)[] = [
    "type",
    "amount",
    "deliveryCollection",
    "packingDate",
    "lastStatus",
    "createdAt",
];
