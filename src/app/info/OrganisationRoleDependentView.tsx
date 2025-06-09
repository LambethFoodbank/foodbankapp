"use client";

import React, { useContext } from "react";
import { UserRole } from "@/databaseUtils";
import { organisationRoles, RoleUpdateContext } from "@/app/roles";

interface RoleProps {
    children?: React.ReactNode;
}

const OrganisationRoleDependentView: React.FC<RoleProps> = (props) => {
    const { role } = useContext(RoleUpdateContext);

    return <>{organisationRoles.includes(role as UserRole) && props.children}</>;
};

export default OrganisationRoleDependentView;
