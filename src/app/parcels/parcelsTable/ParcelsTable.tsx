import { BreakPointConfig, Row, ServerPaginatedTable } from "@/components/Tables/Table";
import TableSurface from "@/components/Tables/TableSurface";
import {
    ParcelsFilter,
    ParcelsSortState,
    ParcelsTableRow,
    SelectedClientDetails,
} from "@/app/parcels/parcelsTable/types";
import { DbParcelRow } from "@/databaseUtils";
import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import {
    defaultNumberOfParcelsPerPage,
    numberOfParcelsPerPageOptions,
    parcelIdParam,
} from "@/app/parcels/parcelsTable/constants";
import {
    parcelTableDefaultShownHeaders,
    parcelTableHeaderKeysAndLabels,
    parcelTableToggleableHeaders,
} from "@/app/parcels/parcelsTable/headers";
import {
    getClientIdAndIsActiveErrorMessage,
    getParcelDataErrorMessage,
    parcelTableColumnDisplayFunctions,
} from "@/app/parcels/parcelsTable/format";
import { parcelTableColumnStyleOptions } from "@/app/parcels/parcelsTable/styles";
import parcelsSortableColumns, {
    defaultParcelsSortConfig,
} from "@/app/parcels/parcelsTable/sortableColumns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import {
    shouldFilterBeDisabled,
    shouldBeInPackingManagerView,
} from "@/app/parcels/parcelsTable/packingManagerHelpers";
import { useRouter, useSearchParams } from "next/navigation";
import {
    getClientIdAndIsActive,
    getParcelIds,
    getParcelsDataAndCount,
} from "@/app/parcels/parcelsTable/fetchParcelTableData";
import supabase from "@/supabaseClient";
import { searchForBreakPoints } from "@/app/parcels/parcelsTable/conditionalStyling";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";

interface ParcelsTableProps {
    setSelectedParcelId: (parcelId: string | null) => void;
    setSelectedClientDetails: (clientDetails: SelectedClientDetails | null) => void;
    checkedParcelIds: string[];
    setCheckedParcelIds: (ids: string[]) => void;
    setModalIsOpen: (isOpen: boolean) => void;
    sortState: ParcelsSortState;
    setSortState: (sortState: ParcelsSortState) => void;
    primaryFilters: (
        | ParcelsFilter<string>
        | ParcelsFilter<DateRangeState>
        | ParcelsFilter<string[]>
    )[];
    setPrimaryFilters: (
        filters: (ParcelsFilter<string> | ParcelsFilter<DateRangeState> | ParcelsFilter<string[]>)[]
    ) => void;
    additionalFilters: (
        | ParcelsFilter<string>
        | ParcelsFilter<DateRangeState>
        | ParcelsFilter<string[]>
    )[];
    setAdditionalFilters: (
        filters: (ParcelsFilter<string> | ParcelsFilter<DateRangeState> | ParcelsFilter<string[]>)[]
    ) => void;
    areFiltersLoadingForFirstTime: boolean;
    setErrorMessage: (errorMessage: string | null) => void;
    setModalErrorMessage: (errorMessage: string | null) => void;
    isPackingManagerView: boolean;
}

