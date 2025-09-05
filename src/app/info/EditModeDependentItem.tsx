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
    activeEditRowId: string | null;
    setActiveEditRowId: (id: string | null) => void;
}

const EditModeDependentItem: React.FC<EditProps> = ({
    row,
    appendNewRow,
    removeRow,
    swapRows,
    setErrorMessage,
    activeEditRowId,
    setActiveEditRowId,
}) => {
    const [rowData, setRowData] = useState<DbWikiRow | undefined>(row);
    const isInEditMode = activeEditRowId === row?.wiki_key;

    useEffect(() => {
        if (!isInEditMode) {
            setRowData(row);
        }
    }, [row, isInEditMode]);

    return (
        <>
            {rowData &&
                (isInEditMode || (rowData.title === "" && rowData.content === "") ? (
                    <OrganisationRoleDependentView>
                        <WikiItemEdit
                            rowData={rowData}
                            setRowData={setRowData}
                            setIsInEditMode={(val) =>
                                setActiveEditRowId(val ? rowData.wiki_key : null)
                            }
                            appendNewRow={appendNewRow}
                            removeRow={removeRow}
                            swapRows={swapRows}
                            setErrorMessage={setErrorMessage}
                            isAnyInEditMode={activeEditRowId !== null}
                        />
                    </OrganisationRoleDependentView>
                ) : (
                    <WikiItemDisplay
                        rowData={rowData}
                        openEditMode={() => {
                            setActiveEditRowId(rowData?.wiki_key);
                        }}
                        swapRows={swapRows}
                        isAnyInEditMode={activeEditRowId !== null}
                    />
                ))}
        </>
    );
};

export default EditModeDependentItem;
