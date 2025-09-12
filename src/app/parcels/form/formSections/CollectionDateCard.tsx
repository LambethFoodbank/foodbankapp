import React from "react";
import { onChangeDate, getErrorText, Setter, FormErrors } from "@/components/Form/formFunctions";
import { DatePicker } from "@mui/x-date-pickers";
import { ErrorText } from "@/components/Form/formStyling";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ParcelCardProps, ParcelFields } from "../ParcelForm";
import { DbAvailableDaysType } from "@/common/fetch";
import { Schema } from "@/databaseUtils";
import dayjs, { Dayjs } from "dayjs";

interface DateCardProps extends ParcelCardProps {
    deliveryPrimaryKey: Schema["collection_centres"]["primary_key"];
    collectionCentreIsActive: boolean;
    availableDaysForSelectedCentre: DbAvailableDaysType;
}

const CollectionDateCard: React.FC<DateCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    deliveryPrimaryKey,
    collectionCentreIsActive,
    availableDaysForSelectedCentre,
}) => {
    const isCentreClosedOnDay = (day: Dayjs): boolean => {
        if (!availableDaysForSelectedCentre || !availableDaysForSelectedCentre.length) {
            return true;
        }

        const dayIndex = day.day() !== 0 ? day.day() - 1 : 6;

        return !availableDaysForSelectedCentre[dayIndex].is_active;
    };

    const isDisabledFormInput =
        !collectionCentreIsActive ||
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
                        onChangeDate(
                            fieldSetter,
                            errorSetter as Setter<FormErrors<ParcelFields>>,
                            "collectionDate",
                            value
                        );
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
