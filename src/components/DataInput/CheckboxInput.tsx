"use client";

import React from "react";
import { Checkbox, FormControl, FormControlLabel } from "@mui/material";

interface Props {
    label?: string;
    checked?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxInput: React.FC<Props> = (props) => {
    return (
        <FormControl>
            <FormControlLabel
                label={props.label}
                control={<Checkbox checked={props.checked} onChange={props.onChange} />}
            />
        </FormControl>
    );
};

export default CheckboxInput;
