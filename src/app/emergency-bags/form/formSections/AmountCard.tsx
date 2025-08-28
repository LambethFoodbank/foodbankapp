import React from "react";
import GenericFormCard from "@/components/Form/GenericFormCard";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    getErrorText,
    numberRegex,
    onChangeText,
} from "@/components/Form/formFunctions";
import { EmergencyBagCardProps } from "@/app/emergency-bags/form/EmergencyBagForm";
import {
    MAXIMUM_NUMBER_OF_EMERGENCY_BAGS,
    MINIMUM_NUMBER_OF_EMERGENCY_BAGS,
} from "@/app/clients/form/bounds";

const numberOfEBRange = (value: string): boolean => {
    return (
        parseInt(value) <= MAXIMUM_NUMBER_OF_EMERGENCY_BAGS && parseInt(value) >= MINIMUM_NUMBER_OF_EMERGENCY_BAGS
    );
};

const AmountCard: React.FC<EmergencyBagCardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    return (
        <GenericFormCard
            title="How many emergency bags?"
            required={true}
            text="Please enter a valid number between 1 and 1000."
        >
            <>
                <FreeFormTextInput
                    id="amount-of-EBs"
                    label="Number of Emergency Bags"
                    defaultValue={fields.amount !== 0 ? fields.amount.toString() : undefined}
                    error={errorExists(formErrors.amount)}
                    helperText={getErrorText(formErrors.amount)}
                    onChange={onChangeText(fieldSetter, errorSetter, "amount", {
                        required: true,
                        regex: numberRegex,
                        formattingFunction: parseInt,
                        additionalCondition: numberOfEBRange,
                    })}
                />
            </>
        </GenericFormCard>
    );
};

export default AmountCard;
