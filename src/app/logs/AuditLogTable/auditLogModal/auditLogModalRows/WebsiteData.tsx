"use client";

import React from "react";
import { AuditLogModalItem, Key, TextValueContainer } from "../AuditLogModalRow";
import { getReadableWebsiteDataName } from "@/common/format";

const WebsiteDataAuditLogModalRow: React.FC<{ websiteDataName: string }> = ({
    websiteDataName,
}) => (
    <AuditLogModalItem>
        <Key>WEBSITE DATA: </Key>
        <TextValueContainer>{getReadableWebsiteDataName(websiteDataName)}</TextValueContainer>
    </AuditLogModalItem>
);

export default WebsiteDataAuditLogModalRow;
