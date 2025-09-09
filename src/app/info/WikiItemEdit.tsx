"use client";

import React from "react";
import { DbWikiRow } from "@/databaseUtils";
import {
    ReorderArrowDiv,
    WikiEditModeButton,
    WikiItemAccordionSurface,
    WikiUpdateDataButton,
} from "@/app/info/StyleComponents";
import { TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { logErrorReturnLogId } from "@/logger/logger";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { DirectionString } from "@/app/info/WikiItems";
import { deleteItemInWikiTable, updateItemInWikiTable } from "@/app/info/supabaseHelpers";
import { useTheme } from "styled-components";
import { getBeforeAndAfter } from "../logs/fetchForAuditLog";

interface WikiItemEditProps {
    rowData: DbWikiRow;
    setRowData: (row?: DbWikiRow) => void;
    setIsInEditMode: (isInEditMode: boolean) => void;
    appendNewRow: (newRow: DbWikiRow, index: number) => void;
    removeRow: (row: DbWikiRow) => number;
    swapRows: (row1: DbWikiRow, direction: DirectionString) => void;
    setErrorMessage: (error: string | null) => void;
}

const WikiItemEdit: React.FC<WikiItemEditProps> = ({
    rowData,
    setRowData,
    setIsInEditMode,
    appendNewRow,
    removeRow,
    swapRows,
    setErrorMessage,
}) => {
    const [titleValue, setTitleValue] = React.useState(rowData.title);
    const [contentValue, setContentValue] = React.useState(rowData.content);

    const theme = useTheme();

    const deleteWikiItem = async (): Promise<void> => {
        const deleteError = await deleteItemInWikiTable(rowData.wiki_key);

        const auditLog = {
            action: "delete a wiki item",
            content: {
                before: {},
                after: {},
                actionType: "Delete",
                itemName: rowData.title,
                itemPrimaryKey: rowData.wiki_key,
            },
        } as const satisfies Partial<AuditLog>;

        if (deleteError) {
            const logId = await logErrorReturnLogId("error deleting wiki row item", deleteError);
            setErrorMessage(`Failed to delete wiki item. Log ID: ${logId}`);
            void sendAuditLog({
                ...auditLog,
                wasSuccess: false,
                logId: logId,
            });
        } else {
            void sendAuditLog({
                ...auditLog,
                wasSuccess: true,
            });
            removeRow(rowData);
            setRowData(undefined);
        }
    };

    const cancelWikiItemEdit = (): void => {
        !rowData.title && !rowData.content ? deleteWikiItem() : setIsInEditMode(false);
    };

    const updateWikiItem = async (newTitle: string, newContent: string): Promise<void> => {
        if (!newTitle && !newContent) {
            const deleteUpdateConfirmation: boolean = confirm(
                "Saving an item to be empty will delete it. Are you sure?"
            );
            if (deleteUpdateConfirmation) {
                deleteWikiItem();
            }
        } else {
            const updateConfirmation: boolean = confirm("Confirm update of this item?");
            if (updateConfirmation) {
                const updateError = await updateItemInWikiTable(
                    newTitle,
                    newContent,
                    rowData.wiki_key
                );

                const beforeAndAfter = getBeforeAndAfter(
                    {
                        title: rowData.title,
                        content: rowData.content,
                    },
                    {
                        title: newTitle,
                        content: newContent,
                    }
                )

                const auditLog = {
                    action: "edit a wiki item",
                    wikiId: rowData.wiki_key,
                    content: {
                        ...beforeAndAfter,
                        actionType: "Edit",
                        itemTitle: newTitle,
                        itemContent: newContent,
                        rowOrder: rowData.row_order,
                    },
                } as const satisfies Partial<AuditLog>;
                if (updateError) {
                    const logId = await logErrorReturnLogId(
                        "error updating wiki row item",
                        updateError
                    );
                    setErrorMessage(`Failed to update wiki item. Log ID: ${logId}`);
                    void sendAuditLog({
                        ...auditLog,
                        wasSuccess: false,
                        logId: logId,
                    });
                } else {
                    const updatedRow: DbWikiRow = {
                        title: newTitle,
                        content: newContent,
                        row_order: rowData.row_order,
                        wiki_key: rowData.wiki_key,
                    };
                    const index: number = removeRow(rowData);
                    setRowData(updatedRow);
                    appendNewRow(updatedRow, index);
                    void sendAuditLog({
                        ...auditLog,
                        wasSuccess: true,
                    });
                }
            }
            setIsInEditMode(false);
        }
    };

    const deleteWikiItemWithConfirmation = async (): Promise<void> => {
        if (!rowData.title && !rowData.content) {
            const confirmation: boolean = confirm("Confirm discard of this item?");
            if (confirmation) {
                deleteWikiItem();
            }
        } else {
            const confirmation: boolean = confirm("Confirm deletion of this item?");
            if (confirmation) {
                deleteWikiItem();
            }
        }
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setTitleValue(event.target.value);
    };

    const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setContentValue(event.target.value);
    };

    return (
        <>
            <ReorderArrowDiv>
                <WikiUpdateDataButton
                    onClick={() => {
                        swapRows(rowData, "up");
                    }}
                    data-testid={`#swap-up-${rowData.row_order}`}
                >
                    <KeyboardDoubleArrowUpIcon />
                </WikiUpdateDataButton>
                <WikiUpdateDataButton
                    onClick={() => {
                        swapRows(rowData, "down");
                    }}
                    data-testid={`#swap-down-${rowData.row_order}`}
                >
                    <KeyboardDoubleArrowDownIcon />
                </WikiUpdateDataButton>
            </ReorderArrowDiv>

            <WikiEditModeButton
                onClick={cancelWikiItemEdit}
                data-testid={`#cancel-${rowData.row_order}`}
            >
                <CancelIcon />
            </WikiEditModeButton>

            <WikiItemAccordionSurface>
                <TextField
                    id={`title_input_${rowData.wiki_key}`}
                    variant="outlined"
                    label="title"
                    onChange={handleTitleChange}
                    value={titleValue}
                    inputProps={{ "data-testid": `#title-${rowData.row_order}` }}
                />
                <TextField
                    id={`content_input_${rowData.wiki_key}`}
                    label="Content"
                    value={contentValue}
                    onChange={handleContentChange}
                    multiline
                    rows={4}
                    margin="normal"
                    fullWidth={true}
                    inputProps={{ "data-testid": `#content-${rowData.row_order}` }}
                />

                <WikiEditModeButton
                    onClick={() => {
                        const title_input = document.getElementById(
                            `title_input_${rowData.wiki_key}`
                        ) as HTMLInputElement;
                        const content_input = document.getElementById(
                            `content_input_${rowData.wiki_key}`
                        ) as HTMLInputElement;
                        updateWikiItem(title_input.value, content_input.value);
                    }}
                    data-testid={`#update-${rowData.row_order}`}
                >
                    <SaveIcon sx={{ color: theme.primary.background[3] }} />
                </WikiEditModeButton>
                <WikiEditModeButton
                    onClick={deleteWikiItemWithConfirmation}
                    data-testid={`#delete-${rowData.row_order}`}
                >
                    <DeleteIcon />
                </WikiEditModeButton>
            </WikiItemAccordionSurface>
        </>
    );
};

export default WikiItemEdit;
