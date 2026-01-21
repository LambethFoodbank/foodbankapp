"use client";

import React from "react";
import { AuditLogModalItem, Key, TextValueContainer } from "../AuditLogModalRow";

const StatusOrderAuditLogModalRow: React.FC<{ statusOrderEventName: string }> = ({
    statusOrderEventName,
}) => (
    <AuditLogModalItem>
        <Key>STATUS ORDER: </Key>
        <TextValueContainer>{statusOrderEventName}</TextValueContainer>
    </AuditLogModalItem>
);

export default StatusOrderAuditLogModalRow;
