"use client";

import React from "react";
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel } from "@mui/material";

interface Props {
    checkedKeys?: string[];
    defaultCheckedKeys?: string[];
    labelsAndKeys: [string, string][];
    groupLabel?: string;
    disabled?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxGroupInput: React.FC<Props> = (props) => {
    return (
        <FormControl disabled={!!props.disabled}>
            {props.groupLabel && <FormLabel>{props.groupLabel}</FormLabel>}
            <FormGroup>
                {props.labelsAndKeys.map(([label, key]) => {
                    return (
                        <FormControlLabel
                            key={key}
                            label={label}
                            control={
                                <Checkbox
                                    name={key}
                                    onChange={props.onChange}
                                    checked={
                                        props.checkedKeys
                                            ? props.checkedKeys.includes(key)
                                            : undefined
                                    }
                                    defaultChecked={
                                        props.defaultCheckedKeys
                                            ? props.defaultCheckedKeys.includes(key)
                                            : undefined
                                    }
                                    data-testid={`option-${key}`}
                                />
                            }
                        />
                    );
                })}
            </FormGroup>
        </FormControl>
    );
};

export default CheckboxGroupInput;
