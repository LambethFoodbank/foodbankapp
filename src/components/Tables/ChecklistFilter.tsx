import React from "react";
import CheckboxGroupPopup from "../DataInput/CheckboxGroupPopup";
import {
    ClientSideFilter,
    ClientSideFilterMethod,
    ServerSideFilter,
    ServerSideFilterMethod,
} from "./Filters";
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
}

interface ClientSideChecklistFilterProps<Data> {
    key: string;
    rowKey?: keyof Data;
    filterLabel: string;
    itemLabelsAndKeys: [string, string][];
    initialCheckedKeys: string[];
    method: ClientSideFilterMethod<Data, string[]>;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
    isHidden?: boolean;
    isHiddenInUrl?: boolean;
}

const areStringArrayStatesIdentical = (stateA: string[], stateB: string[]): boolean => {
    if (!stateA || !stateB) {
        return stateA === stateB;
    }

    if (stateA.length !== stateB.length) {
        return false;
    }

    if (stateA.length === 0) {
        return true;
    }

    const sortedA = [...stateA].sort();
    const sortedB = [...stateB].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
};

const generateChecklistUrlParam = (
    key: string,
    isHiddenInUrl: boolean,
    state: string[]
): UrlQueryParamsRecord => {
    const paramRecord: UrlQueryParamsRecord = {};
    if (isHiddenInUrl) {
        paramRecord[key] = null;
    } else {
        paramRecord[key] = state;
    }
    return paramRecord;
};

const readChecklistStateFromUrlParams = (
    urlParams: UrlQueryParamsRecord,
    key: string
): string[] | null => {
    const paramArray = readArrayParamFromQuery(urlParams, key);
    return paramArray && Array.isArray(paramArray) ? paramArray : null;
};

type ChecklistFilterUIProps = {
    filterLabel: string;
    itemLabelsAndKeys: [string, string][];
    state: string[];
    setState: (state: string[]) => void;
    isDisabled: boolean;
    isHidden: boolean;
};

const ChecklistFilterUI: React.FC<ChecklistFilterUIProps> = ({
    filterLabel,
    itemLabelsAndKeys,
    state,
    setState,
    isDisabled,
    isHidden,
}) => {
    if (isHidden) {
        return null;
    }

    const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const checkboxKey = event.target.name as string;
        if (event.target.checked) {
            setState([...state, checkboxKey]);
        } else {
            setState(state.filter((shownKey) => shownKey !== checkboxKey));
        }
    };

    const anySelected = (): boolean => state.length > 0;

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
};

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
        areStatesIdentical: areStringArrayStatesIdentical,
        filterComponent: function (
            state: string[],
            setState: (state: string[]) => void,
            isDisabled: boolean
        ): React.ReactNode {
            return (
                <ChecklistFilterUI
                    filterLabel={filterLabel}
                    itemLabelsAndKeys={itemLabelsAndKeys}
                    state={state}
                    setState={setState}
                    isDisabled={isDisabled}
                    isHidden={isHidden}
                />
            );
        },
        generateUrlParam: function (): UrlQueryParamsRecord {
            return generateChecklistUrlParam(key as string, this.isHiddenInUrl, this.state);
        },
        readStateFromUrlQueryParams: (urlParams: UrlQueryParamsRecord) =>
            readChecklistStateFromUrlParams(urlParams, key as string),
    };
};

export const clientSideChecklistFilter = <Data,>({
    key,
    rowKey,
    filterLabel,
    itemLabelsAndKeys,
    initialCheckedKeys,
    method,
    shouldPersistOnClear = false,
    isDisabled = false,
    isHidden = false,
    isHiddenInUrl = false,
}: ClientSideChecklistFilterProps<Data>): ClientSideFilter<Data, string[]> => {
    return {
        key: key,
        rowKey: rowKey,
        state: initialCheckedKeys,
        initialState: initialCheckedKeys,
        method: method,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        isHidden: isHidden,
        isHiddenInUrl: isHiddenInUrl,
        areStatesIdentical: areStringArrayStatesIdentical,
        filterComponent: function (
            state: string[],
            setState: (state: string[]) => void,
            isDisabled: boolean
        ): React.ReactNode {
            return (
                <ChecklistFilterUI
                    filterLabel={filterLabel}
                    itemLabelsAndKeys={itemLabelsAndKeys}
                    state={state}
                    setState={setState}
                    isDisabled={isDisabled}
                    isHidden={isHidden}
                />
            );
        },
        generateUrlParam: function (): UrlQueryParamsRecord {
            return generateChecklistUrlParam(key as string, this.isHiddenInUrl, this.state);
        },
        readStateFromUrlQueryParams: (urlParams: UrlQueryParamsRecord) =>
            readChecklistStateFromUrlParams(urlParams, key as string),
    };
};
