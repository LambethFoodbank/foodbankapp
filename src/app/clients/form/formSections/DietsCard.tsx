import React from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { Diet, onChangeSelectionByPrimaryKey } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

interface DietsCardProps extends ClientCardProps {
    diets: Diet[];
}

const DietsCard: React.FC<DietsCardProps> = ({ fieldSetter, fields, diets }) => {
    const selected: Diet[] = (fields.diets ?? []) as Diet[];
    const selectedKeys = selected.map((diet) => diet.primaryKey);

    const handleChange = (key: string, checked: boolean): void => {
        const newSelected = onChangeSelectionByPrimaryKey(selected, diets, key, checked);
        fieldSetter({ diets: newSelected });
    };

    return (
        <GenericFormCard title="Diets" required={false}>
            <CheckboxGroupInput
                labelsAndKeys={diets.map((diet) => [diet.name, diet.primaryKey])}
                onChange={(event) => {
                    const { name: key, checked } = event.target;
                    handleChange(key, checked);
                }}
                checkedKeys={selectedKeys}
            />
        </GenericFormCard>
    );
};

export default DietsCard;
