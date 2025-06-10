import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    getErrorText,
    getDefaultTextValue,
    onChangeText,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";
import { formatPhoneNumber, phoneNumberRegex } from "@/common/format";

const phoneNumberIsRequired = true;

const PhoneNumberCard: React.FC<ClientCardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    return (
        <GenericFormCard title="Phone Number" required={phoneNumberIsRequired}>
            <FreeFormTextInput
                id="client-phone-number"
                label="Phone Number"
                defaultValue={getDefaultTextValue(fields, "phoneNumber")}
                error={errorExists(formErrors.phoneNumber)}
                helperText={getErrorText(formErrors.phoneNumber)}
                onChange={onChangeText(fieldSetter, errorSetter, "phoneNumber", {
                    required: phoneNumberIsRequired,
                    regex: phoneNumberRegex,
                    formattingFunction: formatPhoneNumber,
                })}
            />
        </GenericFormCard>
    );
};

export default PhoneNumberCard;
