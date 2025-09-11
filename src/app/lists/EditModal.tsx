"use client";

import Modal from "@/components/Modal/Modal";
import React, { useState } from "react";
import styled from "styled-components";
import { SnackBarDiv } from "@/app/lists/ListDataview";
import { ListType } from "@/common/databaseListTypes";
import TextInput from "@/components/DataInput/FreeFormTextInput";
import supabase from "@/supabaseClient";
import { Schema } from "@/databaseUtils";
import Snackbar from "@mui/material/Snackbar/Snackbar";
import Alert from "@mui/material/Alert/Alert";
import Button from "@mui/material/Button/Button";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { logErrorReturnLogId } from "@/logger/logger";
import { capitaliseWords } from "@/common/format";
import { fetchList, getBeforeAndAfter, RowType } from "../logs/fetchForAuditLog";

interface Props {
    onClose: () => void;
    data: EditModalState;
    currentList: ListType;
}

// null => add, undefined => modal closed
export type EditModalState = Schema["lists"] | null | undefined;

type AddListErrorTypes = "failedToAddListItem";
type AddListReturn = {
    error: { type: AddListErrorTypes; logId: string } | null;
};

type EditListErrorTypes = "failedToEditListItem";
type EditListReturn = {
    error: { type: EditListErrorTypes; logId: string } | null;
};

const ModalInner = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const DataWithTooltipDiv = styled.div`
    display: flex;
    gap: 1rem;
    flex-direction: column;

    @media (min-width: 600px) {
        flex-direction: row;
    }
`;

const DisplayContents = styled.div`
    display: contents;
`;

const listQuantityNoteAndLabels: [keyof Schema["lists"], keyof Schema["lists"], string][] = [
    ["quantity_for_1", "notes_for_1", "Single"],
    ["quantity_for_2", "notes_for_2", "Family of 2"],
    ["quantity_for_3", "notes_for_3", "Family of 3"],
    ["quantity_for_4", "notes_for_4", "Family of 4"],
    ["quantity_for_5", "notes_for_5", "Family of 5"],
    ["quantity_for_6", "notes_for_6", "Family of 6"],
    ["quantity_for_7", "notes_for_7", "Family of 7"],
    ["quantity_for_8", "notes_for_8", "Family of 8"],
    ["quantity_for_9", "notes_for_9", "Family of 9"],
    ["quantity_for_10", "notes_for_10", "Family of 10+"],
];

