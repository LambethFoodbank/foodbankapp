"use client";

import React, { useEffect, useMemo, useState } from "react";
import supabase from "@/supabaseClient";
import {
    ParcelsTableRow,
    ParcelsSortState,
    ParcelsFilters,
} from "@/app/parcels/parcelsTable/types";
import { useSearchParams } from "next/navigation";
import { mergeParamsIntoURL, parseQueryParams } from "@/common/urlQueryParams";
import { parcelIdParam } from "@/app/parcels/parcelsTable/constants";
import { pageViewTypePackingManager, pageViewTypeQueryParam } from "@/common/constants";
import { getParcelsByIdsWithFiltersAndSorting } from "@/app/parcels/parcelsTable/fetchParcelTableData";
import {
    buildParcelFilters,
    buildPackingManagerPrimaryFilters,
    buildQueryParamsFromFilters,
    updateFiltersFromQueryParams,
} from "@/app/parcels/parcelsTable/filters";
import { getSelectedParcelCountMessage } from "@/app/parcels/parcelsTable/format";
import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import PreTableControls from "@/app/parcels/parcelsTable/PreTableControls";
import ParcelsTable from "@/app/parcels/parcelsTable/ParcelsTable";
import ParcelsModal from "@/app/parcels/parcelsTable/ParcelsModal";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import { CircularProgress } from "@mui/material";
import FloatingToast from "@/components/FloatingToast";
import TableFiltersBar from "@/components/Tables/TableFiltersBar";
import { DistributeServerFilter } from "@/components/Tables/Filters";
import { DbParcelRow } from "@/databaseUtils";
import dayjs from "dayjs";
import { PreTableControlsContainer } from "@/components/controlsStyling";

type ParcelTableFilterState = string | DateRangeState | string[];

