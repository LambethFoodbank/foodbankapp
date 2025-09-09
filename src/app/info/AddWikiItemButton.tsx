"use client";

import React from "react";
import { DbWikiRow } from "@/databaseUtils";
import { ButtonMargin } from "@/app/info/StyleComponents";
import { Button } from "@mui/material";
import { logErrorReturnLogId } from "@/logger/logger";
import { PostgrestError } from "@supabase/supabase-js";
import { createItemInWikiTable } from "@/app/info/supabaseHelpers";
import { sendAuditLog } from "@/server/auditLog";

interface WikiRowQuerySuccessType {
    data: DbWikiRow;
    error: null;
}

interface WikiRowQueryFailureType {
    data: null;
    error: PostgrestError;
}
export type WikiRowQueryType = WikiRowQuerySuccessType | WikiRowQueryFailureType;

interface AddWikiItemButtonProps {
    doesEmptyRowExist: boolean;
    appendNewRow: (newRow: DbWikiRow, index: number) => void;
}

const AddWikiItemButton: React.FC<AddWikiItemButtonProps> = ({
    doesEmptyRowExist,
    appendNewRow,
}) => {
    const addWikiItem = async (): Promise<void> => {
        if (doesEmptyRowExist) {
            return;
        }
        const insertResponse = await createItemInWikiTable();
        if (insertResponse.error || !insertResponse.data) {
            const logId = await logErrorReturnLogId("error inserting and fetching new data", insertResponse.error)
            await sendAuditLog({ action: "add wiki item", content: { before: {}, after: {}, actionType: "Create"}, wasSuccess: false, logId });
        } else {
            await sendAuditLog({ action: "add wiki item", content: { before: {}, after: {}, actionType: "Create" }, wasSuccess: true, wikiId: insertResponse.data.wiki_key});
            appendNewRow(insertResponse.data, -1);
        }
    };

    return (
        <ButtonMargin>
            <Button variant="contained" onClick={addWikiItem} data-testid="#add">
                + Add
            </Button>
        </ButtonMargin>
    );
};

export default AddWikiItemButton;
