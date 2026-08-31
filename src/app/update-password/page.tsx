"use client";

import React, { ReactElement, useState } from "react";
import AuthPanel, { AuthMain } from "@/components/AuthPanel";
import { updatePassword } from "@/authentication/updatePassword";
import { useRouter } from "next/navigation";

export default function Page(): ReactElement<any> {
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const initiatePasswordUpdate = (): void => {
        setErrorMessage(null);

        updatePassword(password).then(({ errorMessage }) => {
            if (errorMessage) {
                setErrorMessage(errorMessage);
            } else {
                router.push("/");
            }
        });
    };

    return (
        <AuthMain>
            <AuthPanel
                title="Update password"
                emailField={null}
                passwordField={{ text: password, setText: setPassword }}
                submitText="Update password"
                onSubmit={initiatePasswordUpdate}
                errorMessage={errorMessage}
                successMessage={null}
            />
        </AuthMain>
    );
}
