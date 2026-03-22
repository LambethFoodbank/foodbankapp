"use client";

import { fetchListsComment } from "@/common/fetch";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import { logErrorReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const HeaderAndButtonContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 8rem;
    flex-direction: column;
    gap: 1rem;
    margin-left: 1rem;
    justify-content: space-between;
    @media (min-width: 800px) {
        width: 10%;
    }
`;

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    background-color: ${(props) => props.theme.main.background[2]};
    border-radius: 1rem;
    margin: 0.5rem;
    padding: 0.5rem;
`;

const CommentBoxContainer = styled.div`
    width: 100%;
    margin: 1rem 1rem 0 1rem;
    min-width: 15rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-grow: 1;
    @media (min-width: 800px) {
        width: 75%;
        margin-bottom: 1rem;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    width: 100%;
    height: 90%;
    gap: 1rem;
    max-width: 15rem;
    justify-content: space-around;
    @media (min-width: 800px) {
        flex-direction: column;
        align-items: center;
        max-width: 25rem;
    }
`;

const ErrorText = styled.p`
    color: ${(props) => props.theme.error};
    margin: 1rem 0 0;
    font-size: 0.8rem;
`;

const SuccessText = styled.p`
    color: ${(props) => props.theme.primary.background[3]};
    margin: 1rem 0 0;
    font-size: 0.8rem;
`;

const WarningText = styled.p`
    color: ${(props) => props.theme.primary.background[3]};
    margin: 1rem 0 0;
    font-size: 0.8rem;
`;

const CommentBox: React.FC = () => {
    const [value, setValue] = useState("");
    const [dbComment, setDbComment] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const hasUnsavedChanges = value !== dbComment;

    const fetchComment = async (): Promise<void> => {
        const fetchCommentResult = await fetchListsComment(supabase);
        if (fetchCommentResult.error) {
            setErrorMessage(
                `There was an error fetching the comment from the database. Log ID: ${fetchCommentResult.error.logId}`
            );
            setSuccessMessage("");
        } else {
            setDbComment(fetchCommentResult.data);
            setValue(fetchCommentResult.data);
            setErrorMessage("");
            setSuccessMessage("");
        }
    };

    useEffect(() => {
        void fetchComment();
    }, []);

    const onChangeSetValue = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setValue(event.target.value);
    };

    const onSubmit = async (): Promise<void> => {
        const table = supabase.from("website_data");
        const { error } = await table.update({ value: value }).eq("name", "lists_text");
        if (error) {
            const logId = await logErrorReturnLogId("Error with save: Lists comment", error);
            setErrorMessage(
                `There was an error uploading your changes to the database. Log ID: ${logId}`
            );
            setSuccessMessage("");
        } else {
            setDbComment(value);
            setErrorMessage("");
            setSuccessMessage("Comment successfully updated.");
        }
    };

    return (
        <Wrapper>
            <HeaderAndButtonContainer>
                <h2>Comments</h2>
                {hasUnsavedChanges && (
                    <ButtonContainer>
                        <Button variant="outlined" onClick={() => setValue(dbComment)}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={onSubmit}>
                            Save
                        </Button>
                    </ButtonContainer>
                )}
            </HeaderAndButtonContainer>
            <CommentBoxContainer>
                <FreeFormTextInput
                    label="Comments"
                    value={value}
                    onChange={(newValue) => {
                        onChangeSetValue(newValue);
                        setSuccessMessage("");
                        setErrorMessage("");
                    }}
                    multiline
                    maxRows={4}
                    minRows={4}
                />
                {hasUnsavedChanges && <WarningText>There are unsaved changes!</WarningText>}
                {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
                {successMessage && <SuccessText>{successMessage}</SuccessText>}
            </CommentBoxContainer>
        </Wrapper>
    );
};

export default CommentBox;
