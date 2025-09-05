"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Row, ServerPaginatedTable } from "@/components/Tables/Table";
import supabase from "@/supabaseClient";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import { getAuditLogTableDataAndAllIds } from "./fetchAuditLogData";
import { auditLogTableHeaderKeysAndLabels } from "./columns";
import { getAuditLogErrorMessage, auditLogTableColumnDisplayFunctions } from "./format";
import { defaultNumberOfAuditLogRowsPerPage, numberOfAuditLogRowsPerPageOption } from "./constants";
import { AuditLogRow, AuditLogSortState } from "./types";
import { auditLogTableSortableColumns } from "./sortFunctions";
import { DbAuditLogRow } from "@/databaseUtils";
import TableSurface from "@/components/Tables/TableSurface";

interface AuditLogTableProps {
    openAuditLogModal: (rowId: string) => void;
    sortState: AuditLogSortState;
    setSortState: (sortStte: AuditLogSortState) => void;
    areFiltersLoadingForFirstTime: boolean;
    setErrorMessage: (errorMessage: string | null) => void;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({
    openAuditLogModal,
    sortState,
    setSortState,
    areFiltersLoadingForFirstTime,
    setErrorMessage,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [auditLogDataPortion, setAuditLogDataPortion] = useState<AuditLogRow[]>([]);
    const [auditLogCount, setAuditLogCount] = useState<number>(0);

    const [auditLogCountPerPage, setAuditLogCountPerPage] = useState(
        defaultNumberOfAuditLogRowsPerPage
    );
    const [currentPage, setCurrentPage] = useState(1);
    const startPoint = (currentPage - 1) * auditLogCountPerPage;
    const endPoint = currentPage * auditLogCountPerPage - 1;

    const auditLogsTableFetchAbortController = useRef<AbortController | null>(null);
    const latestFetchRequestId = useRef<number>(0);

    const fetchAndDisplayAuditLog = useCallback(async (): Promise<void> => {
        setIsLoading(true);

        latestFetchRequestId.current += 1;
        const currentFetchRequestId = latestFetchRequestId.current;

        if (auditLogsTableFetchAbortController.current) {
            auditLogsTableFetchAbortController.current.abort("stale request");
        }

        auditLogsTableFetchAbortController.current = new AbortController();
        setErrorMessage(null);

        if (auditLogsTableFetchAbortController.current) {
            const { data, error } = await getAuditLogTableDataAndAllIds(
                supabase,
                sortState,
                startPoint,
                endPoint,
                auditLogsTableFetchAbortController.current.signal
            );
            if (currentFetchRequestId === latestFetchRequestId.current) {
                if (error) {
                    const newErrorMessage = getAuditLogErrorMessage(error);
                    if (newErrorMessage !== null) {
                        setErrorMessage(`Log ID: ${error.logId}`);
                    }
                } else {
                    setAuditLogDataPortion(data.auditLogTableRows);
                    setAuditLogCount(data.allAuditLogIds.length);
                }
            }
        }
        auditLogsTableFetchAbortController.current = null;
        setIsLoading(false);
    }, [endPoint, sortState, startPoint, setErrorMessage]);

    useEffect(() => {
        if (!areFiltersLoadingForFirstTime) {
            void fetchAndDisplayAuditLog();
        }
    }, [areFiltersLoadingForFirstTime, fetchAndDisplayAuditLog]);

    useEffect(() => {
        void fetchAndDisplayAuditLog();
    }, [fetchAndDisplayAuditLog]);

    useEffect(() => {
        const subscriptionChannel = supabase
            .channel("audit-logs-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "audit_log" },
                fetchAndDisplayAuditLog
            )
            .subscribe((status, err) => {
                if (subscriptionStatusRequiresErrorMessage(status, err, "audit_log")) {
                    setErrorMessage("Error fetching data, please reload");
                } else {
                    setErrorMessage(null);
                }
            });

        return () => {
            void supabase.removeChannel(subscriptionChannel);
        };
    });

    const onAuditTableRowClick = (row: Row<AuditLogRow>): void => {
        openAuditLogModal(row.data.auditLogId);
    };

    return (
        <>
            <TableSurface>
                <ServerPaginatedTable<AuditLogRow, DbAuditLogRow, never>
                    dataPortion={auditLogDataPortion}
                    isLoading={isLoading}
                    headerKeysAndLabels={auditLogTableHeaderKeysAndLabels}
                    defaultShownHeaders={[
                        "action",
                        "createdAt",
                        "actorName",
                        "content",
                        "wasSuccess",
                        "auditLogId",
                    ]}
                    columnDisplayFunctions={auditLogTableColumnDisplayFunctions}
                    onRowClick={onAuditTableRowClick}
                    paginationConfig={{
                        enablePagination: true,
                        filteredCount: auditLogCount,
                        onPageChange: setCurrentPage,
                        onPerPageChange: setAuditLogCountPerPage,
                        defaultRowsPerPage: defaultNumberOfAuditLogRowsPerPage,
                        rowsPerPageOptions: numberOfAuditLogRowsPerPageOption,
                    }}
                    checkboxConfig={{ displayed: false }}
                    sortConfig={{
                        sortPossible: true,
                        sortableColumns: auditLogTableSortableColumns,
                        setSortState: setSortState,
                    }}
                    editableConfig={{
                        editable: false,
                    }}
                    filterConfig={{
                        primaryFiltersShown: false,
                        additionalFiltersShown: false,
                    }}
                />
            </TableSurface>
        </>
    );
};

export default AuditLogTable;
