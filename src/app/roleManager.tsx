"use client";

import { UserRole } from "@/databaseUtils";
import React, { useState, createContext } from "react";

interface Props {
    children: React.ReactNode;
}

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