const EditModal: React.FC<Props> = ({ data, onClose, currentList }) => {
    const [toSubmit, setToSubmit] = useState<Partial<Schema["lists"]> | null>(data ?? null);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const setKey = (event: React.ChangeEvent<HTMLInputElement>, key: string): void => {
        const newValue = event.target.value;
        setToSubmit({ ...toSubmit, [key]: newValue });
    };

    const addListItem = async (listItem: Partial<Schema["lists"]>): Promise<AddListReturn> => {
        const { data: returnedListData, error: insertListItemError } = await supabase
            .from("lists")
            .insert(listItem)
            .select()
            .single();

        const auditLog = {
            content: {
                before: {},
                after: {},
                actionType: "Create",
                itemDetails: listItem,
            },
            action: "add a list item",
        } as const satisfies Partial<AuditLog>;

        if (insertListItemError) {
            const logId = await logErrorReturnLogId("failed to insert list item", {
                error: insertListItemError,
            });
            void sendAuditLog({ ...auditLog, wasSuccess: false, logId });
            setErrorMessage(`Failed to add list item. Log ID: ${logId}`);
            return { error: { type: "failedToAddListItem", logId } };
        }

        void sendAuditLog({
            ...auditLog,
            wasSuccess: true,
            listId: returnedListData.primary_key,
        });
        return { error: null };
    };

    const editListItem = async (listItem: Partial<Schema["lists"]>): Promise<EditListReturn> => {
        const { data: oldRow, error: fetchOldRowError } = await fetchList(listItem.primary_key);

        if (fetchOldRowError) {
            const logId = await logErrorReturnLogId("failed to update list item", {
                error: fetchOldRowError,
            });
            void sendAuditLog({
                action: "edit a list item",
                content: {
                    before: {},
                    after: {},
                    actionType: "Edit",
                },
                wasSuccess: false,
                logId,
            });
            setErrorMessage(`Failed to update a list item. Log ID: ${logId}`);
            return { error: { type: "failedToEditListItem", logId } };
        }

        const { data: returnedListData, error: updateListItemError } = await supabase
            .from("lists")
            .update(listItem)
            .eq("primary_key", listItem.primary_key)
            .select()
            .single();

        const beforeAndAfter = getBeforeAndAfter(
            oldRow as unknown as RowType,
            listItem as unknown as RowType
        );

        const auditLog = {
            content: {
                before: JSON.stringify(beforeAndAfter.before),
                after: JSON.stringify(beforeAndAfter.after),
                actionType: "Edit",
            },
            action: "edit a list item",
            listId: listItem.primary_key,
        } as const satisfies Partial<AuditLog>;

        if (updateListItemError) {
            const logId = await logErrorReturnLogId("failed to update list item", {
                error: updateListItemError,
            });
            void sendAuditLog({ ...auditLog, wasSuccess: false, logId });
            setErrorMessage(`Failed to update a list item. Log ID: ${logId}`);
            return { error: { type: "failedToEditListItem", logId } };
        }
        void sendAuditLog({
            ...auditLog,
            wasSuccess: true,
            listId: returnedListData.primary_key,
        });
        return { error: null };
    };

    const onSubmit = async (currentList: ListType): Promise<void> => {
        if (toSubmit === null) {
            return;
        }

        if (data === null) {
            toSubmit.list_type = currentList;
            const { error } = await addListItem(toSubmit);
            if (error) {
                switch (error.type) {
                    case "failedToAddListItem":
                        setErrorMessage(`Failed to add list item. Log ID: ${error.logId}`);
                }
                return;
            }
        } else {
            const { error } = await editListItem(toSubmit);
            if (error) {
                switch (error.type) {
                    case "failedToEditListItem":
                        setErrorMessage(`Failed to edit list item. Log ID: ${error.logId}`);
                }
                return;
            }
        }
        setToSubmit(null);
        onClose();
    };

    const Footer = (
        <>
            <Button variant="contained" color="primary" onClick={() => onSubmit(currentList)}>
                Submit
            </Button>
            <Snackbar
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
                open={errorMessage !== null}
            >
                <SnackBarDiv>
                    <Alert severity="error">{errorMessage}</Alert>
                </SnackBarDiv>
            </Snackbar>
        </>
    );

    return (
        <Modal
            header={
                toSubmit
                    ? `Edit ${capitaliseWords(currentList)} List Item - ${toSubmit.item_name}`
                    : `Edit ${capitaliseWords(currentList)} List Item -`
            }
            headerId="editList"
            isOpen={data !== undefined}
            onClose={onClose}
            footer={Footer}
        >
            <ModalInner>
                <h3>Description</h3>
                <TextInput
                    defaultValue={toSubmit?.item_name ?? ""}
                    onChange={(event) => setKey(event, "item_name")}
                    label="Item Description"
                />
                {listQuantityNoteAndLabels.map(([quantityKey, noteKey, label]) => {
                    return (
                        <DisplayContents key={quantityKey}>
                            <h3>{label}</h3>
                            <DataWithTooltipDiv>
                                <TextInput
                                    defaultValue={
                                        toSubmit ? toSubmit[quantityKey]?.toString() ?? "" : ""
                                    }
                                    label="Quantity"
                                    onChange={(event) => setKey(event, quantityKey)}
                                />
                                <TextInput
                                    defaultValue={toSubmit ? toSubmit[noteKey]?.toString() : ""}
                                    label="Notes"
                                    onChange={(event) => setKey(event, noteKey)}
                                    fullWidth
                                />
                            </DataWithTooltipDiv>
                        </DisplayContents>
                    );
                })}
            </ModalInner>
        </Modal>
    );
};

export default EditModal;
