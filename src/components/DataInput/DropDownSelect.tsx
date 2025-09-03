"use client";

import React, { useEffect } from "react";
import {
    MenuItem,
    InputLabel,
    Select,
    FormControl,
    SelectChangeEvent,
    SxProps,
    Theme,
} from "@mui/material";

interface GenericProps<ValueType> {
    labelsAndValues: [string, string][];
    listTitle?: string;
    defaultValue?: ValueType;
    value?: ValueType;
    onChange?: (event: SelectChangeEvent<ValueType>) => void;
    selectLabelId: string;
    focusOnDropdown?: boolean;
    error?: boolean;
    disabled?: boolean;
    sx?: SxProps<Theme>;
}

interface ControlledProps<ValueType> {
    labelsAndValues: [string, string][];
    listTitle?: string;
    value: ValueType;
    onChange: (event: SelectChangeEvent<ValueType>) => void;
    selectLabelId: string;
    focusOnDropdown?: boolean;
    error?: boolean;
    disabled?: boolean;
    sx?: SxProps<Theme>;
}

interface UncontrolledProps<ValueType> {
    labelsAndValues: [string, string][];
    listTitle?: string;
    defaultValue?: ValueType;
    onChange?: (event: SelectChangeEvent<ValueType>) => void;
    selectLabelId: string;
    focusOnDropdown?: boolean;
}

const GenericSelect = <ValueType,>(props: GenericProps<ValueType>): React.ReactElement => {
    const dropdownInputFocusRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        props.focusOnDropdown && dropdownInputFocusRef.current?.focus();
    }, [props.focusOnDropdown]);

    return (
        <FormControl fullWidth sx={props.sx}>
            <InputLabel id={props.selectLabelId}>{props.listTitle}</InputLabel>
            <Select
                defaultValue={props.defaultValue ?? ("" as ValueType)}
                value={props.value ?? undefined}
                onChange={props.onChange}
                labelId={props.selectLabelId}
                label={props.listTitle}
                inputRef={dropdownInputFocusRef}
                error={props.error}
                disabled={props.disabled}
            >
                {props.labelsAndValues.map(([label, value]) => {
                    return (
                        <MenuItem key={value} value={value}>
                            {label}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
};

export const ControlledSelect = <ValueType,>(
    props: ControlledProps<ValueType>
): React.ReactElement => {
    return (
        <GenericSelect
            selectLabelId={props.selectLabelId}
            listTitle={props.listTitle}
            value={props.value}
            labelsAndValues={props.labelsAndValues}
            onChange={props.onChange}
            error={props.error}
            disabled={props.disabled}
            sx={props.sx}
        />
    );
};

export const UncontrolledSelect = <ValueType,>(
    props: UncontrolledProps<ValueType>
): React.ReactElement => {
    return (
        <GenericSelect
            selectLabelId={props.selectLabelId}
            listTitle={props.listTitle}
            defaultValue={props.defaultValue}
            labelsAndValues={props.labelsAndValues}
            onChange={props.onChange}
        />
    );
};
