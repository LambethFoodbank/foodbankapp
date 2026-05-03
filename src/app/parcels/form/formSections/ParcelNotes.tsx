import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    FormErrors,
    getDefaultTextValue,
    onChangeText,
    Setter,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ParcelCardProps, ParcelFields } from "../ParcelForm";

const ParcelNotesCard: React.FC<ParcelCardProps> = ({ errorSetter, fieldSetter, fields }) => {
    return (
        <GenericFormCard
            title="Notes"
            required={false}
            text="Any helpful notes for this parcel can be stored here."
        >
            <FreeFormTextInput
                label="For example, fragile items included."
                defaultValue={getDefaultTextValue(fields, "notes")}
                onChange={onChangeText(
                    fieldSetter,
                    errorSetter as Setter<FormErrors<ParcelFields>>,
                    "notes"
                )}
                minRows={5}
                multiline={true}
            />
        </GenericFormCard>
    );
};

export default ParcelNotesCard;
