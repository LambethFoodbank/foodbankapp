"use client";

import { Centerer } from "@/components/Modal/ModalFormStyles";
import TableSurface from "@/components/Tables/TableSurface";
import supabase from "@/supabaseClient";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { CircularProgress } from "@mui/material";
import reportsHeaders from "./headers";
import { ReportsTableRow, ReportsSortState } from "./types";
import { DbReportRow } from "@/databaseUtils";
import getReportsDataAndCount from "./getReportsData";
import reportsSortableColumns from "./sortableColumns";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import { reportsTableColumnStyleOptions } from "@/app/reports/reportsTable/styles";
import FloatingToast from "@/components/FloatingToast";
import { ServerPaginatedMaterialTable } from "@/components/Tables/MaterialTable";

const ReportsPage: React.FC = () => {
    const [isLoadingForFirstTime, setIsLoadingForFirstTime] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [reportsDataPortion, setReportsDataPortion] = useState<ReportsTableRow[]>([]);
    const [filteredReportCount, setFilteredReportCount] = useState<number>(0);
    const [sortState, setSortState] = useState<ReportsSortState>({ sortEnabled: false });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const reportTableFetchAbortController = useRef<AbortController | null>(null);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const startPoint = currentPage * perPage;
    const endPoint = startPoint + perPage - 1;

    const fetchAndDisplayReportsData = useCallback(async () => {
        setIsLoading(true);
        if (reportTableFetchAbortController.current) {
            reportTableFetchAbortController.current.abort("stale request");
        }
        reportTableFetchAbortController.current = new AbortController();
        if (reportTableFetchAbortController.current) {
            setErrorMessage(null);
            const { data, error } = await getReportsDataAndCount(
                supabase,
                startPoint,
                endPoint,
                sortState,
                reportTableFetchAbortController.current.signal
            );

            if (error) {
                switch (error.type) {
                    case "abortedFetchingReportsTable":
                    case "abortedFetchingReportsTableCount":
                        return;
                    case "failedToFetchReportsTable":
                    case "failedToFetchReportsTableCount":
                        setErrorMessage(`Error occurred: ${error.type}, Log ID: 
                    ${error.logId}`);
                        break;
                }
            } else {
                setReportsDataPortion(data.reportsData);
                setFilteredReportCount(data.count);
            }
            reportTableFetchAbortController.current = null;
            setIsLoading(false);
            setIsLoadingForFirstTime(false);
        }
    }, [startPoint, endPoint, sortState]);

    useEffect(() => {
        void fetchAndDisplayReportsData();
    }, [fetchAndDisplayReportsData]);

    useEffect(() => {
        const subscriptionChannel = supabase
            .channel("parcels-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "parcels" },
                fetchAndDisplayReportsData
            )
            .subscribe((status, err) => {
                if (subscriptionStatusRequiresErrorMessage(status, err, "parcels")) {
                    setErrorMessage("Error fetching data, please reload");
                } else {
                    setErrorMessage(null);
                }
            });

        return () => {
            void supabase.removeChannel(subscriptionChannel);
        };
    }, [startPoint, endPoint, sortState, fetchAndDisplayReportsData]);

    return (
        <>
            {isLoadingForFirstTime ? (
                <Centerer>
                    <CircularProgress aria-label="table-initial-progress-bar" />
                </Centerer>
            ) : (
                <>
                    {errorMessage && (
                        <FloatingToast
                            message={errorMessage}
                            severity="warning"
                            variant="filled"
                        ></FloatingToast>
                    )}
                    <TableSurface>
                        <ServerPaginatedMaterialTable<ReportsTableRow, DbReportRow, never>
                            data={reportsDataPortion}
                            paginationConfig={{
                                enablePagination: true,
                                filteredCount: filteredReportCount,
                                onPageChange: setCurrentPage,
                                onPerPageChange: setPerPage,
                            }}
                            sortConfig={{
                                sortPossible: true,
                                sortableColumns: reportsSortableColumns,
                                setSortState: setSortState,
                            }}
                            columnStyleOptions={reportsTableColumnStyleOptions}
                            headerKeysAndLabels={reportsHeaders}
                            filterConfig={{
                                primaryFiltersShown: false,
                                additionalFiltersShown: false,
                            }}
                            checkboxConfig={{ displayed: false }}
                            rowActionsConfig={{ editable: false }}
                            isLoading={isLoading}
                        />
                    </TableSurface>
                </>
            )}
        </>
    );
};

export default ReportsPage;
