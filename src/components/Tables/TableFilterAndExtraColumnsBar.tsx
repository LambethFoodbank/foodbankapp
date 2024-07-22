"use client";

import React, { useState } from "react";
import Button from "@mui/material/Button";
import { TableHeaders } from "@/components/Tables/Table";
import styled from "styled-components";
import { FilterAltOffOutlined, FilterAltOutlined } from "@mui/icons-material";
import ColumnTogglePopup from "@/components/Tables/ColumnTogglePopup";
import { DistributeClientFilter, DistributeServerFilter } from "@/components/Tables/Filters";

type FilterBase<Data, State> =
    | DistributeClientFilter<Data, State>
    | DistributeServerFilter<Data, State, Record<string, unknown>>;

interface Props<Data, Filter extends FilterBase<Data, State>, State> {
    setFilters?: (filters: Filter[]) => void;
    setAdditionalFilters?: (filters: Filter[]) => void;
    headers: TableHeaders<Data>;
    filters?: Filter[];
    additionalFilters?: Filter[];
    toggleableHeaders: readonly (keyof Data)[];
    setShownHeaderKeys: (headers: (keyof Data)[]) => void;
    shownHeaderKeys: readonly (keyof Data)[];
}

const StyledButton = styled(Button)`
    align-self: center;
    justify-self: flex-end;
`;

const FiltersAndIconContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: transparent;
    padding: 0;
`;

const FilterContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 0.5rem 0;
    gap: 1rem;
    overflow: visible;
    width: 100%;
`;

const Grow = styled.div`
    flex-grow: 1;
`;

export function filtersToComponents<Data, Filter extends FilterBase<Data, State>, State>(
    filters: Filter[],
    setFilters: (filters: Filter[]) => void
): React.ReactNode[] {
    return filters.map((filter, index) => {
        const onFilter = (state: unknown): void => {
            const newFilters = [...filters];
            newFilters[index] = {
                ...newFilters[index],
                state,
            };
            setFilters(newFilters);
        };
        return filter.filterComponent(filter.state, onFilter);
    });
}

function TableFilterAndExtraColumnsBar<Data, Filter extends FilterBase<Data, State>, State>(
    props: Props<Data, Filter, State>
): React.ReactElement {
    const handleClear = (): void => {
        if (props.setFilters && props.filters) {
            props.setFilters(
                props.filters?.map((filter) =>
                    filter.persistOnClear
                        ? {
                              ...filter,
                          }
                        : {
                              ...filter,
                              state: filter.initialState,
                          }
                )
            );
        }
        if (props.setAdditionalFilters && props.additionalFilters) {
            props.setAdditionalFilters(
                props.additionalFilters?.map((filter) =>
                    filter.persistOnClear
                        ? {
                              ...filter,
                          }
                        : {
                              ...filter,
                              state: filter.initialState,
                          }
                )
            );
        }
    };

    const [showMoreFiltersAndHeaders, setShowMoreFiltersAndHeaders] = useState(false);

    const hasPrimaryFilters = props.filters?.length !== 0 && props.setFilters;

    const hasAdditionalFilters =
        props.additionalFilters?.length !== 0 && props.setAdditionalFilters;

    const hasToggleableHeaders = props.toggleableHeaders.length !== 0;

    const handleToggleAdditional = (): void => {
        setShowMoreFiltersAndHeaders((prev) => !prev);
    };

    if (!hasPrimaryFilters && !hasAdditionalFilters && !hasToggleableHeaders) {
        return <></>;
    }

    return (
        <>
            <FiltersAndIconContainer>
                {hasPrimaryFilters && <FilterAltOutlined />}
                <FilterContainer>
                    <>
                        {props.filters &&
                            props.filters?.length !== 0 &&
                            props.setFilters &&
                            filtersToComponents<Data, Filter, State>(
                                props.filters,
                                props.setFilters
                            )}
                        <Grow />
                        {(hasAdditionalFilters || hasToggleableHeaders) && (
                            <StyledButton
                                variant="outlined"
                                onClick={handleToggleAdditional}
                                color="inherit"
                                startIcon={<FilterAltOutlined />}
                            >
                                {showMoreFiltersAndHeaders ? "Less" : "More"}
                            </StyledButton>
                        )}
                        {(hasPrimaryFilters || hasAdditionalFilters) && (
                            <StyledButton
                                variant="outlined"
                                onClick={handleClear}
                                color="inherit"
                                startIcon={<FilterAltOffOutlined />}
                            >
                                Clear
                            </StyledButton>
                        )}
                    </>
                </FilterContainer>
            </FiltersAndIconContainer>
            {(hasAdditionalFilters || hasToggleableHeaders) && showMoreFiltersAndHeaders && (
                <>
                    <FiltersAndIconContainer>
                        {hasAdditionalFilters && <FilterAltOutlined />}
                        <FilterContainer>
                            {props.additionalFilters &&
                                props.additionalFilters?.length !== 0 &&
                                props.setAdditionalFilters && (
                                    <>
                                        {filtersToComponents<Data, Filter, State>(
                                            props.additionalFilters,
                                            props.setAdditionalFilters
                                        )}
                                    </>
                                )}
                            <Grow />
                            {props.toggleableHeaders.length > 0 && (
                                <ColumnTogglePopup
                                    toggleableHeaders={props.toggleableHeaders}
                                    shownHeaderKeys={props.shownHeaderKeys}
                                    setShownHeaderKeys={props.setShownHeaderKeys}
                                    headers={props.headers}
                                />
                            )}
                        </FilterContainer>
                    </FiltersAndIconContainer>
                </>
            )}
        </>
    );
}

export default TableFilterAndExtraColumnsBar;
