import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import { getDefaultTextValue, onChangeText } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

const ExtraInformationCard: React.FC<ClientCardProps> = ({ errorSetter, fieldSetter, fields }) => {
    return (
        <GenericFormCard
            title="Extra Information"
            required={false}
            text="Is there anything else you need to tell us about the client? Comments relating to Food / Packing only. This info will be shown on the Shopping List. (Delivery Instructions section can be found in Edit Parcel)"
        >
            <FreeFormTextInput
                label="For example, Tea allergy"
                defaultValue={getDefaultTextValue(fields, "extraInformation")}
                onChange={onChangeText(fieldSetter, errorSetter, "extraInformation")}
                minRows={5}
                multiline={true}
            />
        </GenericFormCard>
    );
};

export default ExtraInformationCard;
