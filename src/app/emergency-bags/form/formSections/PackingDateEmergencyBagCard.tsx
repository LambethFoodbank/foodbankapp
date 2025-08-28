import React from "react";
import { getErrorText, onChangeDate } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { DatePicker } from "@mui/x-date-pickers";
import { ErrorText } from "@/components/Form/formStyling";
import dayjs from "dayjs";
import { EmergencyBagCardProps } from "@/app/emergency-bags/AddEmergencyBagForm";

const PackingDateCard: React.FC<EmergencyBagCardProps> = ({
    errorSetter,
    fieldSetter,
    formErrors,
    fields,
}) => {
    return (
        <GenericFormCard
            title="Packing Date"
            required={true}
            text="What date is the emergency bag due to be packed?"
        >
            <>
                <DatePicker
                    onChange={(value): void => {
                        onChangeDate(fieldSetter, errorSetter, "packingDate", value);
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
