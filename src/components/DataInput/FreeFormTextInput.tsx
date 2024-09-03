"use client";

import React from "react";
import { TextField } from "@mui/material";
interface Props {
    id?: string;
    label?: string;
    defaultValue?: string;
    type?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
    helperText?: string;
    value?: string;
    multiline?: boolean;
    maxRows?: number;
    minRows?: number;
    className?: string;
    fullWidth?: boolean;
    margin?: "dense" | "normal" | "none";
    isDisabled?: boolean;
    tabIndex?: number;
}

const FreeFormTextInput = React.forwardRef<HTMLInputElement, Props>((props, focusRef) => {
    return (
        <TextField
            {...props}
            inputRef={focusRef}
            disabled={props.isDisabled}
            tabIndex={props.tabIndex}
        />
    );
});
export default FreeFormTextInput;

FreeFormTextInput.displayName = "FreeFormTextInput";
