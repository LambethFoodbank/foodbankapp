"use client";

import React from "react";
import CheckboxGroupPopup from "../DataInput/CheckboxGroupPopup";
import { ServerSideFilter, ServerSideFilterMethod } from "./Filters";

interface ChecklistFilterProps<
    Data,
    DbData extends Record<string, unknown> = Record<string, never>,
> {
    key: keyof Data;
    filterLabel: string;
    itemLabelsAndKeys: [string, string][];
    initialCheckedKeys: string[];
    method: ServerSideFilterMethod<DbData, string[]>;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
}

export const serverSideChecklistFilter = <
    Data,
    DbData extends Record<string, unknown> = Record<string, never>,
>({
    key,
    filterLabel,
    itemLabelsAndKeys,
    initialCheckedKeys,
    method,
    shouldPersistOnClear = false,
    isDisabled = false,
}: ChecklistFilterProps<Data, DbData>): ServerSideFilter<Data, string[], DbData> => {
    return {
        key: key,
        state: initialCheckedKeys,
        initialState: initialCheckedKeys,
        method,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        areStatesIdentical: (stateA, stateB) =>
            stateA.length === stateB.length && stateA.every((optionA) => stateB.includes(optionA)),
        filterComponent: function (
            state: string[],
            setState: (state: string[]) => void,
            isDisabled: boolean
        ): React.ReactNode {
            const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
                const checkboxKey = event.target.name as string;
                if (event.target.checked) {
                    setState([...state, checkboxKey]);
                } else {
                    setState(state.filter((shownKey) => shownKey !== checkboxKey));
                }
            };

            const anySelected = (): boolean => {
                return state.length > 0;
            };

            return (
                <CheckboxGroupPopup
                    key={filterLabel}
                    labelsAndKeys={itemLabelsAndKeys}
                    checkedKeys={state}
                    buttonLabel={filterLabel}
                    onChange={onChangeCheckbox}
                    anySelected={anySelected}
                    isDisabled={isDisabled}
                />
            );
        },
    };
};
