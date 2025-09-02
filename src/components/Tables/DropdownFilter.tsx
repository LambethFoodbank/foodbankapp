import React from "react";
import { ClientSideFilter, ClientSideFilterMethod } from "./Filters";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { UrlQueryParamsRecord } from "@/common/urlQueryParams";

interface DropdownFilterProps<Data> {
    key: string;
    rowKey?: keyof Data;
    label: string; // label displayed above the select
    itemLabelsAndKeys: [string, string][];
    initialSelected: string;
    method: ClientSideFilterMethod<Data, string>;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
    isHidden?: boolean;
    isHiddenInUrl?: boolean;
}

export const clientSideDropdownFilter = <Data,>({
    key,
    rowKey,
    label,
    itemLabelsAndKeys,
    initialSelected,
    method,
    shouldPersistOnClear = false,
    isDisabled = false,
    isHidden = false,
    isHiddenInUrl = false,
}: DropdownFilterProps<Data>): ClientSideFilter<Data, string> => {
    return {
        key: key,
        rowKey: rowKey,
        state: initialSelected,
        initialState: initialSelected,
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
            if (isHidden) {
                return null;
            }
            return (
                <FormControl size="small" sx={{ minWidth: 120 }} disabled={isDisabled}>
                    <InputLabel id={`${key}-label`}>{label}</InputLabel>
                    <Select
                        labelId={`${key}-label`}
                        value={state}
                        label={label}
                        onChange={(event) => setState(event.target.value as string)}
                    >
                        {itemLabelsAndKeys.map(([itemLabel, itemKey]) => (
                            <MenuItem key={itemKey} value={itemKey}>
                                {itemLabel}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
