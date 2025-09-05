"use client";

import { v4 as uuidv4 } from "uuid";
import { DbWikiRow } from "@/databaseUtils";
import { WikiItemPositioner } from "@/app/info/StyleComponents";
import React, { useEffect, useMemo, useRef } from "react";
import EditModeDependentItem from "@/app/info/EditModeDependentItem";
import OrganisationRoleDependentView from "@/app/info/OrganisationRoleDependentView";
import AddWikiItemButton from "@/app/info/AddWikiItemButton";
import { logErrorReturnLogId } from "@/logger/logger";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { TextValueContainer } from "@/app/admin/auditLogTable/auditLogModal/AuditLogModalRow";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import { fetchWikiRow, reorderTwoItemsInWikiTable } from "@/app/info/supabaseHelpers";

interface WikiItemsProps {
    rows: DbWikiRow[];
}

interface WikiItemProps {
    row: DbWikiRow;
    appendNewRow: (newRow: DbWikiRow, index: number) => void;
    removeRow: (row: DbWikiRow) => number;
    swapRows: (row1: DbWikiRow, direction: DirectionString) => void;
    setErrorMessage: (errorMessage: string | null) => void;
}

interface ContentPart {
    content: string;
    key: string;
    href?: string;
}

export type DirectionString = "up" | "down";

export const convertContentToElements = (rowContent: string): React.JSX.Element[] => {
    const rowContentParts = rowContent.split(/(\[.*\]\(.*\)|<.*>)/);
    const contentParts: ContentPart[] = rowContentParts.map((part, index) => {
        if (index % 2 === 1) {
            const plainPart = part.slice(1, -1);
            if (plainPart.includes("](")) {
                const items = plainPart.split(/\]\(/);
                return { content: items[0], href: items[1], key: uuidv4() };
            } else {
                return { content: plainPart, href: plainPart, key: uuidv4() };
            }
        } else {
            return { content: part, key: uuidv4() };
        }
    });
    return contentParts.map((part: ContentPart) => {
        return part.href ? (
            <a href={part.href} key={part.key}>
                {part.content}
            </a>
        ) : (
            <span key={part.key}>{part.content}</span>
        );
    });
};

const WikiItem: React.FC<
    WikiItemProps & {
        activeEditRowId: string | null;
        setActiveEditRowId: (id: string | null) => void;
    }
> = ({
    row,
    appendNewRow,
    removeRow,
    swapRows,
    setErrorMessage,
    activeEditRowId,
    setActiveEditRowId,
}) => {
    return (
        <WikiItemPositioner>
            <EditModeDependentItem
                row={row}
                appendNewRow={appendNewRow}
                removeRow={removeRow}
                swapRows={swapRows}
                setErrorMessage={setErrorMessage}
                activeEditRowId={activeEditRowId}
                setActiveEditRowId={setActiveEditRowId}
            />
        </WikiItemPositioner>
    );
};

const swapTwoRowsInDisplayRows = (
    displayRows: DbWikiRow[],
    row1: DbWikiRow,
    row2: DbWikiRow
): DbWikiRow[] => {
    const wiki_keys = displayRows.map((displayRows) => displayRows.wiki_key);

    const row1Index = wiki_keys.indexOf(row1.wiki_key);
    const row2Index = wiki_keys.indexOf(row2.wiki_key);

    const row1Item = displayRows[row1Index];
    const row1Order = row1Item.row_order;

    const row2Item = displayRows[row2Index];
    const row2Order = row2Item.row_order;

    row1Item.row_order = row2Order;
    row2Item.row_order = row1Order;

    const newDisplayRows = [...displayRows];

    newDisplayRows[row1Index] = row2Item;
    newDisplayRows[row2Index] = row1Item;

    return newDisplayRows;
};

