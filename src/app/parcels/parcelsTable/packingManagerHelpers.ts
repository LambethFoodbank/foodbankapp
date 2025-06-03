import { ParcelsFilter } from "./types";
import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import { pageViewTypeQueryParam } from "@/common/constants";

export const packingManagerParcelStatuses = [
    "Shipping Labels Downloaded",
    "Shopping List Downloaded",
    "Called and Confirmed",
];

export const shouldFilterBeDisabledInPackingManagerView = (
    filter: ParcelsFilter<string> | ParcelsFilter<DateRangeState> | ParcelsFilter<string[]>
): boolean => {
    if (
        filter.key === "packingDate" ||
        filter.key === "packingSlot" ||
        filter.key === "lastStatus" ||
        filter.key === pageViewTypeQueryParam
    ) {
        return true;
    }
    return false;
};
