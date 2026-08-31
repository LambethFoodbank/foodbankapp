"use client";

import AuthPanel, { AuthLink, AuthMain } from "@/components/AuthPanel";
import React, { ReactElement, useState } from "react";
import { signInWithPassword } from "@/authentication/signIn";
import { AuthError } from "@supabase/gotrue-js";

const linksToDisplay: AuthLink[] = [
    {
        label: "Forgot your password?",
        href: "/forgot-password",
    },
];

export default function Login(): ReactElement<any> {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const initiateSignIn = async (): Promise<void> => {
        setErrorMessage(null);
        try {
            await signInWithPassword({ email, password });
        } catch (error) {
            if (error instanceof AuthError) {
                setErrorMessage(error.message);
            }
        }
    };

    return (
        <AuthMain>
            <AuthPanel
                title="Login"
                emailField={{ text: email, setText: setEmail }}
                passwordField={{ text: password, setText: setPassword }}
                submitText="Sign in"
                onSubmit={initiateSignIn}
                authLinks={linksToDisplay}
                errorMessage={errorMessage}
                successMessage={null}
            />
        </AuthMain>
    );
}
