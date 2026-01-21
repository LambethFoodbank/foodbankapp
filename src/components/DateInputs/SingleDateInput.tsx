"use client";

import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import React from "react";

const reasonableMinDate = dayjs("2020-01-01");

export interface DateInputProps {
    setDate: (date: Dayjs) => void;
    setWarningMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const SingleDateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
    (dateInputProps, dateInputFocusRef) => {
        const setSingleDate = (date: Dayjs | null): void => {
            const firstRegisteredDate = dayjs("2000-01-01");

            if (!date || !date.isValid() || date.isBefore(firstRegisteredDate)) {
                dateInputProps.setWarningMessage("Please choose a valid packing date.");
                return;
            }

            dateInputProps.setWarningMessage("");
            dateInputProps.setDate(date);
        };

        return (
            <>
                <DatePicker
                    onChange={(date) => setSingleDate(date)}
                    minDate={reasonableMinDate}
                    label="Date"
                    inputRef={dateInputFocusRef}
                    sx={{
                        marginTop: "1em",
                        marginBottom: "1em",
                    }}
                />
            </>
        );
    }
);

SingleDateInput.displayName = "SingleDateInput";

export default SingleDateInput;
