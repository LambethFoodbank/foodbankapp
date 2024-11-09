"use client";

import React, { useState } from "react";
import { InputAdornment, TextField, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface Props {
    label?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
    helperText?: string;
}

const PasswordInput: React.FC<Props> = (props) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = (): void => {
        setShowPassword((isShown) => !isShown);
    };

    return (
        <TextField
            type={showPassword ? "text" : "password"}
            label={props.label}
            value={props.value}
            onChange={props.onChange}
            variant="outlined"
            error={props.error}
            helperText={props.helperText}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="Toggle password visibility"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};
export default PasswordInput;
