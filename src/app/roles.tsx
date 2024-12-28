"use client";

import { UserRole } from "@/databaseUtils";
import React, { useState, createContext } from "react";

interface Props {
    children: React.ReactNode;
}

export const pathsNotRequiringLogin = [
    "/login",
    "/forgot-password",
    "/auth/reset-password",
    "/set-password",
] as const;

const pathsShownToAllAuthenticatedUsers = [
    "/clients",
    "/info",
    "/parcels",
    "/set-password",
    "/update-password",
] as const;

const pathsOnlyShownToStaffAndAbove = ["/lists", "/reports"] as const;

const pathsOnlyShownToAdmin = ["/admin"] as const;

const getShownPagesByRole = (role: UserRole | null): readonly string[] => {
    if (adminRoles.includes(role as AdminRolesType)) {
        return [
            ...pathsShownToAllAuthenticatedUsers,
            ...pathsOnlyShownToStaffAndAbove,
            ...pathsOnlyShownToAdmin,
        ];
    }
    if (organisationRoles.includes(role as OrganisationRolesType)) {
        return [...pathsShownToAllAuthenticatedUsers, ...pathsOnlyShownToStaffAndAbove];
    }
    if (allRoles.includes(role as AllRolesType)) {
        return pathsShownToAllAuthenticatedUsers;
    }
    return pathsNotRequiringLogin;
};

export const roleCanAccessPage = (role: UserRole | null, url: string): boolean => {
    const accessList = getShownPagesByRole(role);
    return accessList.some((page) => url.startsWith(page));
};

export interface RoleUpdateContextType {
    role: UserRole | null;
    setRole: (_role: UserRole | null) => void;
}

export const RoleUpdateContext = createContext<RoleUpdateContextType>({
    role: null,
    setRole: (_role) => {
        throw new Error("Context implementation not provided");
    },
});

export const RoleManager: React.FC<Props> = ({ children }) => {
    const [role, setRole] = useState<UserRole | null>(null);

    return (
        <RoleUpdateContext.Provider value={{ role, setRole }}>
            {children}
        </RoleUpdateContext.Provider>
    );
};

type AllRolesType = UserRole;
type OrganisationRolesType = Exclude<AllRolesType, "volunteer">;
type AdminRolesType = Exclude<AllRolesType, "volunteer" | "staff" | "manager">;
export const allRoles: AllRolesType[] = ["volunteer", "staff", "manager", "admin"];
export const organisationRoles: OrganisationRolesType[] = ["staff", "manager", "admin"];
export const adminRoles: AdminRolesType[] = ["admin"];
