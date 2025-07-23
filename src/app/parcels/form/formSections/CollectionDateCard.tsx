import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import React from "react";
import { DbCollectionCentreAvailableDaysType } from "@/common/fetch";
import { getAvailableDaysIndices } from "@/common/format";
import { getErrorText, onChangeDate } from "@/components/Form/formFunctions";
import { ErrorText } from "@/components/Form/formStyling";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ParcelCardProps } from "../ParcelForm";

interface DateCardProps extends ParcelCardProps {
    availableDays: DbCollectionCentreAvailableDaysType;
}

const CollectionDateCard: React.FC<DateCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    availableDays,
}) => {
    const availableDaysIndices = getAvailableDaysIndices(availableDays);
    const isUnavailable = (availableDay: Dayjs): boolean => {
        return !availableDaysIndices?.includes(dayjs(availableDay).day()) as boolean;
    };

    return (
        <GenericFormCard
            title="Collection Date"
            required={true}
            text="What date is the client collecting their parcel?"
        >
            <>
                <DatePicker
                    onChange={(value): void => {
                        onChangeDate(fieldSetter, errorSetter, "collectionDate", value);
                    }}
                    label="Date"
                    value={fields.collectionDate ? dayjs(fields.collectionDate) : null}
                    shouldDisableDate={isUnavailable}
                />
                <ErrorText>{getErrorText(formErrors.collectionDate)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default CollectionDateCard;
