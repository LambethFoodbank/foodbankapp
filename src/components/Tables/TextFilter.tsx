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
import { TableHeaders } from "./Table";
import { UrlQueryParamsRecord } from "@/common/urlQueryParams";

interface ServerSideTextFilterProps<Data, DbData extends Record<string, unknown>> {
    key: keyof Data;
    headers: TableHeaders<Data>;
    label: string;
    initialValue?: string;
    method: ServerSideFilterMethod<DbData, string>;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
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
    isHiddenInUrl = false,
}: ServerSideTextFilterProps<Data, DbData>): ServerSideFilter<Data, string, DbData> => {
    return {
        state: initialValue,
        initialState: initialValue,
        key: key,
        method: method,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        isHiddenInUrl: isHiddenInUrl,
        filterComponent: (state, setState, isDisabled) => {
            return (
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
    key: keyof Data;
    headers: TableHeaders<Data>;
    label: string;
    initialValue?: string;
    method: ClientSideFilterMethod<Data, string>;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
    isHiddenInUrl?: boolean;
}

export const buildClientSideTextFilter = <Data,>({
    key,
    label,
    initialValue = "",
    method,
    shouldPersistOnClear = false,
    isDisabled = false,
    isHiddenInUrl = false,
}: ClientSideTextFilterProps<Data>): ClientSideFilter<Data, string> => {
    return {
        state: initialValue,
        initialState: initialValue,
        key: key,
        method: method,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        isHiddenInUrl: isHiddenInUrl,
        filterComponent: (state, setState) => {
            return (
                <TextFilterStyling key={label}>
                    <FreeFormTextInput
                        key={label}
                        value={state}
                        label={label}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setState(event.target.value);
                        }}
                        size="small"
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

export const filterRowByText = <Data,>(row: Data, state: string, key: keyof Data): boolean => {
    let string = defaultToString(row[key]);
    string = string.toLowerCase();
    state = state.toLowerCase();
    return string.includes(state);
};
