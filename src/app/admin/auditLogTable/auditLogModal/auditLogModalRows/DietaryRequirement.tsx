"use client";

import React from "react";
import {
    AuditLogModalItem,
    Key,
    TextValueContainer,
} from "@/app/logs/AuditLogTable/auditLogModal/AuditLogModalRow";

const DietaryRequirementAuditLogModalRow: React.FC<{ dietaryRequirement: string }> = ({
    dietaryRequirement,
}) => (
    <AuditLogModalItem>
        <Key>DIETARY REQUIREMENT: </Key>
        <TextValueContainer>{dietaryRequirement}</TextValueContainer>
    </AuditLogModalItem>
);

export default DietaryRequirementAuditLogModalRow;
