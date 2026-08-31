"use client";
import React, { useState } from "react";
import Button from "@mui/material/Button";
import {
    ErrorCenterer,
    ErrorPanel,
    ErrorLargeText,
    ErrorSecondaryText,
    ErrorRetryText,
} from "@/app/errorStylingandMessages";

interface ErrorProps {
    error: Error;
    reset: () => void;
}

const ErrorPage: React.FC<ErrorProps> = ({ error, reset }) => {
    const [ErrorMessage, SetErrorMessage] = useState("");

    const retry = (): void => {
        SetErrorMessage("Retrying...");
        setTimeout(() => {
            reset();
        }, 1000);
    };
    return (
        <ErrorCenterer>
            <ErrorPanel elevation={5}>
                <ErrorLargeText>OOPS!</ErrorLargeText>
                <ErrorSecondaryText>{error.message}</ErrorSecondaryText>
                <Button variant="outlined" onClick={retry}>
                    Try again
                </Button>
                <ErrorRetryText>{ErrorMessage}</ErrorRetryText>
            </ErrorPanel>
        </ErrorCenterer>
    );
};

export default ErrorPage;
