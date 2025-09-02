"use client";

import React, { useEffect, useRef, useState } from "react";
import AuditLogTable from "./AuditLogTable";
import AuditLogModal from "./auditLogModal/AuditLogModal";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import { CircularProgress } from "@mui/material";
import FloatingToast from "@/components/FloatingToast";
import { AuditLogSortState } from "./types";
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

    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

    const currentlyAppliedFilters: any[] = [];

    const refreshAuditLogDetailsRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        (async () => {
            if (urlParamsHaveBeenProcessed) {
                return;
            }
            setAreFiltersLoadingForFirstTime(true);

            const urlParams = parseQueryParams(searchParams.toString());

            setAreFiltersLoadingForFirstTime(false);

            if (urlParams[logIdParam]) {
                openLogModal(urlParams[logIdParam] as string);
            }
            setUrlParamsHaveBeenProcessed(true);
        })();
    }, [urlParamsHaveBeenProcessed, searchParams]);

    const openLogModal = (rowId: string): void => {
        setSelectedLogId(rowId);
        setModalIsOpen(true);
    };

    const openLogModalAndUpdateURL = (rowId: string): void => {
        openLogModal(rowId);

        const paramsRecord: Record<string, string> = {};
        paramsRecord[logIdParam] = rowId;
        mergeParamsIntoURL(paramsRecord);
    };

    const closeLogModalAndUpdateURL = (): void => {
        setModalIsOpen(false);
        setSelectedLogId(null);

        const paramsRecord: Record<string, string | null> = {};
        paramsRecord[logIdParam] = null;
        mergeParamsIntoURL(paramsRecord);
    };

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
                        selectedAuditLogRowId={selectedLogId}
                        closeAuditLogModal={closeLogModalAndUpdateURL}
                        refreshCallback={(refresh) => {
                            refreshAuditLogDetailsRef.current = refresh;
                        }}
                    />
                </>
            )}
        </>
    );
};

export default AuditLogPage;
