import React from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckboxInGroup } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

export const otherRequirementOptions: string[] = [];

export const otherItemsLabelsAndKeys: [string, string][] = otherRequirementOptions.map(
    (optionName) => [optionName, optionName]
);

const OtherItemsCard: React.FC<ClientCardProps> = ({ fieldSetter, fields }) => {
    const cardText =
        otherItemsLabelsAndKeys.length === 0 ? "No other items currently available." : undefined;
    return (
        <GenericFormCard title="Other Items" required={false} text={cardText}>
            <CheckboxGroupInput
                labelsAndKeys={otherItemsLabelsAndKeys}
                onChange={onChangeCheckboxInGroup(fieldSetter, fields.otherItems, "otherItems")}
                checkedKeys={checkboxGroupToArray(fields.otherItems)}
            />
        </GenericFormCard>
    );
};

export default OtherItemsCard;
