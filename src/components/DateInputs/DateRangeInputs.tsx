"use client";

import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";

const reasonableMinDate = dayjs("2020-01-01");

export interface DateRangeState {
    from: Dayjs;
    to: Dayjs;
}

export const isDateRangeValid = (from: Dayjs, to: Dayjs): boolean => {
    return (
        from.isValid() &&
        to.isValid() &&
        from <= to &&
        from >= reasonableMinDate &&
        to >= reasonableMinDate
    );
};

interface Props {
    range: DateRangeState;
    setRange: (range: DateRangeState) => void;
    isDisabled?: boolean;
}

const DateRangeInputs: React.FC<Props> = (props) => {
    const [localFromValue, setLocalFromValue] = useState<Dayjs | null>(props.range.from);
    const [localToValue, setLocalToValue] = useState<Dayjs | null>(props.range.to);
    const [hasErrorState, setHasErrorState] = useState<boolean>(false);

    const areDatesAfterMinDate = (from: Dayjs, to: Dayjs): boolean => {
        return from >= reasonableMinDate && to >= reasonableMinDate;
    };

    const setRangeIfPossible = (from: Dayjs | null, to: Dayjs | null): void => {
        if (from && to && areDatesAfterMinDate(from, to)) {
            setHasErrorState(false);

            props.setRange({
                from: from,
                to: to,
            });
        } else {
            setHasErrorState(true);
        }
    };

    const shouldSetDatesToBeEqual = (from: Dayjs | null, to: Dayjs | null): boolean => {
        return from !== null && to !== null && from > to && areDatesAfterMinDate(from, to);
    };

    const setFromValue = (fromValue: Dayjs | null): void => {
        setLocalFromValue(fromValue);

        if (!shouldSetDatesToBeEqual(fromValue, localToValue)) {
            return setRangeIfPossible(fromValue, localToValue);
        }

        setLocalToValue(fromValue);
        setRangeIfPossible(fromValue, fromValue);
    };

    const setToValue = (toValue: Dayjs | null): void => {
        setLocalToValue(toValue);

        if (!shouldSetDatesToBeEqual(localFromValue, toValue)) {
            return setRangeIfPossible(localFromValue, toValue);
        }

        setLocalFromValue(toValue);
        setRangeIfPossible(toValue, toValue);
    };

    return (
        <>
            <DatePicker
                onChange={(value) => setFromValue(value)}
                minDate={reasonableMinDate}
                value={props.range.from}
                label="From"
                slotProps={{
                    textField: {
                        error: hasErrorState,
                        size: "small",
                    },
                }}
                disabled={props.isDisabled}
            />
            <DatePicker
                onChange={(value) => setToValue(value)}
                minDate={reasonableMinDate}
                value={props.range.to}
                label="To"
                slotProps={{
                    textField: {
                        error: hasErrorState,
                        size: "small",
                    },
                }}
                disabled={props.isDisabled}
            />
        </>
    );
};

export default DateRangeInputs;
