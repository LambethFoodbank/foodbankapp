/*
WIP - this is the base for this ticket: VFB-513 Generate route and stops: https://softwiretech.atlassian.net/jira/software/c/projects/VFB/boards/1130?selectedIssue=VFB-513
 */

"use client";
import React from "react";
import { Button } from "@mui/material";

interface Props {
    routeSendCompleted: boolean;
    onRouteSendCompleted: () => void;
    disabled: boolean;
}

const DriverCircuitButton = ({ onRouteSendCompleted, disabled }: Props): React.ReactElement => {
    const onClick = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();
        onRouteSendCompleted();
    };
    return (
        <Button
            variant="contained"
            onClick={(event) => onClick(event)}
            type="submit"
            disabled={disabled}
        >
            Send to Circuit
        </Button>
    );
};

export default DriverCircuitButton;
