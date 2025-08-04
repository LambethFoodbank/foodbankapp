"use client";

import React from "react";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import Tooltip from "@mui/material/Tooltip";

interface Props {
    icon: IconDefinition;
    color?: string;
    onHoverText?: string;
    showTooltip?: boolean;
    onTooltipClose?: () => void;
}

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
    width: 1em;
    height: 1em;
    margin: 0.125em;
    color: ${(props) => props.color ?? props.theme.main.foreground[0]};
`;

const Icon: React.FC<Props> = ({ icon, color, onHoverText, showTooltip, onTooltipClose }) => {
    if (showTooltip === undefined) {
        return (
            <StyledFontAwesomeIcon
                icon={icon}
                color={color}
                aria-label={onHoverText}
                title={onHoverText}
            />
        );
    }

    return (
        <Tooltip title={onHoverText} onClose={onTooltipClose} open={showTooltip}>
            <StyledFontAwesomeIcon icon={icon} color={color} aria-label={onHoverText} />
        </Tooltip>
    );
};

export default Icon;
