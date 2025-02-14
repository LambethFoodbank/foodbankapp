import { BooleanGroup } from "@/components/DataInput/inputHandlerFactories";
import {
    BatchDataRow,
    BatchTableDataState,
    OverrideClient,
    OverrideDataRow,
    ParcelData,
    clientOverrideCellValueType,
    parcelOverrideCellValueType,
} from "@/app/batch-create/types";

export const getOverridenFieldsAndValues = (
    allFields: OverrideClient | ParcelData
): (
    | { field: string; value: clientOverrideCellValueType }
    | { field: string; value: parcelOverrideCellValueType }
)[] => {
    return Object.entries(allFields)
        .filter(([_, value]) => value)
        .reduce(
            (acc, [key, value]) => {
                return [...acc, { field: key, value: value }];
            },
            [] as (
                | { field: string; value: clientOverrideCellValueType }
                | { field: string; value: parcelOverrideCellValueType }
            )[]
        );
};

export function createBooleanGroupFromStrings(strings: string[] | null): BooleanGroup {
    const result: BooleanGroup = {};
    if (strings) {
        strings.forEach((str) => {
            result[str] = true;
        });
    }
    return result;
}

export const getRowToBeUpdated = (
    rowId: number,
    state: BatchTableDataState
): BatchDataRow | OverrideDataRow | undefined => {
    return rowId === 0
        ? state.overrideDataRow
        : state.batchDataRows.find((row) => row.id === rowId);
};
