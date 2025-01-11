import React from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckbox } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

export const cookingFacilitiesOptions: string[] = [
    "Microwave",
    "Kettle",
    "Hob",
    "Oven",
    "Air Fryer",
    "Toaster",
    "Other",
];

export const cookingFacilitiesLabelsAndKeys: [string, string][] = cookingFacilitiesOptions.map(
    (optionName) => [optionName, optionName]
);

const CookingFacilitiesCard: React.FC<ClientCardProps> = ({ fieldSetter, fields }) => {
    return (
        <GenericFormCard
            title="Cooking Facilities"
            required={false}
            text="What cooking facilities does the client have? For 'Other', put details in the 'Extra Information' section."
        >
            <CheckboxGroupInput
                labelsAndKeys={cookingFacilitiesLabelsAndKeys}
                onChange={onChangeCheckbox(
                    fieldSetter,
                    fields.cookingFacilities,
                    "cookingFacilities"
                )}
                checkedKeys={checkboxGroupToArray(fields.cookingFacilities)}
            />
        </GenericFormCard>
    );
};

export default CookingFacilitiesCard;
