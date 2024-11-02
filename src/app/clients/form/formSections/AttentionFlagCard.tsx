import React from "react";
import { onChangeRadioGroup } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import RadioGroupInput from "@/components/DataInput/RadioGroupInput";
import { ClientCardProps } from "../ClientForm";

const AttentionFlagCard: React.FC<ClientCardProps> = ({ fieldSetter, fields }) => {
    return (
        <GenericFormCard
            title="Flag For Attention"
            required={true}
            text="Click Yes if you'd like to flag this client for attention. For example, if someone is only home at certain times, needs a delivery to an alternative address, or have sensitive information (i.e. domestic violence)."
        >
            <RadioGroupInput
                labelsAndValues={[
                    ["Yes", "Yes"],
                    ["No", "No"],
                ]}
                defaultValue={fields.attentionFlag ? "Yes" : "No"}
                onChange={onChangeRadioGroup(fieldSetter, "attentionFlag")}
            ></RadioGroupInput>
        </GenericFormCard>
    );
};

export default AttentionFlagCard;
