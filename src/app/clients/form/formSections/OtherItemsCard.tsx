import React from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckbox } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

export const otherRequirementOptions: string[] = ["Hot Water Bottle", "Blanket"];

export const otherItemsLabelsAndKeys: [string, string][] = otherRequirementOptions.map(
    (optionName) => [optionName, optionName]
);

const OtherItemsCard: React.FC<ClientCardProps> = ({ fieldSetter, fields }) => {
    return (
        <GenericFormCard title="Other Items" required={false}>
            <CheckboxGroupInput
                labelsAndKeys={otherItemsLabelsAndKeys}
                onChange={onChangeCheckbox(fieldSetter, fields.otherItems, "otherItems")}
                checkedKeys={checkboxGroupToArray(fields.otherItems)}
            />
        </GenericFormCard>
    );
};

export default OtherItemsCard;
