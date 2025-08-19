"use client";

import React from "react";
import Alert from "@mui/material/Alert";
import styled from "styled-components";

export interface DeletedClientParcelsDownloadWarningProps {
    deletedClientParcelsCount: number;
}

const StyledAlert = styled(Alert)`
    border-radius: 4px;
`;

const DeletedClientParcelsDownloadWarning: React.FC<DeletedClientParcelsDownloadWarningProps> = (
    props
) => {
    const { deletedClientParcelsCount } = props;

    return (
        <StyledAlert severity="warning">
            {deletedClientParcelsCount} deleted client{" "}
            {deletedClientParcelsCount === 1 ? "parcel" : "parcels"} will not be included in this
            download.
        </StyledAlert>
    );
};

export default DeletedClientParcelsDownloadWarning;
