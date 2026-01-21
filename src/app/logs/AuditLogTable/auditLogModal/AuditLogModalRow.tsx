"use client";

import React, { useEffect, useState } from "react";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import { AuditLogModalRowResponse } from "./types";
import styled from "styled-components";

export const AuditLogModalItem = styled.div`
    display: flex;
    flex-direction: row;
    padding-bottom: 0.5em;
`;

export const Key = styled.div`
    flex: 0 0 30%;
    font-weight: 600;
    padding: 1rem 0.5em;
    align-content: center;
`;

export const TextValueContainer = styled.div`
    padding: 1rem;
`;

interface AuditLogModalRowProps<Data> {
    getDataOrErrorMessage: () => Promise<AuditLogModalRowResponse<Data>>;
    RowComponentWhenSuccessful: React.FC<Data>;
    header: string;
}

const AuditLogModalRow = <Data,>({
    getDataOrErrorMessage,
    RowComponentWhenSuccessful,
    header,
}: AuditLogModalRowProps<Data>): React.ReactElement => {
    const [rowData, setRowData] = useState<Data | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { data, errorMessage } = await getDataOrErrorMessage();
            if (errorMessage) {
                setErrorMessage(errorMessage);
                return;
            }
            setRowData(data);
        })();
    }, [getDataOrErrorMessage]);

    return (
        <AuditLogModalItem>
            <Key>{header.toUpperCase()}: </Key>
            {rowData && <RowComponentWhenSuccessful {...rowData} />}
            {errorMessage && (
                <TextValueContainer>
                    <ErrorSecondaryText>{errorMessage}</ErrorSecondaryText>
                </TextValueContainer>
            )}
        </AuditLogModalItem>
    );
};

export default AuditLogModalRow;
