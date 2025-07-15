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
import { emailRegex, formatEmail } from "@/common/format";

const emailIsRequired = true;

const EmailCard: React.FC<ClientCardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    return (
        <GenericFormCard title="Email" required={emailIsRequired}>
            <FreeFormTextInput
                id="client-email"
                label="Email"
                defaultValue={getDefaultTextValue(fields, "email")}
                error={errorExists(formErrors.email)}
                helperText={getErrorText(formErrors.email)}
                onChange={onChangeText(fieldSetter, errorSetter, "email", {
                    required: emailIsRequired,
                    regex: emailRegex,
                    formattingFunction: formatEmail,
                })}
            />
        </GenericFormCard>
    );
};

export default EmailCard;