const WikiItems: React.FC<WikiItemsProps> = ({ rows }) => {
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [activeEditRowId, setActiveEditRowId] = React.useState<string | null>(null);

    const sortedRows: DbWikiRow[] = rows.slice().sort((r1: DbWikiRow, r2: DbWikiRow) => {
        return r1.row_order > r2.row_order ? 1 : -1;
    });

    const [displayRows, setDisplayRows] = React.useState<DbWikiRow[]>(sortedRows);

    const wikiItemsEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (wikiItemsEndRef.current) {
            wikiItemsEndRef.current.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, [displayRows]);

    const doesEmptyRowExist: boolean = useMemo(
        () => displayRows.some((row) => !row.title && !row.content),
        [displayRows]
    );

    const appendNewRow = (newRow: DbWikiRow, index: number): void => {
        if (index === -1) {
            index = displayRows.length;
        }

        setDisplayRows((displayRows) => {
            const temp = displayRows.slice();
            temp.splice(index, 0, newRow);
            return temp;
        });
    };

    const removeRow = (row: DbWikiRow): number => {
        const indexToRemove: number = displayRows.findIndex(
            (sortedRow) => row.wiki_key === sortedRow.wiki_key
        );
        setDisplayRows((displayRows) => {
            const temp = displayRows.slice();
            temp.splice(indexToRemove, 1);
            return temp;
        });
        return indexToRemove;
    };

    const swapRows = async (row1: DbWikiRow, direction: DirectionString): Promise<void> => {
        const rowIndex1 = displayRows.findIndex((row) => {
            return row.wiki_key == row1.wiki_key;
        });
        const rowIndex2 = rowIndex1 + (direction === "up" ? -1 : 1);

        if (rowIndex2 < 0 || rowIndex2 >= displayRows.length) {
            return;
        }

        const row2 = displayRows[rowIndex2];

        const reorderError = await reorderTwoItemsInWikiTable(row1.wiki_key, row2.wiki_key);

        const updatedRow1WithLastUpdated = await fetchWikiRow(row1.wiki_key);
        const lastUpdatedRow1 = updatedRow1WithLastUpdated.last_updated;
        const updatedRow2WithLastUpdated = await fetchWikiRow(row2.wiki_key);
        const lastUpdatedRow2 = updatedRow2WithLastUpdated.last_updated;

        row1.last_updated = lastUpdatedRow1;
        row2.last_updated = lastUpdatedRow2;

        const auditLog = {
            action: `move a wiki item ${row1.row_order <= row2.row_order ? "down" : "up"}`,
            wikiId: row1.wiki_key,
            content: {
                itemName: row1.title,
                oldRowOrder: row1.row_order,
            },
        } as const satisfies Partial<AuditLog>;

        if (reorderError) {
            const logId = await logErrorReturnLogId(
                "Error with supabase function swap_two_wiki_rows",
                {
                    error: reorderError,
                }
            );
            setErrorMessage(`Failed to swap rows. Log ID: ${logId}`);

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
                content: { ...auditLog.content, newRowOrder: row2.row_order },
            });
        }

        reorderDisplayRows(displayRows, row1, row2);
    };

    const reorderDisplayRows = (
        displayRows: DbWikiRow[],
        row1: DbWikiRow,
        row2: DbWikiRow
    ): void => {
        setDisplayRows(swapTwoRowsInDisplayRows(displayRows, row1, row2));
    };

    return (
        <>
            <OrganisationRoleDependentView>
                <AddWikiItemButton
                    doesEmptyRowExist={doesEmptyRowExist}
                    appendNewRow={appendNewRow}
                />
            </OrganisationRoleDependentView>
            {errorMessage && (
                <TextValueContainer>
                    <ErrorSecondaryText>{errorMessage}</ErrorSecondaryText>
                </TextValueContainer>
            )}
            {displayRows.map((row: DbWikiRow) => {
                return (
                    <WikiItem
                        row={row}
                        appendNewRow={appendNewRow}
                        removeRow={removeRow}
                        swapRows={swapRows}
                        key={row.wiki_key}
                        setErrorMessage={setErrorMessage}
                        activeEditRowId={activeEditRowId}
                        setActiveEditRowId={setActiveEditRowId}
                    />
                );
            })}
            <div ref={wikiItemsEndRef} />
        </>
    );
};

export default WikiItems;
