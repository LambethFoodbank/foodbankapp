"use client";

import React from "react";
import CheckboxGroupPopup from "../DataInput/CheckboxGroupPopup";
import { ServerSideFilter, ServerSideFilterMethod } from "./Filters";
import { UrlQueryParamsRecord, readArrayParamFromQuery } from "@/common/urlQueryParams";

interface ChecklistFilterProps<
    Data,
    DbData extends Record<string, unknown> = Record<string, never>,
> {
    key: string;
    rowKey?: keyof Data;
    filterLabel: string;
    itemLabelsAndKeys: [string, string][];
    initialCheckedKeys: string[];
    method: ServerSideFilterMethod<DbData, string[]>;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
    isHidden?: boolean;
    isHiddenInUrl?: boolean;
    isRadio?: boolean;
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
    isHidden = false,
    isHiddenInUrl = false,
    isRadio = false,
}: ChecklistFilterProps<Data, DbData>): ServerSideFilter<Data, string[], DbData> => {
    return {
        key: key,
        state: initialCheckedKeys,
        initialState: initialCheckedKeys,
        method,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        isHidden: isHidden,
        isHiddenInUrl: isHiddenInUrl,
        areStatesIdentical: (stateA, stateB) =>
            stateA.length === stateB.length && stateA.every((optionA) => stateB.includes(optionA)),
        filterComponent: function (
            state: string[],
            setState: (state: string[]) => void,
            isDisabled: boolean
        ): React.ReactNode {
            if (isHidden) {
                return null;
            }

            const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
                const checkboxKey = event.target.name as string;
                if (event.target.checked) {
                    if (isRadio && anySelected()) {
                        state.pop();
                    }
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
        generateUrlParam: function (): UrlQueryParamsRecord {
            const paramRecord: UrlQueryParamsRecord = {};

            if (this.isHiddenInUrl) {
                paramRecord[key as string] = null;
            } else {
                paramRecord[key as string] = this.state as string[];
            }
            return paramRecord;
        },
        readStateFromUrlQueryParams: (urlParams: UrlQueryParamsRecord) => {
            const paramArray = readArrayParamFromQuery(urlParams, key as string);
            return paramArray && Array.isArray(paramArray) ? paramArray : null;
        },
    };
};
