import React from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { Item, onChangeSelectionByPrimaryKey } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

interface PreferredItemsCardProps extends ClientCardProps {
    items: Item[];
}

const PreferredItems: React.FC<PreferredItemsCardProps> = ({ fieldSetter, fields, items }) => {
    const selected: Item[] = (fields.preferredItems ?? []) as Item[];
    const selectedKeys = selected.map((item) => item.primaryKey);

    const handleChange = (key: string, checked: boolean): void => {
        const newSelected = onChangeSelectionByPrimaryKey(selected, items, key, checked);
        fieldSetter({ preferredItems: newSelected });
    };

    return (
        <GenericFormCard title="Preferred Items" required={false}>
            <CheckboxGroupInput
                labelsAndKeys={items.map((item) => [item.name, item.primaryKey])}
                onChange={(event) => {
                    const { name: key, checked } = event.target;
                    handleChange(key, checked);
                }}
                checkedKeys={selectedKeys}
            />
        </GenericFormCard>
    );
};

export default PreferredItems;
