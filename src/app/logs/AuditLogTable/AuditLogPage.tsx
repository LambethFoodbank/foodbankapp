"use client";

import React, { useEffect, useState } from "react";
import AuditLogTable from "./AuditLogTable";
import AuditLogModal from "./auditLogModal/AuditLogModal";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import { CircularProgress } from "@mui/material";
import FloatingToast from "@/components/FloatingToast";
import { AuditLogRow, AuditLogSortState } from "./types";
import { mergeParamsIntoURL, parseQueryParams } from "@/common/urlQueryParams";
import { logIdParam } from "./constants";
import { useSearchParams } from "next/navigation";

const AuditLogPage: React.FC = () => {
    const searchParams = useSearchParams();

    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    
    const [sortState, setSortState] = useState<AuditLogSortState>({ sortEnabled: false });
    
    const [areFiltersLoadingForFirstTime, setAreFiltersLoadingForFirstTime] =
            useState<boolean>(false);

    const [urlParamsHaveBeenProcessed, setUrlParamsHaveBeenProcessed] = useState<boolean>(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);

    const currentlyAppliedFilters: any[] = [];

    useEffect(() => {
        (async () => {
            if(urlParamsHaveBeenProcessed) {
                return;
            }
            setAreFiltersLoadingForFirstTime(true);

            const urlParams = parseQueryParams(searchParams.toString());

            setAreFiltersLoadingForFirstTime(false);

            // if (urlParams[logIdParam]) {
            //     openLogModal(urlParams[logIdParam] as string);
            // }
            setUrlParamsHaveBeenProcessed(true);
        })
    }, [urlParamsHaveBeenProcessed, searchParams])

    useEffect(() => {
            if (!urlParamsHaveBeenProcessed) {
                return;
            }
    
            // mergeParamsIntoURL(paramsRecord);
        }, [currentlyAppliedFilters, searchParams, urlParamsHaveBeenProcessed]);

    const openLogModal = (row: AuditLogRow): void => {
        setSelectedLog(row);
        setModalIsOpen(true);
    }

    const openLogModalAndUpdateURL = (row: AuditLogRow): void => {
        openLogModal(row);

        const paramsRecord: Record<string, string> = {};
        paramsRecord[logIdParam] = row.logId;
        mergeParamsIntoURL(paramsRecord);
    }

    const closeLogModalAndUpdateURL = (): void => {
        setModalIsOpen(false);
        setSelectedLog(null);

        const paramsRecord: Record<string, string | null> = {};
        paramsRecord[logIdParam] = null;
        mergeParamsIntoURL(paramsRecord);
    }

    return (
        <>
            {areFiltersLoadingForFirstTime ? (
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
                    <AuditLogTable 
                        openAuditLogModal={openLogModalAndUpdateURL}
                        sortState={sortState}
                        setSortState={setSortState}
                        appliedFilters={currentlyAppliedFilters}
                        areFiltersLoadingForFirstTime={areFiltersLoadingForFirstTime}
                        setErrorMessage={setErrorMessage}
                    />
                    <AuditLogModal
                        modalIsOpen={modalIsOpen}
                        selectedAuditLogRow={selectedLog}
                        closeAuditLogModal={closeLogModalAndUpdateURL}
                    />
                </>
            )}
        </>
    );
};

export default AuditLogPage;
