import React from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckbox } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

export const petFoodOptions = ["Cat", "Dog"];

export const petFoodLabelsAndKeys: [string, string][] = petFoodOptions.map((optionName) => [
    optionName,
    optionName,
]);

const PetFoodCard: React.FC<ClientCardProps> = ({ fieldSetter, fields }) => {
    return (
        <GenericFormCard
            title="Pet Food"
            required={false}
            text="Tick all that apply. Specify any other requests in the 'Extra Information' section."
        >
            <CheckboxGroupInput
                labelsAndKeys={petFoodLabelsAndKeys}
                onChange={onChangeCheckbox(fieldSetter, fields.petFood, "petFood")}
                checkedKeys={checkboxGroupToArray(fields.petFood)}
            />
        </GenericFormCard>
    );
};

export default PetFoodCard;
