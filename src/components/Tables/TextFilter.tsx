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

interface ServerSideTextFilterProps<Data, DbData extends Record<string, unknown>> {
    key: keyof Data;
    headers: TableHeaders<Data>;
    label: string;
    initialValue?: string;
    method: ServerSideFilterMethod<DbData, string>;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
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
}: ServerSideTextFilterProps<Data, DbData>): ServerSideFilter<Data, string, DbData> => {
    return {
        state: initialValue,
        initialState: initialValue,
        key: key,
        method: method,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
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
}

export const buildClientSideTextFilter = <Data,>({
    key,
    label,
    initialValue = "",
    method,
    shouldPersistOnClear = false,
    isDisabled = false,
}: ClientSideTextFilterProps<Data>): ClientSideFilter<Data, string> => {
    return {
        state: initialValue,
        initialState: initialValue,
        key: key,
        method: method,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
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
    };
};

export const filterRowByText = <Data,>(row: Data, state: string, key: keyof Data): boolean => {
    let string = defaultToString(row[key]);
    string = string.toLowerCase();
    state = state.toLowerCase();
    return string.includes(state);
};
