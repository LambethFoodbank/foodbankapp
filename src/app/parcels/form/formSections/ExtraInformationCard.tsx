import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    FormErrors,
    getDefaultTextValue,
    onChangeText,
    Setter,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ParcelCardProps, ParcelFields } from "@/app/parcels/form/ParcelForm";

const ExtraInformationCard: React.FC<ParcelCardProps> = ({ errorSetter, fieldSetter, fields }) => {
    return (
        <GenericFormCard
            title="Extra Information"
            required={false}
            text="Is there anything else you need to tell us about the client? Comments relating to Food / Packing only. This info will be shown on the Shopping List."
        >
            <FreeFormTextInput
                label="For example, Tea allergy"
                defaultValue={getDefaultTextValue(fields, "extraInformation")}
                onChange={onChangeText(
                    fieldSetter,
                    errorSetter as Setter<FormErrors<ParcelFields>>,
                    "extraInformation"
                )}
                minRows={5}
                multiline={true}
            />
        </GenericFormCard>
    );
};

export default ExtraInformationCard;
