"use client";

import supabase from "@/supabaseClient";
import { useEffect } from "react";
import { fetchUserRole } from "./fetchUserRole";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type sessionCheckResult = "Logged in" | "No session" | "User missing" | "Failed query";

export const useSessionHeartbeat = (
    router: AppRouterInstance,
    pageRequiresSession: boolean,
    isUserLogOutInProgress: boolean,
    setSessionErrorMessage: (message: string | null) => void
): void => {
    const heartbeatMs = Number.parseInt(process.env.NEXT_PUBLIC_HEARTBEAT_MS ?? "20000");
    const delayBeforeRedirectMs = Number.parseInt(
        process.env.NEXT_PUBLIC_REDIRECT_DELAY_MS ?? "10000"
    );

    useEffect(() => {
        const checkSession = async (): Promise<sessionCheckResult> => {
            const sessionUser = await supabase.auth
                .getSession()
                .then((response) => response.data.session?.user ?? null);

            if (sessionUser) {
                const { role, error, userMissing } = await fetchUserRole(sessionUser.id);

                if (role !== null && !error) {
                    return "Logged in";
                } else if (userMissing) {
                    return "User missing";
                } else {
                    return "Failed query";
                }
            }

            return "No session";
        };

        const redirectToLoginIfNoSession = async (): Promise<void> => {
            if (pageRequiresSession) {
                // One final check before redirect
                const sessionCheckResult = await checkSession();
                setSessionErrorMessage(null);
                if (sessionCheckResult !== "Logged in") {
                    router.push("/login");
                }
            }
        };

        const heartbeatSessionCheck = async (): Promise<void> => {
            const sessionCheckResult = await checkSession();

            if (isUserLogOutInProgress) {
                setSessionErrorMessage(null);
                return;
            }

            if (sessionCheckResult === "No session" || sessionCheckResult === "User missing") {
                if (pageRequiresSession) {
                    setSessionErrorMessage(
                        "Your session has expired. You are about to be logged out."
                    );

                    setTimeout(redirectToLoginIfNoSession, delayBeforeRedirectMs);
                }
            } else if (sessionCheckResult === "Failed query") {
                // For this heartbeat, assume that the failure is due to network drop
                setSessionErrorMessage("Network connection problem when checking session");
            } else {
                setSessionErrorMessage(null);
            }
        };

        if (pageRequiresSession) {
            const intervalId = setInterval(heartbeatSessionCheck, heartbeatMs);
            return () => clearInterval(intervalId);
        }
    }, [
        delayBeforeRedirectMs,
        heartbeatMs,
        isUserLogOutInProgress,
        pageRequiresSession,
        router,
        setSessionErrorMessage,
    ]);
};
