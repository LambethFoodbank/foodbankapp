import React from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckboxInGroup } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

interface PreferredItemsCardProps extends ClientCardProps {
    items: string[];
}

const PreferredItems: React.FC<PreferredItemsCardProps> = ({ fieldSetter, fields, items }) => {
    return (
        <GenericFormCard title="Preferred Items" required={false}>
            <CheckboxGroupInput
                labelsAndKeys={items.map((optionName) => [optionName, optionName])}
                onChange={onChangeCheckboxInGroup(
                    fieldSetter,
                    fields.preferredItems ?? {},
                    "preferredItems"
                )}
                checkedKeys={checkboxGroupToArray(fields.preferredItems ?? {})}
            />
        </GenericFormCard>
    );
};

export default PreferredItems;
