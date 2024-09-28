import React from "react";
import styled from "styled-components";
import {
    Alert,
    AlertColor,
    AlertPropsColorOverrides,
    AlertPropsVariantOverrides,
} from "@mui/material";
import { OverridableStringUnion } from "@mui/types";

interface Props {
    message?: string;
    severity?: OverridableStringUnion<AlertColor, AlertPropsColorOverrides>;
    variant?: OverridableStringUnion<
        "standard" | "filled" | "outlined",
        AlertPropsVariantOverrides
    >;
}

const FixedToastContainer = styled.div`
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 100;
`;

const FixedToast: React.FC<Props> = ({ message, severity, variant }) => {
    return (
        <FixedToastContainer>
            <Alert severity={severity} variant={variant}>
                {message}
            </Alert>
        </FixedToastContainer>
    );
};

export default FixedToast;
