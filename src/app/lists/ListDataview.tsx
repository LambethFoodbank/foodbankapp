"use client";

import { ColumnDisplayFunctions, ColumnStyles } from "@/components/Tables/materialTable/tableTypes";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import EditModal, { EditModalState } from "@/app/lists/EditModal";
import supabase from "@/supabaseClient";
import { Schema } from "@/databaseUtils";
import ConfirmDeleteModal from "@/components/Modal/ConfirmDialog";
import Snackbar from "@mui/material/Snackbar/Snackbar";
import Alert from "@mui/material/Alert/Alert";
import Button from "@mui/material/Button";
import TooltipCell from "@/app/lists/TooltipCell";
import TableSurface from "@/components/Tables/TableSurface";
import CommentBox from "@/app/lists/CommentBox";
import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { ClientSideFilter } from "@/components/Tables/Filters";
import { ListType } from "@/common/databaseListTypes";
import DeleteConfirmationDialog from "@/components/Modal/DeleteConfirmationDialog";
import { ClientPaginatedMaterialTable } from "@/components/Tables/MaterialTable";

export type ListFilter = ClientSideFilter<ListRow, string>;

export interface ListRow {
    primaryKey: string;
    rowOrder: number;
    itemName: string;
    listType: ListType;
    "1": QuantityAndNotes;
    "2": QuantityAndNotes;
    "3": QuantityAndNotes;
    "4": QuantityAndNotes;
    "5": QuantityAndNotes;
    "6": QuantityAndNotes;
    "7": QuantityAndNotes;
    "8": QuantityAndNotes;
    "9": QuantityAndNotes;
    "10": QuantityAndNotes;
}

interface QuantityAndNotes {
    quantity: string;
    notes: string | null;
}

interface ListDataViewProps {
    listOfItems: ListRow[];
    isLoading: boolean;
    errorMessage: string | null;
    setErrorMessage: (error: string | null) => void;
    primaryFilters: ListFilter[];
    setPrimaryFilters: (filters: ListFilter[]) => void;
}

export const listsHeaderKeysAndLabels = [
    ["itemName", "Description"],
    ["1", "Single"],
    ["2", "Family of 2"],
    ["3", "Family of 3"],
    ["4", "Family of 4"],
    ["5", "Family of 5"],
    ["6", "Family of 6"],
    ["7", "Family of 7"],
    ["8", "Family of 8"],
    ["9", "Family of 9"],
    ["10", "Family of 10"],
] satisfies [keyof ListRow, string][];

export const listRowToListDB = (listRow: ListRow): Schema["lists"] => ({
    item_name: listRow.itemName,
    notes_for_1: listRow[1].notes,
    notes_for_2: listRow[2].notes,
    notes_for_3: listRow[3].notes,
    notes_for_4: listRow[4].notes,
    notes_for_5: listRow[5].notes,
    notes_for_6: listRow[6].notes,
    notes_for_7: listRow[7].notes,
    notes_for_8: listRow[8].notes,
    notes_for_9: listRow[9].notes,
    notes_for_10: listRow[10].notes,
    quantity_for_1: listRow[1].quantity,
    quantity_for_2: listRow[2].quantity,
    quantity_for_3: listRow[3].quantity,
    quantity_for_4: listRow[4].quantity,
    quantity_for_5: listRow[5].quantity,
    quantity_for_6: listRow[6].quantity,
    quantity_for_7: listRow[7].quantity,
    quantity_for_8: listRow[8].quantity,
    quantity_for_9: listRow[9].quantity,
    quantity_for_10: listRow[10].quantity,
    primary_key: listRow.primaryKey,
    row_order: listRow.rowOrder,
    list_type: listRow.listType,
});

const displayQuantityAndNotes = (data: QuantityAndNotes): React.ReactElement => {
    return <TooltipCell cellValue={data.quantity} tooltipValue={data.notes ?? ""} />;
};

const listDataViewColumnDisplayFunctions = {
    ...Object.fromEntries(
        listsHeaderKeysAndLabels.slice(1).map(([key]) => [key, displayQuantityAndNotes])
    ),
} satisfies ColumnDisplayFunctions<ListRow>;

const listsColumnStyleOptions: ColumnStyles<ListRow> = {
    itemName: {
        minWidth: "8rem",
    },
    ...Object.fromEntries(
        listsHeaderKeysAndLabels.slice(1).map(([key]) => [
            key,
            {
                minWidth: "10rem",
                center: true,
            },
        ])
    ),
};

