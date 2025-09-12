import React from "react";
import { FormErrors, getErrorText, onChangeDate, Setter } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { DatePicker } from "@mui/x-date-pickers";
import { ErrorText } from "@/components/Form/formStyling";
import dayjs from "dayjs";
import { ParcelCardProps, ParcelFields } from "../ParcelForm";

const PackingDateCard: React.FC<ParcelCardProps> = ({
    errorSetter,
    fieldSetter,
    formErrors,
    fields,
}) => {
    return (
        <GenericFormCard
            title="Packing Date"
            required={true}
            text="What date is the parcel due to be packed?"
        >
            <>
                <DatePicker
                    onChange={(value): void => {
                        onChangeDate(
                            fieldSetter,
                            errorSetter as Setter<FormErrors<ParcelFields>>,
                            "packingDate",
                            value
                        );
                    }}
                    label="Date"
                    value={fields.packingDate ? dayjs(fields.packingDate) : null}
                />
                <ErrorText>{getErrorText(formErrors.packingDate)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default PackingDateCard;
