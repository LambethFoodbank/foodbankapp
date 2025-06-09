"use client";

import React, { useState } from "react";
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
}

const EditModeDependentItem: React.FC<EditProps> = ({
    row,
    appendNewRow,
    removeRow,
    swapRows,
    setErrorMessage,
}) => {
    const [rowData, setrowData] = useState<DbWikiRow | undefined>(row);
    const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
    return (
        <>
            {rowData &&
                (isInEditMode || (rowData.title === "" && rowData.content === "") ? (
                    <OrganisationRoleDependentView>
                        <WikiItemEdit
                            rowData={rowData}
                            setRowData={setrowData}
                            setIsInEditMode={setIsInEditMode}
                            appendNewRow={appendNewRow}
                            removeRow={removeRow}
                            swapRows={swapRows}
                            setErrorMessage={setErrorMessage}
                        />
                    </OrganisationRoleDependentView>
                ) : (
                    <WikiItemDisplay
                        rowData={rowData}
                        openEditMode={() => {
                            setIsInEditMode(true);
                        }}
                        swapRows={swapRows}
                    />
                ))}
        </>
    );
};

export default EditModeDependentItem;
