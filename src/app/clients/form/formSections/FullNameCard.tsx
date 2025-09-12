import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    getErrorText,
    getDefaultTextValue,
    onChangeText,
    Setter,
    FormErrors,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps, ClientFields } from "@/app/clients/form/ClientForm";

const FullNameCard: React.FC<ClientCardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    return (
        <GenericFormCard title="Client Full Name" required={true} text="First and last name">
            <FreeFormTextInput
                id="client-full-name"
                label="Name"
                defaultValue={getDefaultTextValue(fields, "fullName")}
                error={errorExists(formErrors.fullName)}
                helperText={getErrorText(formErrors.fullName)}
                onChange={onChangeText(
                    fieldSetter,
                    errorSetter as Setter<FormErrors<ClientFields>>,
                    "fullName",
                    { required: true }
                )}
            />
        </GenericFormCard>
    );
};
export default FullNameCard;
