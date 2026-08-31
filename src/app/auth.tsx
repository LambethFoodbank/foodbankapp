"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { RoleUpdateContext } from "@/app/roleManager";
import { pathsNotRequiringLogin } from "./roles";
import { DatabaseAutoType, UserRole } from "@/databaseUtils";
import { fetchUserRole } from "@/common/fetchUserRole";

interface Props {
    children: React.ReactNode;
}

export const AuthRouting: React.FC<Props> = ({ children = <></> }) => {
    const supabase = createClientComponentClient<DatabaseAutoType>();
    const router = useRouter();
    const [loggedIn, setLoggedIn] = useState<boolean>();
    const pathname = usePathname();
    const { setRole } = useContext(RoleUpdateContext);

    const getRedirectRoute = useCallback((): string | null => {
        if (loggedIn === undefined) {
            return null;
        }

        if (loggedIn && pathname.startsWith("/login")) {
            return "/";
        }

        const currentPathRequiresLogin = pathsNotRequiringLogin.every(
            (pathNotRequiringLogin) => !pathname.startsWith(pathNotRequiringLogin)
        );

        if (!loggedIn && currentPathRequiresLogin) {
            return "/login";
        }

        return null;
    }, [loggedIn, pathname]);

    const onRouteChange = useCallback((): void => {
        const redirect = getRedirectRoute();
        if (redirect) {
            router.push(redirect);
        }
    }, [router, getRedirectRoute]);

    const setUserRole = useCallback(async () => {
        const user = await supabase.auth
            .getSession()
            .then((response) => response.data.session?.user ?? null);

        let userRole: UserRole | null;

        if (user === null) {
            userRole = null;
        } else {
            const { role, error } = await fetchUserRole(user.id);

            if (error) {
                userRole = null;
            } else {
                userRole = role;
            }
        }
        setRole(userRole);
    }, [setRole, supabase.auth]);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoggedIn(!!session?.user);
        });

        return subscription.unsubscribe;
    });

    useEffect(() => {
        onRouteChange();
        void setUserRole();
    }, [onRouteChange, setUserRole, pathname]);

    return <>{children}</>;
};