const ParcelsTable: React.FC<ParcelsTableProps> = ({
    setSelectedParcelId,
    setSelectedClientDetails,
    checkedParcelIds,
    setCheckedParcelIds,
    setModalIsOpen,
    sortState,
    setSortState,
    primaryFilters,
    setPrimaryFilters,
    additionalFilters,
    setAdditionalFilters,
    areFiltersLoadingForFirstTime,
    setErrorMessage,
    setModalErrorMessage,
    isPackingManagerView,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [parcelsDataPortion, setParcelsDataPortion] = useState<ParcelsTableRow[]>([]);

    const [parcelRowBreakPointConfig, setParcelRowBreakPointConfig] = useState<BreakPointConfig[]>(
        []
    );

    const [isAllCheckBoxSelected, setAllCheckBoxSelected] = useState(false);
    const fetchParcelsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const searchParams = useSearchParams();
    const parcelId = searchParams.get(parcelIdParam);

    const [parcelCountPerPage, setParcelCountPerPage] = useState(defaultNumberOfParcelsPerPage);
    const [currentPage, setCurrentPage] = useState(1);
    const startPoint = (currentPage - 1) * parcelCountPerPage;
    const endPoint = currentPage * parcelCountPerPage - 1;

    const parcelsTableFetchAbortController = useRef<AbortController | null>(null);

    const router = useRouter();

    const today = useMemo(() => dayjs().startOf("day"), []);
    const yesterday = useMemo(() => today.subtract(1, "day"), [today]);

    const fetchAndSetClientDetailsForSelectedParcel = useCallback(async (): Promise<void> => {
        if (parcelId === null) {
            return;
        }

        const { data, error } = await getClientIdAndIsActive(parcelId);
        if (error) {
            setModalErrorMessage(getClientIdAndIsActiveErrorMessage(error));
        } else {
            setSelectedClientDetails(data);
        }
    }, [parcelId, setSelectedClientDetails, setModalErrorMessage]);

    useEffect(() => {
        if (parcelId) {
            setSelectedParcelId(parcelId);
            setModalIsOpen(true);
        }
    }, [parcelId, setSelectedParcelId, setModalIsOpen]);

    useEffect(() => {
        setSelectedClientDetails(null);
        void fetchAndSetClientDetailsForSelectedParcel();
    }, [fetchAndSetClientDetailsForSelectedParcel, setSelectedClientDetails]);

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

    const fetchAndDisplayParcelsData = useCallback(async (): Promise<void> => {
        const allFilters = isPackingManagerView
            ? [...packingManagerViewPrimaryFilters, ...additionalFilters]
            : [...primaryFilters, ...additionalFilters];

        if (parcelsTableFetchAbortController.current) {
            parcelsTableFetchAbortController.current.abort("stale request");
        }

        parcelsTableFetchAbortController.current = new AbortController();

        if (parcelsTableFetchAbortController.current) {
            setErrorMessage(null);
            setIsLoading(true);

            const { data, error } = await getParcelsDataAndCount(
                supabase,
                allFilters,
                sortState,
                parcelsTableFetchAbortController.current.signal,
                startPoint,
                endPoint
            );

            if (error) {
                const newErrorMessage = getParcelDataErrorMessage(error.type);
                if (newErrorMessage !== null) {
                    setErrorMessage(`${newErrorMessage} Log ID: ${error.logId}`);
                }
            } else {
                setParcelsDataPortion(data.parcelTableRows);
                if (sortState.sortEnabled && sortState.column.headerKey) {
                    setParcelRowBreakPointConfig(
                        searchForBreakPoints(sortState.column.headerKey, data.parcelTableRows)
                    );
                } else {
                    // The user hasn't request a specific sort, so breakpoints are as per default sorting
                    setParcelRowBreakPointConfig(
                        searchForBreakPoints(
                            defaultParcelsSortConfig.defaultColumnHeaderKey as keyof ParcelsTableRow,
                            data.parcelTableRows
                        )
                    );
                }
            }

            parcelsTableFetchAbortController.current = null;
            setIsLoading(false);
        }
    }, [
        additionalFilters,
        endPoint,
        primaryFilters,
        sortState,
        startPoint,
        isPackingManagerView,
        packingManagerViewPrimaryFilters,
        setErrorMessage,
    ]);

    useEffect(() => {
        if (!areFiltersLoadingForFirstTime) {
            void fetchAndDisplayParcelsData();
        }
    }, [areFiltersLoadingForFirstTime, fetchAndDisplayParcelsData]);

    const packingManagerViewDataPortion = useMemo(
        () =>
            parcelsDataPortion.filter((parcel) =>
                shouldBeInPackingManagerView(parcel, today, yesterday)
            ),
        [parcelsDataPortion, today, yesterday]
    );

    const filteredParcelCount = isPackingManagerView
        ? packingManagerViewDataPortion.length
        : parcelsDataPortion.length;

    const loadCountAndDataWithTimer = (): void => {
        if (fetchParcelsTimer.current) {
            clearTimeout(fetchParcelsTimer.current);
            fetchParcelsTimer.current = null;
        }

        setIsLoading(true);
        fetchParcelsTimer.current = setTimeout(() => {
            void fetchAndDisplayParcelsData();
        }, 500);
    };

    useEffect(() => {
        const subscriptionChannel = supabase
            .channel("parcels-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "parcels" },
                loadCountAndDataWithTimer
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "events" },
                loadCountAndDataWithTimer
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "families" },
                loadCountAndDataWithTimer
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "collection_centres" },
                loadCountAndDataWithTimer
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "clients" },
                loadCountAndDataWithTimer
            )
            .subscribe((status, err) => {
                if (subscriptionStatusRequiresErrorMessage(status, err, "parcels and related")) {
                    setErrorMessage("Error fetching data, please reload");
                } else {
                    setErrorMessage(null);
                }
            });

        return () => {
            void supabase.removeChannel(subscriptionChannel);
        };
    });

    const selectOrDeselectRow = (parcelId: string): void => {
        const currentIndices = checkedParcelIds;
        if (currentIndices.includes(parcelId)) {
            setCheckedParcelIds(
                currentIndices.filter((dummyParcelId) => dummyParcelId !== parcelId)
            );
        } else {
            setCheckedParcelIds(currentIndices.concat([parcelId]));
        }
    };

    const toggleAllCheckBox = async (): Promise<void> => {
        if (isAllCheckBoxSelected) {
            setCheckedParcelIds([]);
            setAllCheckBoxSelected(false);
        } else {
            setCheckedParcelIds(
                await getParcelIds(supabase, primaryFilters.concat(additionalFilters), sortState)
            );
            setAllCheckBoxSelected(true);
        }
    };

    useEffect(() => {
        const allChecked = checkedParcelIds.length === filteredParcelCount;
        if (allChecked !== isAllCheckBoxSelected) {
            setAllCheckBoxSelected(allChecked);
        }
    }, [filteredParcelCount, checkedParcelIds, isAllCheckBoxSelected]);

    const onParcelTableRowClick = (row: Row<ParcelsTableRow>): void => {
        setSelectedParcelId(row.data.parcelId);
        router.push(`/parcels?${parcelIdParam}=${row.data.parcelId}`);
    };

    return (
        <TableSurface>
            <ServerPaginatedTable<ParcelsTableRow, DbParcelRow, string | DateRangeState | string[]>
                dataPortion={
                    isPackingManagerView ? packingManagerViewDataPortion : parcelsDataPortion
                }
                isLoading={isLoading}
                paginationConfig={{
                    enablePagination: true,
                    filteredCount: filteredParcelCount,
                    onPageChange: setCurrentPage,
                    onPerPageChange: setParcelCountPerPage,
                    defaultRowsPerPage: defaultNumberOfParcelsPerPage,
                    rowsPerPageOptions: numberOfParcelsPerPageOptions,
                }}
                headerKeysAndLabels={parcelTableHeaderKeysAndLabels}
                columnDisplayFunctions={parcelTableColumnDisplayFunctions}
                columnStyleOptions={parcelTableColumnStyleOptions}
                onRowClick={onParcelTableRowClick}
                sortConfig={{
                    sortPossible: true,
                    sortableColumns: parcelsSortableColumns,
                    setSortState: setSortState,
                }}
                defaultSortConfig={defaultParcelsSortConfig}
                rowBreakPointConfigs={isPackingManagerView ? undefined : parcelRowBreakPointConfig}
                filterConfig={{
                    primaryFiltersShown: true,
                    additionalFiltersShown: true,
                    primaryFilters: isPackingManagerView
                        ? packingManagerViewPrimaryFilters
                        : primaryFilters,
                    additionalFilters: additionalFilters,
                    setPrimaryFilters: setPrimaryFilters,
                    setAdditionalFilters: setAdditionalFilters,
                }}
                defaultShownHeaders={parcelTableDefaultShownHeaders}
                toggleableHeaders={parcelTableToggleableHeaders}
                checkboxConfig={{
                    displayed: true,
                    selectedRowIds: checkedParcelIds,
                    isAllCheckboxChecked: isAllCheckBoxSelected,
                    onCheckboxClicked: (parcelData) => selectOrDeselectRow(parcelData.parcelId),
                    onAllCheckboxClicked: () => toggleAllCheckBox(),
                    isRowChecked: (parcelData) => checkedParcelIds.includes(parcelData.parcelId),
                }}
                editableConfig={{ editable: false }}
                pointerOnHover={true}
            />
        </TableSurface>
    );
};

export default ParcelsTable;
