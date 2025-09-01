import { TableHeaders, ToggleableColumnGroup } from "@/components/Tables/materialTable/tableTypes";
import { ParcelsTableRow } from "./types";

export const parcelTableHeaderKeysAndLabels: TableHeaders<ParcelsTableRow> = [
    ["iconsColumn", ""],
    ["fullName", "Name"],
    ["familyCategory", "Family Size"],
    ["addressPostcode", "Postcode"],
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
    "email",
    "voucherNumber",
    "deliveryCollection",
    "packingDate",
    "packingSlot",
    "lastStatus",
    "createdAt",
];

export const parcelTableColumnGroups: ToggleableColumnGroup[] = [
    {
        commonLabel: "Referral Details",
        commonKey: "referralDetails",
        columnNames: ["referralAgency", "referrerName", "referrerEmail", "referrerPhone"],
    },
];

export const parcelColumnGroups: ToggleableColumnGroup[] = [
    {
        commonLabel: "Referral Details",
        commonKey: "referralDetails",
        columnNames: ["referralAgency", "referrerName", "referrerEmail", "referrerPhone"],
    },
];
