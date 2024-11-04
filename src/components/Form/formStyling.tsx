"use client";

import styled from "styled-components";
import { Paper } from "@mui/material";

export const CenterComponent = styled.div`
    display: flex;
    justify-content: center;
    align-content: center;
    margin-bottom: 1rem;
`;

export const StyledForm = styled.form<{ $compact?: boolean }>`
    ${(props) =>
        props.$compact
            ? `
    width: 70%;`
            : `
    padding: 2em;
    max-width: 1500px;`}

    display: flex;
    gap: 1em;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

export const StyledCard = styled(Paper)<{ $compact?: boolean }>`
    width: 100%;
    display: flex;
    padding: 2em;
    height: auto;
    margin-top: 5px;
    border-radius: 10px;
    background-color: ${(props) => props.theme.main.background[0]};
    color: ${(props) => props.theme.main.foreground[0]};
    flex-direction: ${(props) => (props.$compact ? "row" : "column")};
    & > div {
        width: 100%;
        margin: 0.15em 0;
    }
`;

export const RequiredAsterisk = styled.span`
    color: ${(props) => props.theme.error};

    &:before {
        content: "*";
    }
`;

export const FormHeader = styled.div<{ $compact?: boolean }>`
    ${(props) =>
        props.$compact &&
        `
    flex: 0 0 50%;
    padding-right: 5rem;
    `}
`;

export const FormInput = styled.div<{ $compact?: boolean }>`
    ${(props) =>
        props.$compact &&
        `
    flex: 0 0 50%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    `}
    & > div {
        width: 100%;
    }
`;

export const StyledName = styled.div`
    display: flex;
    align-items: center;
`;

export const ErrorText = styled.p`
    color: ${(props) => props.theme.error};
    font-size: 0.75rem;
    margin: 3px 14px 0 14px;
`;

export const FormText = styled.p`
    margin-bottom: 1em;
`;

export const FormSubheading = styled.h2`
    margin-bottom: 1em;
`;

export const FormErrorText = styled(FormText)`
    color: ${(props) => props.theme.error};
    margin-bottom: 3em;
    text-align: center;
`;

export const FormElementWithSpacing = styled.div`
    margin-top: 1em;
    margin-bottom: 1em;
`;

export const GappedDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1em;
`;

export const PreTableControlsContainer = styled(Paper)`
    margin: 1rem;
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    padding: 1rem;
    gap: 0.5rem;
    align-items: center;
    border-radius: 0.5rem;
    background-color: ${(props) => props.theme.main.background[5]};
`;

export const ActionsContainer = styled.div`
    margin-left: auto;
    gap: 0.5rem;
    display: flex;
`;
