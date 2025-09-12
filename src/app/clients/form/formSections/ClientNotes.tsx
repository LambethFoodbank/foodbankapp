import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    FormErrors,
    getDefaultTextValue,
    onChangeText,
    Setter,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps, ClientFields } from "../ClientForm";

const ClientNotesCard: React.FC<ClientCardProps> = ({ errorSetter, fieldSetter, fields }) => {
    return (
        <GenericFormCard
            title="Notes"
            required={false}
            text="Any helpful notes for this client can be stored here."
        >
            <FreeFormTextInput
                label="For example, received Microwave on 14/05/2024"
                defaultValue={getDefaultTextValue(fields, "notes")}
                onChange={onChangeText(
                    fieldSetter,
                    errorSetter as Setter<FormErrors<ClientFields>>,
                    "notes"
                )}
                minRows={5}
                multiline={true}
            />
        </GenericFormCard>
    );
};

export default ClientNotesCard;
