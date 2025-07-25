import { TableHeaders } from "@/components/Tables/Table";
import { ParcelsTableRow } from "./types";

export const parcelTableHeaderKeysAndLabels: TableHeaders<ParcelsTableRow> = [
    ["iconsColumn", ""],
    ["fullName", "Name"],
    ["familyCategory", "Family Size"],
    ["addressColumn", "Postcode"],
    ["phoneNumber", "Phone"],
    ["email", "Email"],
    ["voucherNumber", "Voucher"],
    ["referralAgency", "Referral Agency"],
    ["referrerName", "Referrer Name"],
    ["referrerEmail", "Referrer Email"],
    ["referrerPhone", "Referrer Phone"],
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
    "addressColumn",
    "deliveryCollection",
    "packingDate",
    "packingSlot",
    "lastStatus",
];

export const parcelTableToggleableHeaders: (keyof ParcelsTableRow | "Referral Details")[] = [
    "fullName",
    "familyCategory",
    "addressColumn",
    "phoneNumber",
    "email",
    "voucherNumber",
    "Referral Details",
    "deliveryCollection",
    "packingDate",
    "packingSlot",
    "lastStatus",
    "createdAt",
];
