"use client";

import supabase from "@/supabaseClient";
import { useEffect } from "react";
import { fetchUserRole } from "./fetchUserRole";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type sessionCheckResult = "Logged in" | "No session" | "User missing" | "Failed query";

export const useSessionHeartbeat = (
    router: AppRouterInstance,
    pageRequiresSession: boolean,
    setSessionErrorMessage: (message: string | null) => void
): void => {
    const heartbeatMs = 20000;
    const delayBeforeRedirectMs = 10000;

    useEffect(() => {
        const checkSession = async (): Promise<sessionCheckResult> => {
            const sessionUser = await supabase.auth
                .getSession()
                .then((response) => response.data.session?.user ?? null);

            console.log("--> user: " + JSON.stringify(sessionUser));

            if (sessionUser) {
                const { role, error, userMissing } = await fetchUserRole(sessionUser.id);

                // QQ
                console.log("--> role & error: " + JSON.stringify([role, error]));
                if (error) {
                    console.dir(error);
                }

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
            console.log("--> in redirectToLoginIfNoSession");

            if (pageRequiresSession) {
                // One final check before redirect
                const sessionCheckResult = await checkSession();
                setSessionErrorMessage(null);
                if (sessionCheckResult !== "Logged in") {
                    console.log("--> router.push(/login)");

                    router.push("/login");
                }
            }
        };

        const heartbeatSessionCheck = async (): Promise<void> => {
            console.log("QQ useSessionHeartbeat: start");

            const sessionCheckResult = await checkSession();

            if (sessionCheckResult === "No session" || sessionCheckResult === "User missing") {
                console.log("--> rerouting");

                if (pageRequiresSession) {
                    setSessionErrorMessage(
                        "Your session has expired, so you are about to be logged out"
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
    }, [pageRequiresSession, router, setSessionErrorMessage]);
};
