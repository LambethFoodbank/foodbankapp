"use client";

import React from "react";
import {
    ClientSideFilter,
    ClientSideFilterMethod,
    defaultToString,
    ServerSideFilter,
    ServerSideFilterMethod,
} from "./Filters";
import Button from "@mui/material/Button";
import { capitaliseWords } from "@/common/format";
import { UrlQueryParamsRecord } from "@/common/urlQueryParams";

interface ButtonGroupFilterProps<Data> {
    key: string;
    rowKey?: keyof Data;
    filterLabel: string;
    itemLabelsAndKeys: [string, string][];
    initialActiveFilter: string;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
    isHidden?: boolean;
    isHiddenInUrl?: boolean;
}

interface ServerSideButtonGroupFilterProps<Data, DbData extends Record<string, unknown>>
    extends ButtonGroupFilterProps<Data> {
    method: ServerSideFilterMethod<DbData, string>;
}

interface ClientSideButtonGroupFilterProps<Data> extends ButtonGroupFilterProps<Data> {
    method: ClientSideFilterMethod<Data, string>;
}

interface ButtonProps {
    activeFilter: string;
    buttonLabel: string;
    buttonKey: string;
    setState: (state: string) => void;
    isDisabled?: boolean;
}

const FilterButton: React.FC<ButtonProps> = (buttonProps) => {
    const isActive = buttonProps.activeFilter === buttonProps.buttonKey;
    return (
        <Button
            color="primary"
            variant={isActive ? "contained" : "outlined"}
            onClick={() => buttonProps.setState(buttonProps.buttonKey)}
            disabled={buttonProps.isDisabled}
        >
            {capitaliseWords(buttonProps.buttonLabel)}
        </Button>
    );
};

export const serverSideButtonGroupFilter = <Data, DbData extends Record<string, unknown>>({
    key,
    filterLabel,
    itemLabelsAndKeys,
    initialActiveFilter,
    method,
    shouldPersistOnClear = false,
    isDisabled = false,
    isHidden = false,
    isHiddenInUrl = false,
}: ServerSideButtonGroupFilterProps<Data, DbData>): ServerSideFilter<Data, string, DbData> => {
    return {
        key: key,
        state: initialActiveFilter,
        initialState: initialActiveFilter,
        method: method,
        areStatesIdentical: (stateA, stateB) => stateA === stateB,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        isHidden: isHidden,
        isHiddenInUrl: isHiddenInUrl,
        filterComponent: function (
            state: string,
            setState: (state: string) => void,
            isDisabled: boolean
        ): React.ReactNode {
            return isHidden ? null : (
                <>
                    {filterLabel}
                    {itemLabelsAndKeys.map(([label, key]) => (
                        <FilterButton
                            key={key}
                            activeFilter={state}
                            buttonLabel={label}
                            buttonKey={key}
                            setState={setState}
                            isDisabled={isDisabled}
                        />
                    ))}
                </>
            );
        },
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

export const clientSideButtonGroupFilter = <Data,>({
    key,
    rowKey,
    filterLabel,
    itemLabelsAndKeys,
    initialActiveFilter,
    method,
    shouldPersistOnClear = false,
    isDisabled = false,
    isHidden = false,
    isHiddenInUrl = false,
}: ClientSideButtonGroupFilterProps<Data>): ClientSideFilter<Data, string> => {
    return {
        key: key,
        rowKey: rowKey,
        state: initialActiveFilter,
        initialState: initialActiveFilter,
        method: method,
        areStatesIdentical: (stateA, stateB) => stateA === stateB,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        isHidden: isHidden,
        isHiddenInUrl: isHiddenInUrl,
        filterComponent: function (
            state: string,
            setState: (state: string) => void,
            isDisabled: boolean
        ): React.ReactNode {
            return isHidden ? null : (
                <>
                    {filterLabel}
                    {itemLabelsAndKeys.map(([label, key]) => (
                        <FilterButton
                            key={key}
                            activeFilter={state}
                            buttonLabel={label}
                            buttonKey={key}
                            setState={setState}
                            isDisabled={isDisabled}
                        />
                    ))}
                </>
            );
        },
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

export const filterRowbyButton = <Data,>(
    row: Data,
    state: string,
    rowKey?: keyof Data
): boolean => {
    if (!rowKey) {
        return false;
    }
    return defaultToString(row[rowKey]) === state;
};
