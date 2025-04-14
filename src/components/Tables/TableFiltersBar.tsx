"use client";

import React, { Fragment, useState } from "react";
import Button from "@mui/material/Button";
import styled from "styled-components";
import { FilterAltOffOutlined, FilterAltOutlined } from "@mui/icons-material";
import { FilterBase } from "@/components/Tables/Filters";
import { MENU_BREAKPOINT } from "../NavigationBar/NavigationBar";

export interface TableFiltersBarProps<Data, Filter extends FilterBase<Data, State>, State> {
    setFilters?: (filters: Filter[]) => void;
    setAdditionalFilters?: (filters: Filter[]) => void;
    filters?: Filter[];
    additionalFilters?: Filter[];
}

const StyledButton = styled(Button)`
    align-self: center;
    justify-self: flex-end;
`;

const FiltersAndIconContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    gap: 1rem;
    background-color: transparent;
    padding: 0;
`;

const FiltersSingleRowContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    gap: 1rem;
    overflow: visible;
    width: 100%;
    flex-wrap: wrap;

    @media (min-width: ${MENU_BREAKPOINT}) {
        flex-wrap: nowrap;
    }
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

        return (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={index}>
                {filter.filterComponent(filter.state, onFilter, filter.isDisabled)}
            </Fragment>
        );
    });
}

function TableFiltersBar<Data, Filter extends FilterBase<Data, State>, State>(
    props: TableFiltersBarProps<Data, Filter, State>
): React.ReactElement {
    const handleClear = (): void => {
        if (props.setFilters && props.filters) {
            props.setFilters(
                props.filters?.map((filter) =>
                    filter.shouldPersistOnClear
                        ? filter
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
                    filter.shouldPersistOnClear
                        ? filter
                        : {
                              ...filter,
                              state: filter.initialState,
                          }
                )
            );
        }
    };

    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const hasPrimaryFilters = props.filters?.length !== 0 && props.setFilters;

    const hasAdditionalFilters =
        props.additionalFilters?.length !== 0 && props.setAdditionalFilters;

    const handleToggleAdditional = (): void => {
        setShowMoreFilters((prev) => !prev);
    };

    if (!hasPrimaryFilters && !hasAdditionalFilters) {
        return <></>;
    }

    return (
        <>
            <FiltersAndIconContainer>
                {hasPrimaryFilters && <FilterAltOutlined />}
                <FiltersSingleRowContainer>
                    <>
                        {props.filters &&
                            props.filters?.length !== 0 &&
                            props.setFilters &&
                            filtersToComponents<Data, Filter, State>(
                                props.filters,
                                props.setFilters
                            )}
                        <Grow />
                        {hasAdditionalFilters && (
                            <StyledButton
                                variant="outlined"
                                onClick={handleToggleAdditional}
                                color="inherit"
                                startIcon={<FilterAltOutlined />}
                            >
                                {showMoreFilters ? "Less" : "More"}
                            </StyledButton>
                        )}
                        {(hasPrimaryFilters || hasAdditionalFilters) && (
                            <StyledButton
                                variant="outlined"
                                onClick={handleClear}
                                color="inherit"
                                startIcon={<FilterAltOffOutlined />}
                            ></StyledButton>
                        )}
                    </>
                </FiltersSingleRowContainer>
            </FiltersAndIconContainer>
            {hasAdditionalFilters && showMoreFilters && (
                <>
                    <FiltersAndIconContainer>
                        <FilterAltOutlined />
                        <FiltersSingleRowContainer>
                            {props.additionalFilters &&
                                props.additionalFilters.length !== 0 &&
                                props.setAdditionalFilters && (
                                    <>
                                        {filtersToComponents<Data, Filter, State>(
                                            props.additionalFilters,
                                            props.setAdditionalFilters
                                        )}
                                    </>
                                )}
                            <Grow />
                        </FiltersSingleRowContainer>
                    </FiltersAndIconContainer>
                </>
            )}
        </>
    );
}

export default TableFiltersBar;
