"use client";

import React, { useEffect, useMemo, useState } from "react";
import supabase from "@/supabaseClient";
import { ParcelsTableRow, ParcelsSortState, ParcelsFilter } from "@/app/parcels/parcelsTable/types";
import { useSearchParams } from "next/navigation";
import { mergeParamsIntoURL, parseQueryParams } from "@/common/urlQueryParams";
import { parcelIdParam } from "@/app/parcels/parcelsTable/constants";
import { getParcelsByIdsWithFiltersAndSorting } from "@/app/parcels/parcelsTable/fetchParcelTableData";
import buildFilters, {
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
import { shouldFilterBeDisabled } from "./packingManagerHelpers";
import dayjs from "dayjs";
import { PreTableControlsContainer } from "@/components/controlsStyling";

type ParcelTableFilterState = string | DateRangeState | string[];

const ParcelsPage: React.FC = () => {
    const searchParams = useSearchParams();

    const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

    const [checkedParcelIds, setCheckedParcelIds] = useState<string[]>([]);

    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

    const [sortState, setSortState] = useState<ParcelsSortState>({ sortEnabled: false });

    const [primaryFilters, setPrimaryFilters] = useState<
        (ParcelsFilter<string> | ParcelsFilter<DateRangeState> | ParcelsFilter<string[]>)[]
    >([]);
    const [additionalFilters, setAdditionalFilters] = useState<
        (ParcelsFilter<string> | ParcelsFilter<DateRangeState> | ParcelsFilter<string[]>)[]
    >([]);

    const [areFiltersLoadingForFirstTime, setAreFiltersLoadingForFirstTime] =
        useState<boolean>(true);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const selectedParcelMessage = getSelectedParcelCountMessage(checkedParcelIds.length);

    const [isPackingManagerView, setIsPackingManagerView] = useState<boolean>(false);

    const today = useMemo(() => dayjs().startOf("day"), []);
    const yesterday = useMemo(() => today.subtract(1, "day"), [today]);

    useEffect(() => {
        (async () => {
            if (primaryFilters.length === 0 && additionalFilters.length === 0) {
                setAreFiltersLoadingForFirstTime(true);
                let filtersObject = await buildFilters();

                const params = parseQueryParams(searchParams);
                filtersObject = updateFiltersFromQueryParams(
                    params,
                    filtersObject.primaryFilters,
                    filtersObject.additionalFilters
                );

                setPrimaryFilters(filtersObject.primaryFilters);
                setAdditionalFilters(filtersObject.additionalFilters);
                setAreFiltersLoadingForFirstTime(false);

                if (params[parcelIdParam]) {
                    openParcelModal(params[parcelIdParam] as string);
                }
            }
        })();
    }, [searchParams]);

    const packingManagerViewPrimaryFilters = useMemo(
        () =>
            primaryFilters.map((filter) => {
                if (filter.key === "packingDate") {
                    return {
                        ...filter,
                        state: { from: yesterday, to: today },
                        isDisabled: true,
                    } as ParcelsFilter<DateRangeState>;
                }
                if (shouldFilterBeDisabled(filter)) {
                    return { ...filter, isDisabled: true };
                }
                return filter;
            }),
        [primaryFilters, today, yesterday]
    );

    const allFilters = useMemo(() => {
        return isPackingManagerView
            ? [...packingManagerViewPrimaryFilters, ...additionalFilters]
            : [...primaryFilters, ...additionalFilters];
    }, [isPackingManagerView, packingManagerViewPrimaryFilters, additionalFilters, primaryFilters]);

    useEffect(() => {
        if (areFiltersLoadingForFirstTime) {
            return;
        }

        const filterParams = buildQueryParamsFromFilters(allFilters);
        mergeParamsIntoURL(searchParams, filterParams);
    }, [allFilters, areFiltersLoadingForFirstTime, searchParams]);

    const getCheckedParcelsData = async (): Promise<ParcelsTableRow[]> => {
        if (checkedParcelIds.length === 0) {
            return [];
        }

        return await getParcelsByIdsWithFiltersAndSorting(
            supabase,
            primaryFilters.concat(additionalFilters),
            sortState,
            checkedParcelIds
        );
    };

    const postCheckedParcelActivity = (): void => {
        setCheckedParcelIds([]);
    };

    const openParcelModal = (parcelId: string): void => {
        setSelectedParcelId(parcelId);
        setModalIsOpen(true);
    };

    const openParcelModalAndUpdateURL = (parcelId: string): void => {
        openParcelModal(parcelId);

        const paramsRecord: Record<string, string> = {};
        paramsRecord[parcelIdParam] = parcelId;
        mergeParamsIntoURL(searchParams, paramsRecord);
    };

    return (
        <>
            <PreTableControlsContainer>
                <PreTableControls
                    isPackingManagerView={isPackingManagerView}
                    setIsPackingManagerView={setIsPackingManagerView}
                    selectedParcelMessage={selectedParcelMessage}
                    getCheckedParcelsData={getCheckedParcelsData}
                    postCheckedParcelActivity={postCheckedParcelActivity}
                />
                <TableFiltersBar<
                    ParcelsTableRow,
                    DistributeServerFilter<ParcelsTableRow, ParcelTableFilterState, DbParcelRow>,
                    ParcelTableFilterState
                >
                    filters={
                        isPackingManagerView ? packingManagerViewPrimaryFilters : primaryFilters
                    }
                    setFilters={setPrimaryFilters}
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
                        appliedFilters={allFilters}
                        areFiltersLoadingForFirstTime={areFiltersLoadingForFirstTime}
                        setErrorMessage={setErrorMessage}
                        isPackingManagerView={isPackingManagerView}
                    />
                    <ParcelsModal
                        modalIsOpen={modalIsOpen}
                        setModalIsOpen={setModalIsOpen}
                        selectedParcelId={selectedParcelId}
                        setSelectedParcelId={setSelectedParcelId}
                    />
                </>
            )}
        </>
    );
};

export default ParcelsPage;
