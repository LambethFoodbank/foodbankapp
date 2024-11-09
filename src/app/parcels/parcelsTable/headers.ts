import { TableHeaders } from "@/components/Tables/Table";
import { ParcelsTableRow } from "./types";

export const parcelTableHeaderKeysAndLabels: TableHeaders<ParcelsTableRow> = [
    ["iconsColumn", ""],
    ["fullName", "Name"],
    ["familyCategory", "Family"],
    ["addressPostcode", "Postcode"],
    ["phoneNumber", "Phone"],
    ["voucherNumber", "Voucher"],
    ["deliveryCollection", "Method"],
    ["packingDate", "Packing Date"],
    ["packingSlot", "Packing Slot"],
    ["lastStatus", "Last Status"],
    ["createdAt", "Created At"],
];

export const parcelTableDefaultShownHeaders: (keyof ParcelsTableRow)[] = [
    "iconsColumn",
    "fullName",
    "familyCategory",
    "addressPostcode",
    "deliveryCollection",
    "packingDate",
    "packingSlot",
    "lastStatus",
];

export const parcelTableToggleableHeaders: (keyof ParcelsTableRow)[] = [
    "fullName",
    "familyCategory",
    "addressPostcode",
    "phoneNumber",
    "voucherNumber",
    "deliveryCollection",
    "packingDate",
    "packingSlot",
    "lastStatus",
    "createdAt",
];
