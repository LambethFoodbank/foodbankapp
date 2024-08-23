import { areDaysIdentical } from "@/components/Tables/DateFilter";
import { ParcelsFilter, ParcelsTableRow } from "./types";
import dayjs from "dayjs";
import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";

export const shouldBeInPackingManagerView = (
    parcel: ParcelsTableRow,
    today: dayjs.Dayjs,
    yesterday: dayjs.Dayjs
): boolean => {
    if (areDaysIdentical(dayjs(parcel.packingDate), today) && parcel.packingSlot !== "AM") {
        return false;
    }
    if (areDaysIdentical(dayjs(parcel.packingDate), yesterday) && parcel.packingSlot !== "PM") {
        return false;
    }
    if (!parcel.allStatuses) {
        return false;
    }
    if (parcel.allStatuses.includes("Out for Delivery")) {
        return false;
    }
    if (
        parcel.allStatuses.includes("Shipping Labels Downloaded") &&
        parcel.allStatuses.includes("Shopping List Downloaded") &&
        parcel.allStatuses.includes("Called and Confirmed")
    ) {
        return true;
    }
    return false;
};

export const shouldFilterBeDisabled = (
    filter: ParcelsFilter<string> | ParcelsFilter<DateRangeState> | ParcelsFilter<string[]>
): boolean => {
    if (
        filter.key === "packingDate" ||
        filter.key === "packingSlot" ||
        filter.key === "lastStatus"
    ) {
        return true;
    }
    return false;
};
