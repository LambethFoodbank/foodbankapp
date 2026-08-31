"use client";

import React, { ReactElement, useEffect, useRef, useState } from "react";
import AuthPanel, { AuthMain } from "@/components/AuthPanel";
import { updatePassword } from "@/authentication/updatePassword";
import { useRouter } from "next/navigation";
import { signInWithTokens } from "@/authentication/signIn";
import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AuthError } from "@supabase/gotrue-js";

export default function Page(): ReactElement<any> {
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const accessToken = useRef<string | null>(null);
    const refreshToken = useRef<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        (async () => {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const errorCode = hashParams.get("error_code");
            const errorDescription = hashParams.get("error_description");

            accessToken.current = hashParams.get("access_token");
            refreshToken.current = hashParams.get("refresh_token");

            let localErrorString = "";
            if (errorCode && errorCode.startsWith("4")) {
                localErrorString = "An error has occurred";
                if (errorDescription) {
                    localErrorString += ": " + errorDescription;
                }
            }

            if (!accessToken.current) {
                void logErrorReturnLogId("Failed to validate new user: no access token");
                if (localErrorString === "") {
                    localErrorString = "An error has occurred. Please contact the admin.";
                }
            }
            if (!refreshToken.current) {
                void logErrorReturnLogId("Failed to validate new user: no refresh token");
                if (localErrorString === "") {
                    localErrorString = "An error has occurred. Please contact the admin.";
                }
            }

            if (localErrorString !== "") {
                setErrorMessage(localErrorString);
                return;
            }

            const supabase = createClientComponentClient();
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                void logInfoReturnLogId(
                    "Session already exists when the invite link is visited. Logging the user out."
                );
                await supabase.auth.signOut();
            }
        })();
    }, [router]);

    const initiatePasswordUpdate = async (): Promise<void> => {
        setErrorMessage(null);

        if (!accessToken.current) {
            void logErrorReturnLogId(
                "Tried to set password without access token. The user should have been redirected."
            );
            setErrorMessage("Something went wrong. Please contact the admin.");
            return;
        }

        if (!refreshToken.current) {
            void logErrorReturnLogId(
                "Tried to set password without refresh token. The user should have been redirected."
            );
            setErrorMessage("Something went wrong. Please contact the admin.");
            return;
        }

        try {
            await signInWithTokens(accessToken.current, refreshToken.current);
        } catch (error) {
            if (error instanceof AuthError) {
                setErrorMessage(error.message);
            }
            return;
        }

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
                title="Set password"
                emailField={null}
                passwordField={{ text: password, setText: setPassword }}
                submitText="Set password"
                onSubmit={initiatePasswordUpdate}
                errorMessage={errorMessage}
                successMessage={null}
            />
        </AuthMain>
    );
}