const ParcelsPage: React.FC = () => {
    const searchParams = useSearchParams();

    const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

    const [checkedParcelIds, setCheckedParcelIds] = useState<string[]>([]);

    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

    const [sortState, setSortState] = useState<ParcelsSortState>({ sortEnabled: false });

    const [primaryFilters, setPrimaryFilters] = useState<ParcelsFilters>([]);
    const [additionalFilters, setAdditionalFilters] = useState<ParcelsFilters>([]);

    const [isPackingManagerView, setIsPackingManagerView] = useState<boolean>(false);
    const [packingManagerViewPrimaryFilters, setPackingManagerViewPrimaryFilters] =
        useState<ParcelsFilters>([]);

    const [areFiltersLoadingForFirstTime, setAreFiltersLoadingForFirstTime] =
        useState<boolean>(true);
    const [urlParamsHaveBeenProcessed, setUrlParamsHaveBeenProcessed] = useState<boolean>(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const selectedParcelMessage = getSelectedParcelCountMessage(checkedParcelIds.length);

    const today = useMemo(() => dayjs().startOf("day"), []);
    const yesterday = useMemo(() => today.subtract(1, "day"), [today]);

    useEffect(() => {
        (async () => {
            if (urlParamsHaveBeenProcessed) {
                return;
            }

            setAreFiltersLoadingForFirstTime(true);

            const urlParams = parseQueryParams(searchParams.toString());

            let filtersObject = await buildParcelFilters(today);

            filtersObject = updateFiltersFromQueryParams(
                urlParams,
                filtersObject.primaryFilters,
                filtersObject.additionalFilters
            );

            setPrimaryFilters(filtersObject.primaryFilters);
            setAdditionalFilters(filtersObject.additionalFilters);
            setAreFiltersLoadingForFirstTime(false);

            setIsPackingManagerView(
                filtersObject.primaryFilters.find((filter) => filter.key === pageViewTypeQueryParam)
                    ?.state === pageViewTypePackingManager
            );

            if (urlParams[parcelIdParam]) {
                openParcelModal(urlParams[parcelIdParam] as string);
            }

            setUrlParamsHaveBeenProcessed(true);
        })();
    }, [urlParamsHaveBeenProcessed, searchParams, primaryFilters, additionalFilters, today]);

    useEffect(() => {
        setPackingManagerViewPrimaryFilters(
            buildPackingManagerPrimaryFilters(primaryFilters, today, yesterday)
        );
    }, [primaryFilters, today, yesterday]);

    const currentlyAppliedFilters = useMemo(() => {
        return isPackingManagerView
            ? [...packingManagerViewPrimaryFilters, ...additionalFilters]
            : [...primaryFilters, ...additionalFilters];
    }, [isPackingManagerView, packingManagerViewPrimaryFilters, primaryFilters, additionalFilters]);

    useEffect(() => {
        if (!urlParamsHaveBeenProcessed) {
            return;
        }

        const paramsRecord = buildQueryParamsFromFilters(currentlyAppliedFilters);
        mergeParamsIntoURL(paramsRecord);
    }, [isPackingManagerView, currentlyAppliedFilters, searchParams, urlParamsHaveBeenProcessed]);

    const getCheckedParcelsData = async (): Promise<ParcelsTableRow[]> => {
        if (checkedParcelIds.length === 0) {
            return [];
        }

        return await getParcelsByIdsWithFiltersAndSorting(
            supabase,
            currentlyAppliedFilters,
            sortState,
            checkedParcelIds
        );
    };

    const postCheckedParcelActivity = (): void => {
        setCheckedParcelIds([]);
    };

    const setIsPackingManagerViewInternal = (isPackingManager: boolean): void => {
        const viewFilter = primaryFilters.find((filter) => filter.key === pageViewTypeQueryParam);
        if (viewFilter) {
            viewFilter.state = isPackingManager ? pageViewTypePackingManager : "";
        }

        setIsPackingManagerView(isPackingManager);
    };

    const openParcelModal = (parcelId: string): void => {
        setSelectedParcelId(parcelId);
        setModalIsOpen(true);
    };

    const openParcelModalAndUpdateURL = (parcelId: string): void => {
        openParcelModal(parcelId);

        const paramsRecord: Record<string, string> = {};
        paramsRecord[parcelIdParam] = parcelId;
        mergeParamsIntoURL(paramsRecord);
    };

    const closeParcelModalAndUpdateURL = (): void => {
        setModalIsOpen(false);
        setSelectedParcelId(null);

        const paramsRecord: Record<string, string | null> = {};
        paramsRecord[parcelIdParam] = null;
        mergeParamsIntoURL(paramsRecord);
    };

    return (
        <>
            <PreTableControlsContainer>
                <PreTableControls
                    isPackingManagerView={isPackingManagerView}
                    setIsPackingManagerView={setIsPackingManagerViewInternal}
                    selectedParcelMessage={selectedParcelMessage}
                    getCheckedParcelsData={getCheckedParcelsData}
                    postCheckedParcelActivity={postCheckedParcelActivity}
                />
                <TableFiltersBar<
                    ParcelsTableRow,
                    DistributeServerFilter<ParcelsTableRow, ParcelTableFilterState, DbParcelRow>,
                    ParcelTableFilterState
                >
                    primaryFilters={
                        isPackingManagerView ? packingManagerViewPrimaryFilters : primaryFilters
                    }
                    setPrimaryFilters={
                        isPackingManagerView
                            ? setPackingManagerViewPrimaryFilters
                            : setPrimaryFilters
                    }
                    additionalFilters={additionalFilters}
                    setAdditionalFilters={setAdditionalFilters}
                />
            </PreTableControlsContainer>

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
                    <ParcelsTable
                        checkedParcelIds={checkedParcelIds}
                        setCheckedParcelIds={setCheckedParcelIds}
                        openParcelModal={openParcelModalAndUpdateURL}
                        sortState={sortState}
                        setSortState={setSortState}
                        appliedFilters={currentlyAppliedFilters}
                        areFiltersLoadingForFirstTime={areFiltersLoadingForFirstTime}
                        setErrorMessage={setErrorMessage}
                    />
                    <ParcelsModal
                        modalIsOpen={modalIsOpen}
                        selectedParcelId={selectedParcelId}
                        closeParcelModal={closeParcelModalAndUpdateURL}
                    />
                </>
            )}
        </>
    );
};

export default ParcelsPage;
