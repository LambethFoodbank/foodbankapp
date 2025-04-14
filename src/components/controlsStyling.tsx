"use client";

import styled from "styled-components";
import { Paper } from "@mui/material";
import { MENU_BREAKPOINT, NavBarHeight } from "./NavigationBar/NavigationBar";

export const PreTableControlsContainer = styled(Paper)`
    margin: 0 1rem 1rem;
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
    padding: 1rem;
    gap: 0.5rem;
    align-items: center;
    border-radius: 0.5rem;
    background-color: ${(props) => props.theme.main.background[5]};

    @media (min-width: ${MENU_BREAKPOINT}) {
        position: -webkit-sticky;
        position: sticky;
        z-index: 1000;
        top: ${NavBarHeight};
    }
`;

export const ActionsContainer = styled.div`
    margin-left: auto;
    gap: 0.5rem;
    display: flex;
`;
