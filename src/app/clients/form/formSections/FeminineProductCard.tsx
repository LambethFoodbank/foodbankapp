import React from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckbox } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

export const feminineProductOptions: string[] = ["Tampons", "Pads", "Incontinence Pads"];

export const feminineProductLabelsAndKeys: [string, string][] = feminineProductOptions.map(
    (optionName) => [optionName, optionName]
);

const FeminineProductCard: React.FC<ClientCardProps> = ({ fieldSetter, fields }) => {
    return (
        <GenericFormCard title="Feminine Products" required={false}>
            <CheckboxGroupInput
                labelsAndKeys={feminineProductLabelsAndKeys}
                onChange={onChangeCheckbox(
                    fieldSetter,
                    fields.feminineProducts,
                    "feminineProducts"
                )}
                checkedKeys={checkboxGroupToArray(fields.feminineProducts)}
            />
        </GenericFormCard>
    );
};

export default FeminineProductCard;
