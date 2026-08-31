"use client";

import React, { ReactElement, useState } from "react";
import AuthPanel, { AuthLink, AuthMain } from "@/components/AuthPanel";
import { requestPasswordReset } from "@/authentication/requestPasswordReset";

const linksToDisplay: AuthLink[] = [
    {
        label: "Already have an account? Sign in",
        href: "/login",
    },
];

export default function Page(): ReactElement<any> {
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const initiatePasswordResetRequest = (): void => {
        setSuccessMessage(null);
        setErrorMessage(null);

        const redirectUrl = `${window.location.origin}/auth/reset-password`;

        requestPasswordReset({ email, redirectUrl }).then(({ errorMessage }) => {
            if (errorMessage) {
                setErrorMessage(errorMessage);
            } else {
                setSuccessMessage("Check your email for the password reset link");
            }
        });
    };

    return (
        <AuthMain>
            <AuthPanel
                title="Forgot password"
                emailField={{ text: email, setText: setEmail }}
                passwordField={null}
                submitText="Send reset password instructions"
                onSubmit={initiatePasswordResetRequest}
                authLinks={linksToDisplay}
                errorMessage={errorMessage}
                successMessage={successMessage}
            />
        </AuthMain>
    );
}
