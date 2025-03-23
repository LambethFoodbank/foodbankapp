"use client";

import React, { useEffect, useState } from "react";
import {
    ParcelsTableRow,
    ParcelsSortState,
    ParcelsFilter,
    SelectedClientDetails,
} from "@/app/parcels/parcelsTable/types";
import supabase from "@/supabaseClient";
import { getParcelsByIds } from "@/app/parcels/parcelsTable/fetchParcelTableData";
import buildFilters from "@/app/parcels/parcelsTable/filters";
import { getSelectedParcelCountMessage } from "@/app/parcels/parcelsTable/format";
import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import PreTableControls from "@/app/parcels/parcelsTable/PreTableControls";
import ParcelsTable from "@/app/parcels/parcelsTable/ParcelsTable";
import ParcelsModal from "@/app/parcels/parcelsTable/ParcelsModal";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import { CircularProgress } from "@mui/material";
import FloatingToast from "@/components/FloatingToast";

const ParcelsPage: React.FC = () => {
    const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
    const [selectedClientDetails, setSelectedClientDetails] =
        useState<SelectedClientDetails | null>(null);

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

    const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);

    const selectedParcelMessage = getSelectedParcelCountMessage(checkedParcelIds.length);

    const [isPackingManagerView, setIsPackingManagerView] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            setAreFiltersLoadingForFirstTime(true);
            const filtersObject = await buildFilters();
            setPrimaryFilters(filtersObject.primaryFilters);
            setAdditionalFilters(filtersObject.additionalFilters);
            setAreFiltersLoadingForFirstTime(false);
        })();
    }, []);

    const getCheckedParcelsData = async (): Promise<ParcelsTableRow[]> => {
        if (checkedParcelIds.length === 0) {
            return [];
        }

        return await getParcelsByIds(
            supabase,
            primaryFilters.concat(additionalFilters),
            sortState,
            checkedParcelIds
        );
    };

    const postCheckedParcelActivity = (): void => {
        setCheckedParcelIds([]);
    };

    return (
        <>
            <PreTableControls
                isPackingManagerView={isPackingManagerView}
                setIsPackingManagerView={setIsPackingManagerView}
                selectedParcelMessage={selectedParcelMessage}
                getCheckedParcelsData={getCheckedParcelsData}
                postCheckedParcelActivity={postCheckedParcelActivity}
            />
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
                        setSelectedParcelId={setSelectedParcelId}
                        setSelectedClientDetails={setSelectedClientDetails}
                        checkedParcelIds={checkedParcelIds}
                        setCheckedParcelIds={setCheckedParcelIds}
                        setModalIsOpen={setModalIsOpen}
                        sortState={sortState}
                        setSortState={setSortState}
                        primaryFilters={primaryFilters}
                        setPrimaryFilters={setPrimaryFilters}
                        additionalFilters={additionalFilters}
                        setAdditionalFilters={setAdditionalFilters}
                        areFiltersLoadingForFirstTime={areFiltersLoadingForFirstTime}
                        setErrorMessage={setErrorMessage}
                        setModalErrorMessage={setModalErrorMessage}
                        isPackingManagerView={isPackingManagerView}
                    />
                    <ParcelsModal
                        modalIsOpen={modalIsOpen}
                        setModalIsOpen={setModalIsOpen}
                        selectedParcelId={selectedParcelId}
                        selectedClientDetails={selectedClientDetails}
                        modalErrorMessage={modalErrorMessage}
                    />
                </>
            )}
        </>
    );
};

export default ParcelsPage;
