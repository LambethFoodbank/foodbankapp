import React from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckboxInGroup } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

interface DietsCardProps extends ClientCardProps {
    diets: string[];
}

const DietsCard: React.FC<DietsCardProps> = ({ fieldSetter, fields, diets }) => {
    return (
        <GenericFormCard title="Diets" required={false}>
            <CheckboxGroupInput
                labelsAndKeys={diets.map((optionName) => [optionName, optionName])}
                onChange={onChangeCheckboxInGroup(fieldSetter, fields.diets ?? {}, "diets")}
                checkedKeys={checkboxGroupToArray(fields.diets ?? {})}
            />
        </GenericFormCard>
    );
};

export default DietsCard;
