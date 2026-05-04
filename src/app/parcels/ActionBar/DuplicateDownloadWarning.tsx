"use client";

import React from "react";
import Alert from "@mui/material/Alert";
import styled from "styled-components";
import { displayPostcodeForHomelessClient } from "@/common/format";

export interface DuplicateDownloadWarningProps {
    postcodes: (string | null)[];
}

export const StyledAlert = styled(Alert)`
    border-radius: 4px;
`;

const DuplicateDownloadWarning: React.FC<DuplicateDownloadWarningProps> = (props) => {
    const formattedPostcodes = props.postcodes
        .map((postcode) => postcode ?? displayPostcodeForHomelessClient)
        .join(", ");

    return (
        <StyledAlert severity="warning">
            The following postcodes have already been downloaded: {formattedPostcodes}. Are you sure
            you want to print again?
        </StyledAlert>
    );
};

export default DuplicateDownloadWarning;
