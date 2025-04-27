"use client";

import React from "react";
import { ClientSideFilter, ClientSideFilterMethod, defaultToString } from "./Filters";
import Button from "@mui/material/Button";
import { capitaliseWords } from "@/common/format";
import { UrlQueryParamsRecord } from "@/common/urlQueryParams";

interface ButtonGroupFilterProps<Data> {
    key: keyof Data;
    filterLabel: string;
    filterOptions: string[];
    initialActiveFilter: string;
    method: ClientSideFilterMethod<Data, string>;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
    isHiddenInUrl?: boolean;
}

interface ButtonProps {
    activeFilter: string;
    buttonLabel: string;
    setState: (state: string) => void;
    isDisabled?: boolean;
}

const FilterButton: React.FC<ButtonProps> = (buttonProps) => {
    const isActive = buttonProps.activeFilter === buttonProps.buttonLabel;
    return (
        <Button
            color="primary"
            variant={isActive ? "contained" : "outlined"}
            onClick={() => buttonProps.setState(buttonProps.buttonLabel)}
            disabled={buttonProps.isDisabled}
        >
            {capitaliseWords(buttonProps.buttonLabel)}
        </Button>
    );
};

export const buttonGroupFilter = <Data,>({
    key,
    filterLabel,
    filterOptions,
    initialActiveFilter,
    method,
    shouldPersistOnClear = false,
    isDisabled = false,
    isHiddenInUrl = false,
}: ButtonGroupFilterProps<Data>): ClientSideFilter<Data, string> => {
    return {
        key: key,
        state: initialActiveFilter,
        initialState: initialActiveFilter,
        method: method,
        areStatesIdentical: (stateA, stateB) => stateA === stateB,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        isHiddenInUrl: isHiddenInUrl,
        filterComponent: function (
            state: string,
            setState: (state: string) => void,
            isDisabled: boolean
        ): React.ReactNode {
            return (
                <>
                    {filterLabel}
                    {filterOptions.map((optionName) => (
                        <FilterButton
                            key={optionName}
                            activeFilter={state}
                            buttonLabel={optionName}
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

export const filterRowbyButton = <Data,>(row: Data, state: string, key: keyof Data): boolean => {
    return defaultToString(row[key]) === state;
};
