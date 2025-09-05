"use client";

import React, { useEffect, useState } from "react";
import { DbWikiRow } from "@/databaseUtils";
import WikiItemDisplay from "@/app/info/WikiItemDisplay";
import WikiItemEdit from "@/app/info/WikiItemEdit";
import OrganisationRoleDependentView from "@/app/info/OrganisationRoleDependentView";
import { DirectionString } from "@/app/info/WikiItems";

interface EditProps {
    row?: DbWikiRow;
    appendNewRow: (newRow: DbWikiRow, index: number) => void;
    removeRow: (row: DbWikiRow) => number;
    swapRows: (row1: DbWikiRow, direction: DirectionString) => void;
    setErrorMessage: (error: string | null) => void;
    rowsInEditMode: Set<string>;
    setRowsInEditMode: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const EditModeDependentItem: React.FC<EditProps> = ({
    row,
    appendNewRow,
    removeRow,
    swapRows,
    setErrorMessage,
    rowsInEditMode,
    setRowsInEditMode,
}) => {
    const [rowData, setRowData] = useState<DbWikiRow | undefined>(row);
    const [isInEditMode, setIsInEditMode] = useState<boolean>(false);

    useEffect(() => {
        if (!isInEditMode) {
            setRowData(row);
        }
    }, [row, isInEditMode]);

    const handleSetIsInEditMode = (val: boolean): void => {
        setIsInEditMode(val);
        setRowsInEditMode((prev) => {
            const newSet = new Set(prev);
            if (val) {
                row?.wiki_key && newSet.add(row.wiki_key);
            } else {
                row?.wiki_key && newSet.delete(row.wiki_key);
            }
            return newSet;
        });
    };

    const openEditMode = (): void => {
        handleSetIsInEditMode(true);
    };

    const isAnyRowInEditMode = rowsInEditMode.size > 0;

    return (
        <>
            {rowData &&
                (isInEditMode || (rowData.title === "" && rowData.content === "") ? (
                    <OrganisationRoleDependentView>
                        <WikiItemEdit
                            rowData={rowData}
                            setRowData={setRowData}
                            setIsInEditMode={handleSetIsInEditMode}
                            appendNewRow={appendNewRow}
                            removeRow={removeRow}
                            swapRows={swapRows}
                            setErrorMessage={setErrorMessage}
                            isAnyInEditMode={isAnyRowInEditMode}
                        />
                    </OrganisationRoleDependentView>
                ) : (
                    <WikiItemDisplay
                        rowData={rowData}
                        openEditMode={openEditMode}
                        swapRows={swapRows}
                        isAnyInEditMode={isAnyRowInEditMode}
                    />
                ))}
        </>
    );
};

export default EditModeDependentItem;
