"use client";

import React, { useCallback, useEffect, useState } from "react";
import supabase from "@/supabaseClient";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import { fetchAuditLog, fetchAuditLogCount } from "./fetchAuditLogData";
import { auditLogTableHeaderKeysAndLabels } from "./columns";
import { getAuditLogErrorMessage, auditLogTableColumnDisplayFunctions } from "./format";
import {
    defaultNumberOfAuditLogRowsPerPage,
    numberOfAuditLogRowsPerPageOption,
} from "./rowsPerPageConstants";
import { AuditLogRow, AuditLogSortState, convertAuditLogPlusRowsToAuditLogRows } from "./types";
import { auditLogTableSortableColumns } from "./sortFunctions";
import AuditLogModal from "./auditLogModal/AuditLogModal";
import { DbAuditLogRow } from "@/databaseUtils";
import FloatingToast from "@/components/FloatingToast";
import { ServerPaginatedMaterialTable } from "@/components/Tables/MaterialTable";
import { MRT_Row } from "material-react-table";

const AuditLogTable: React.FC = () => {
    const [auditLogDataPortion, setAuditLogDataPortion] = useState<AuditLogRow[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [auditLogCount, setAuditLogCount] = useState<number>(0);
    const [sortState, setSortState] = useState<AuditLogSortState>({ sortEnabled: false });
    const [auditLogCountPerPage, setAuditLogCountPerPage] = useState(
        defaultNumberOfAuditLogRowsPerPage
    );
    const [currentPage, setCurrentPage] = useState(0);
    const startPoint = currentPage * auditLogCountPerPage;
    const endPoint = startPoint + auditLogCountPerPage - 1;
    const [selectedAuditLogRow, setSelectedAuditLogRow] = useState<AuditLogRow | null>(null);

    const fetchAndDisplayAuditLog = useCallback(async () => {
        setErrorMessage(null);

        const { count, error: countError } = await fetchAuditLogCount(supabase);
        if (countError) {
            setErrorMessage(getAuditLogErrorMessage(countError));
            return;
        }
        setAuditLogCount(count);

        const { data, error } = await fetchAuditLog(supabase, startPoint, endPoint, sortState);
        if (error) {
            setErrorMessage(getAuditLogErrorMessage(error));
            return;
        }
        const convertedData = convertAuditLogPlusRowsToAuditLogRows(data);
        setAuditLogDataPortion(convertedData);
    }, [startPoint, endPoint, sortState]);

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
    }, [fetchAndDisplayAuditLog]);

    const onRowClick = (row: MRT_Row<AuditLogRow>): void => {
        setSelectedAuditLogRow(row.original);
    };

    return (
        <>
            {errorMessage && (
                <FloatingToast
                    message={errorMessage}
                    severity="warning"
                    variant="filled"
                ></FloatingToast>
            )}
            <ServerPaginatedMaterialTable<AuditLogRow, DbAuditLogRow, never>
                data={auditLogDataPortion}
                headerKeysAndLabels={auditLogTableHeaderKeysAndLabels}
                defaultShownHeaders={[
                    "action",
                    "createdAt",
                    "actorName",
                    "content",
                    "wasSuccess",
                    "logId",
                ]}
                columnDisplayFunctions={auditLogTableColumnDisplayFunctions}
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
                rowActionsConfig={{
                    editable: false,
                }}
                filterConfig={{
                    primaryFiltersShown: false,
                    additionalFiltersShown: false,
                }}
                onRowClick={(row) => onRowClick(row)}
            />
            <AuditLogModal
                selectedAuditLogRow={selectedAuditLogRow}
                onClose={() => setSelectedAuditLogRow(null)}
            />
        </>
    );
};

export default AuditLogTable;
