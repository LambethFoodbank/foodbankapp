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
    if (role) {
        if (adminRoles.includes(role)) {
            return [
                ...pathsShownToAllAuthenticatedUsers,
                ...pathsOnlyShownToStaffAndAbove,
                ...pathsOnlyShownToAdmin,
            ];
        }
        if (organisationRoles.includes(role)) {
            return [...pathsShownToAllAuthenticatedUsers, ...pathsOnlyShownToStaffAndAbove];
        }
        if (allRoles.includes(role)) {
            return pathsShownToAllAuthenticatedUsers;
        }
    }
    return pathsNotRequiringLogin;
};

export const roleCanAccessPage = (role: UserRole | null, url: string): boolean => {
    const accessList = getShownPagesByRole(role);
    return accessList.some((page) => url.startsWith(page));
};

export const roleCanAccessModal = (
    role: UserRole | null,
    isDeliverable: boolean | null
): boolean => {
    return isDeliverable || (role !== null && role !== "volunteer");
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

export const allRoles: UserRole[] = ["volunteer", "staff", "manager", "admin"];
export const organisationRoles: UserRole[] = ["staff", "manager", "admin"];
export const adminRoles: UserRole[] = ["admin"];