const ListsDataView: React.FC<ListDataViewProps> = ({
    listOfItems,
    isLoading,
    errorMessage,
    setErrorMessage,
    primaryFilters,
    setPrimaryFilters,
}) => {
    const [modal, setModal] = useState<EditModalState>();
    const [toDelete, setToDelete] = useState<number | null>(null);
    // need another setState otherwise the modal content changes before the close animation finishes
    const [toDeleteModalOpen, setToDeleteModalOpen] = useState<boolean>(false);
    const [isDeleteConfirmationDialogueOpen, setIsDeleteConfirmationDialogueOpen] =
        useState<boolean>(false);
    const [listData, setListData] = useState<ListRow[]>(listOfItems);

    if (listOfItems === null) {
        void logInfoReturnLogId("No shopping list data found.");
        throw new Error("No data found");
    }

    const toggleableHeaders = listsHeaderKeysAndLabels.map(([key]) => key);

    const onEdit = (index: number): void => {
        setModal(listRowToListDB(listData[index]));
    };
    const onDeleteButtonClick = (index: number): void => {
        setToDelete(index);
        setToDeleteModalOpen(true);
    };

    const onConfirmDeletion = async (): Promise<void> => {
        if (toDelete !== null) {
            const itemToDelete = listData[toDelete];

            const auditLog = {
                action: "delete a list item",
                content: {
                    itemName: itemToDelete.itemName,
                    itemPrimaryKey: itemToDelete.primaryKey,
                },
            } as const satisfies Partial<AuditLog>;

            const { error } = await supabase
                .from("lists")
                .delete()
                .eq("primary_key", itemToDelete.primaryKey);

            if (error) {
                const logId = await logErrorReturnLogId(
                    `Error with delete: Ingredient id ${itemToDelete.primaryKey}`,
                    { error: error }
                );
                await sendAuditLog({
                    ...auditLog,
                    wasSuccess: false,
                    logId,
                    listId: itemToDelete.primaryKey,
                });
                setErrorMessage(`Failed to delete a list item. Log ID: ${logId}`);
                return;
            }

            await sendAuditLog({ ...auditLog, wasSuccess: true });
            setToDeleteModalOpen(false);
            setToDelete(null);
        }
    };

    const updateListRowOrderValues = (): void => {
        listOfItems.forEach((item, index) => {
            item.rowOrder = index;
        });
    };

    const onRowReorder = async (draggedRow: ListRow, hoveredRow: ListRow): Promise<void> => {
        // Insert the row being dragged just before the row being hovered over, and update row_order values accordingly
        const draggedRowIndex = listOfItems.findIndex(
            (row) => row.primaryKey === draggedRow.primaryKey
        );
        const draggedItem = listOfItems.splice(draggedRowIndex, 1)[0];

        listOfItems.splice(
            listOfItems.findIndex((row) => row.primaryKey === hoveredRow.primaryKey),
            0,
            draggedItem
        );

        updateListRowOrderValues();

        const { error } = await supabase.from("lists").upsert(
            listOfItems.map((item) => ({
                primary_key: item.primaryKey,
                row_order: item.rowOrder,
            })),
            { onConflict: "primary_key" }
        );

        const auditLog = {
            action: "list item position change",
            listId: draggedRow.primaryKey,
            content: {
                itemName: draggedRow.itemName,
                oldRowOrder: draggedRowIndex,
            },
        } as const satisfies Partial<AuditLog>;

        if (error) {
            const logId = await logErrorReturnLogId("Error with upsert: List row item order", {
                error: error,
            });
            setErrorMessage(`Failed to reorder rows. Log ID: ${logId}`);
            void sendAuditLog({
                ...auditLog,
                wasSuccess: false,
                logId: logId,
            });
            return;
        } else {
            void sendAuditLog({
                ...auditLog,
                wasSuccess: true,
                content: { ...auditLog.content, newRowOrder: hoveredRow.rowOrder },
            });
        }
    };

    useEffect(() => {
        setListData(
            listOfItems.filter((row) => {
                return primaryFilters.every((filter) => {
                    return filter.method(row, filter.state, filter.rowKey);
                });
            })
        );
    }, [primaryFilters, listOfItems]);

    return (
        <>
            <ConfirmDeleteModal
                message={`Are you sure you want to delete ${
                    toDelete !== null ? listData[toDelete].itemName : ""
                }?`}
                isOpen={toDeleteModalOpen}
                onConfirm={() => setIsDeleteConfirmationDialogueOpen(true)}
                onCancel={() => {
                    setToDeleteModalOpen(false);
                }}
            />
            <DeleteConfirmationDialog
                deletionText={`You are about to delete ${toDelete !== null ? listData[toDelete].itemName : ""}`}
                isOpen={isDeleteConfirmationDialogueOpen}
                closeModal={() => setIsDeleteConfirmationDialogueOpen(false)}
                onConfirm={onConfirmDeletion}
            />

            <Snackbar
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
                open={errorMessage !== null}
            >
                <SnackBarDiv>
                    <Alert severity="error">{errorMessage}</Alert>
                </SnackBarDiv>
            </Snackbar>

            <TableSurface>
                <CommentBox />
                <ClientPaginatedMaterialTable<ListRow, string>
                    data={listData}
                    setData={setListData}
                    columnDisplayFunctions={listDataViewColumnDisplayFunctions}
                    columnStyleOptions={listsColumnStyleOptions}
                    headerKeysAndLabels={listsHeaderKeysAndLabels}
                    toggleableHeaders={toggleableHeaders}
                    isLoading={isLoading}
                    checkboxConfig={{ displayed: false }}
                    paginationConfig={{ enablePagination: false }}
                    sortConfig={{ sortPossible: false }}
                    filterConfig={{
                        primaryFiltersShown: true,
                        primaryFilters: primaryFilters,
                        setPrimaryFilters: setPrimaryFilters,
                        additionalFiltersShown: false,
                    }}
                    rowActionsConfig={{
                        editable: true,
                        onEdit: onEdit,
                        onDelete: onDeleteButtonClick,
                    }}
                    enableRowOrdering={true}
                    onRowReorder={onRowReorder}
                />
                <EditModal
                    onClose={() => setModal(undefined)}
                    data={modal}
                    key={modal?.primary_key}
                    currentList={primaryFilters[1].state as ListType}
                />
                <ButtonMargin>
                    <Button variant="contained" onClick={() => setModal(null)}>
                        + Add
                    </Button>
                </ButtonMargin>
            </TableSurface>
        </>
    );
};

export const SnackBarDiv = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;

    & .MuiAlert-standard {
        border-radius: 0.2rem;
        padding: 0 1rem;
    }
`;

const ButtonMargin = styled.div`
    margin: 15px 5px 5px 0;
`;

export default ListsDataView;
