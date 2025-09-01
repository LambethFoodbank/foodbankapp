import { DefaultTheme } from "styled-components";
import { ParcelsTableRow } from "./types";
import { BreakPointConfig } from "@/components/Tables/Table";

export type DividingLineStyleOptions = {
    dateAndSlotPrimary: DividingLineStyle;
    dateAndSlotSecondary: DividingLineStyle;
    slotPrimary: DividingLineStyle;
};

type DividingLineStyle = {
    colour: string;
    thickness: string;
};

const getRowBoundaries = (columnValues: (string | number | null)[]): number[] => {
    const boundaries: number[] = [];

    columnValues.forEach((columnValue, index) => {
        const previousIndex = index - 1 >= 0 ? index - 1 : 0;
        if (columnValue !== columnValues[previousIndex]) {
            boundaries.push(index);
        }
    });
    return boundaries;
};

const searchForPackingSlotBreakPoints = (parcelsTableRows: ParcelsTableRow[]): number[] => {
    const packingSlotValues = parcelsTableRows.map((row) => row.packingSlot);
    return getRowBoundaries(packingSlotValues);
};

const searchForPackingDateBreakPoints = (parcelsTableRows: ParcelsTableRow[]): number[] => {
    const packingSlotValues = parcelsTableRows.map((row) => row.packingDate?.getDate() ?? null);
    return getRowBoundaries(packingSlotValues);
};

export const searchForBreakPoints = (
    headerKey: keyof ParcelsTableRow,
    parcelsTableRows: ParcelsTableRow[]
): BreakPointConfig[] => {
    switch (headerKey) {
        case "packingSlot": {
            return [
                {
                    name: "packingSlot",
                    breakPoints: searchForPackingSlotBreakPoints(parcelsTableRows),
                    dividingLineStyle: "slotPrimary",
                },
            ];
        }
        case "packingDate": {
            return [
                {
                    name: "packingDate",
                    breakPoints: searchForPackingDateBreakPoints(parcelsTableRows),
                    dividingLineStyle: "dateAndSlotPrimary",
                },
                {
                    name: "packingSlot",
                    breakPoints: searchForPackingSlotBreakPoints(parcelsTableRows),
                    dividingLineStyle: "dateAndSlotSecondary",
                },
            ];
        }
        default:
            return [];
    }
};

export const getDividingLineStyleOptions = (theme: DefaultTheme): DividingLineStyleOptions => {
    return {
        dateAndSlotPrimary: {
            colour: theme.primary.background[3],
            thickness: "7pt",
        },
        dateAndSlotSecondary: {
            colour: theme.primary.background[2],
            thickness: "4pt",
        },
        slotPrimary: {
            colour: theme.primary.background[3],
            thickness: "7pt",
        },
    };
};
