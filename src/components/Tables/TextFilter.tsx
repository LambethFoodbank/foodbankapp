import React from "react";
import styled from "styled-components";
import FreeFormTextInput from "../DataInput/FreeFormTextInput";
import {
    ServerSideFilter,
    defaultToString,
    ServerSideFilterMethod,
    ClientSideFilterMethod,
    ClientSideFilter,
} from "./Filters";
import { UrlQueryParamsRecord } from "@/common/urlQueryParams";

interface ServerSideTextFilterProps<Data, DbData extends Record<string, unknown>> {
    key: string;
    rowKey?: keyof Data;
    label: string;
    initialValue?: string;
    method: ServerSideFilterMethod<DbData, string>;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
    isHidden?: boolean;
    isHiddenInUrl?: boolean;
}

const TextFilterStyling = styled.div`
    & input[type="text"].MuiInputBase-input.MuiOutlinedInput-input {
        border: none;
    }
`;

export const buildServerSideTextFilter = <Data, DbData extends Record<string, unknown>>({
    key,
    label,
    initialValue = "",
    method,
    shouldPersistOnClear = false,
    isDisabled = false,
    isHidden = false,
    isHiddenInUrl = false,
}: ServerSideTextFilterProps<Data, DbData>): ServerSideFilter<Data, string, DbData> => {
    return {
        state: initialValue,
        initialState: initialValue,
        key: key,
        method: method,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        isHidden: isHidden,
        isHiddenInUrl: isHiddenInUrl,
        filterComponent: (state, setState, isDisabled) => {
            return isHidden ? null : (
                <TextFilterStyling key={label}>
                    <FreeFormTextInput
                        key={label}
                        value={state}
                        label={label}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setState(event.target.value);
                        }}
                        size="small"
                        disabled={isDisabled}
                        data-testid={`text-filter-${key}`}
                    />
                </TextFilterStyling>
            );
        },
        areStatesIdentical: (stateA, stateB) => stateA === stateB,
        generateUrlParam: function (): UrlQueryParamsRecord {
            const paramRecord: UrlQueryParamsRecord = {};

            if (this.isHiddenInUrl) {
                paramRecord[key as string] = null;
            } else {
                paramRecord[key as string] = this.state as string;
            }
            return paramRecord;
        },
        readStateFromUrlQueryParams: (urlParams: UrlQueryParamsRecord) => {
            const paramVal = urlParams[key as string];
            return paramVal && typeof paramVal == "string" ? paramVal : null;
        },
    };
};

interface ClientSideTextFilterProps<Data> {
    key: string;
    rowKey?: keyof Data;
    label: string;
    initialValue?: string;
    method: ClientSideFilterMethod<Data, string>;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
    isHidden?: boolean;
    isHiddenInUrl?: boolean;
}

export const buildClientSideTextFilter = <Data,>({
    key,
    rowKey,
    label,
    initialValue = "",
    method,
    shouldPersistOnClear = false,
    isDisabled = false,
    isHidden = false,
    isHiddenInUrl = false,
}: ClientSideTextFilterProps<Data>): ClientSideFilter<Data, string> => {
    return {
        state: initialValue,
        initialState: initialValue,
        key: key,
        rowKey: rowKey,
        method: method,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        isHidden: isHidden,
        isHiddenInUrl: isHiddenInUrl,
        filterComponent: (state, setState) => {
            return isHidden ? null : (
                <TextFilterStyling key={label}>
                    <FreeFormTextInput
                        key={label}
                        value={state}
                        label={label}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setState(event.target.value);
                        }}
                        size="small"
                        data-testid={`text-filter-${key}`}
                    />
                </TextFilterStyling>
            );
        },
        areStatesIdentical: (stateA, stateB) => stateA === stateB,
        generateUrlParam: function (): UrlQueryParamsRecord {
            const paramRecord: UrlQueryParamsRecord = {};

            if (this.isHiddenInUrl) {
                paramRecord[key as string] = null;
            } else {
                paramRecord[key as string] = this.state as string;
            }
            return paramRecord;
        },
        readStateFromUrlQueryParams: (urlParams: UrlQueryParamsRecord) => {
            const paramVal = urlParams[key as string];
            return paramVal && typeof paramVal == "string" ? paramVal : null;
        },
    };
};

export const filterRowByText = <Data,>(row: Data, state: string, rowKey?: keyof Data): boolean => {
    if (!rowKey) {
        return false;
    }

    let string = defaultToString(row[rowKey]);
    string = string.toLowerCase();
    state = state.toLowerCase();
    return string.includes(state);
};
