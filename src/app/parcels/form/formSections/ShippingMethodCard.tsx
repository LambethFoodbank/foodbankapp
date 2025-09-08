import React from "react";
import {
    FormErrors,
    getErrorText,
    Setter,
    valueOnChangeRadioGroup,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import RadioGroupInput from "@/components/DataInput/RadioGroupInput";
import { ErrorText } from "@/components/Form/formStyling";
import { ParcelCardProps, ParcelFields } from "../ParcelForm";

export const SHIPPING_METHOD_LABELS_AND_VALUES: [string, string][] = [
    ["Delivery", "Delivery"],
    ["Collection", "Collection"],
];

const ShippingMethodCard: React.FC<ParcelCardProps> = ({
    errorSetter,
    fieldSetter,
    formErrors,
    fields,
}) => {
    return (
        <GenericFormCard title="Shipping Method" required={true}>
            <>
                <RadioGroupInput
                    labelsAndValues={SHIPPING_METHOD_LABELS_AND_VALUES}
                    onChange={valueOnChangeRadioGroup(
                        fieldSetter,
                        errorSetter as Setter<FormErrors<ParcelFields>>,
                        "shippingMethod"
                    )}
                    value={fields.shippingMethod ?? undefined}
                ></RadioGroupInput>
                <ErrorText>{getErrorText(formErrors.shippingMethod)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default ShippingMethodCard;
