"use client";

import React, { Fragment, useState } from "react";
import Button from "@mui/material/Button";
import styled from "styled-components";
import {
    FilterAlt,
    FilterAltOff,
    FilterAltOffOutlined,
    FilterAltOutlined,
} from "@mui/icons-material";
import { FilterBase } from "@/components/Tables/Filters";
import { MENU_BREAKPOINT } from "@/common/sharedConstants";

export interface TableFiltersBarProps<Data, Filter extends FilterBase<Data, State>, State> {
    setPrimaryFilters?: (filters: Filter[]) => void;
    setAdditionalFilters?: (filters: Filter[]) => void;
    primaryFilters?: Filter[];
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
        if (props.setPrimaryFilters && props.primaryFilters) {
            props.setPrimaryFilters(
                props.primaryFilters?.map((filter) =>
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

    const hasPrimaryFilters = props.primaryFilters?.length !== 0 && props.setPrimaryFilters;

    const hasAdditionalFilters =
        props.additionalFilters?.length !== 0 && props.setAdditionalFilters;

    const handleToggleAdditional = (): void => {
        setShowMoreFilters((prev) => !prev);
    };

    if (!hasPrimaryFilters && !hasAdditionalFilters) {
        return <></>;
    }

    const hasActiveAdditionalFillters = (): boolean => {
        let hasAdditionalFilters = false;
        if (props.additionalFilters) {
            for (
                let indexFilter = 0;
                indexFilter < props.additionalFilters?.length;
                indexFilter++
            ) {
                if (
                    props.additionalFilters[indexFilter].state !=
                        props.additionalFilters[indexFilter].initialState &&
                    !props.additionalFilters[indexFilter].isDisabled
                ) {
                    hasAdditionalFilters = true;
                    break;
                }
            }
        }
        return hasAdditionalFilters;
    };

    const hasActivePrimaryFilters = (): boolean => {
        let hasPrimaryFilters = false;
        if (props.primaryFilters) {
            for (let indexFilter = 0; indexFilter < props.primaryFilters?.length; indexFilter++) {
                if (
                    props.primaryFilters[indexFilter].key === "view" ||
                    props.primaryFilters[indexFilter].key === "packingDate" ||
                    props.primaryFilters[indexFilter].key === "listType"
                ) {
                    continue;
                }
                if (
                    props.primaryFilters[indexFilter].state !=
                        props.primaryFilters[indexFilter].initialState &&
                    !props.primaryFilters[indexFilter].isDisabled
                ) {
                    hasPrimaryFilters = true;
                    break;
                }
            }
        }
        return hasPrimaryFilters;
    };

    return (
        <>
            <FiltersAndIconContainer>
                {hasPrimaryFilters && hasActivePrimaryFilters() ? (
                    <FilterAlt />
                ) : (
                    <FilterAltOutlined />
                )}
                <FiltersSingleRowContainer>
                    <>
                        {props.primaryFilters &&
                            props.primaryFilters?.length !== 0 &&
                            props.setPrimaryFilters &&
                            filtersToComponents<Data, Filter, State>(
                                props.primaryFilters,
                                props.setPrimaryFilters
                            )}
                        <Grow />
                        {hasAdditionalFilters && (
                            <StyledButton
                                variant="outlined"
                                onClick={handleToggleAdditional}
                                color={hasActiveAdditionalFillters() ? "primary" : "inherit"}
                                startIcon={<FilterAltOutlined />}
                            >
                                {showMoreFilters ? "Less" : "More"}
                            </StyledButton>
                        )}
                        {(hasPrimaryFilters || hasAdditionalFilters) && (
                            <StyledButton
                                variant="outlined"
                                onClick={handleClear}
                                color={
                                    hasActivePrimaryFilters() || hasActiveAdditionalFillters()
                                        ? "primary"
                                        : "inherit"
                                }
                                startIcon={
                                    hasActivePrimaryFilters() || hasActiveAdditionalFillters() ? (
                                        <FilterAltOff />
                                    ) : (
                                        <FilterAltOffOutlined />
                                    )
                                }
                            >
                                Clear
                            </StyledButton>
                        )}
                    </>
                </FiltersSingleRowContainer>
            </FiltersAndIconContainer>
            {hasAdditionalFilters && showMoreFilters && (
                <>
                    <FiltersAndIconContainer>
                        {hasActiveAdditionalFillters() ? <FilterAlt /> : <FilterAltOutlined />}
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
