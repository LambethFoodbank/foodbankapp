import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import React from "react";
import { getErrorText, onChangeDate } from "@/components/Form/formFunctions";
import { ErrorText } from "@/components/Form/formStyling";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ParcelCardProps } from "../ParcelForm";
import { DbCollectionCentreAvailableDaysType } from "@/common/fetch";
import { Schema } from "@/databaseUtils";

interface DateCardProps extends ParcelCardProps {
    deliveryPrimaryKey: Schema["collection_centres"]["primary_key"];
    availableDaysForSelectedCentre: DbCollectionCentreAvailableDaysType;
}

const CollectionDateCard: React.FC<DateCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    deliveryPrimaryKey,
    availableDaysForSelectedCentre,
}) => {
    const isCentreClosedOnDay = (day: Dayjs): boolean => {
        if (!availableDaysForSelectedCentre) {
            return true;
        }

        const dayIndex = day.day() != 0 ? day.day() - 1 : 6;

        return !availableDaysForSelectedCentre[dayIndex].is_active;
    };

    const isDisabledFormInput =
        !fields.collectionCentre ||
        fields.collectionCentre == deliveryPrimaryKey ||
        !availableDaysForSelectedCentre?.find((dayObject) => dayObject.is_active);

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
                    shouldDisableDate={isCentreClosedOnDay}
                    disabled={isDisabledFormInput}
                />
                <ErrorText>{getErrorText(formErrors.collectionDate)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default CollectionDateCard;
