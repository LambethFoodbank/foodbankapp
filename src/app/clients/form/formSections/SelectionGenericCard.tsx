import React from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { onChangeSelectionByPrimaryKey } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

interface SelectableItem {
    primaryKey: string;
    name: string;
}

interface SelectionCardProps<T extends SelectableItem> extends ClientCardProps {
    items: T[];
    title: string;
    fieldName: keyof ClientCardProps["fields"];
}

function SelectionGenericCard<T extends SelectableItem>({
    fieldSetter,
    fields,
    items,
    title,
    fieldName,
}: SelectionCardProps<T>): React.JSX.Element {
    const selected = (fields[fieldName] ?? []) as T[];
    const selectedKeys = selected.map((item) => item.primaryKey);

    const handleChange = (key: string, checked: boolean): void => {
        const newSelected = onChangeSelectionByPrimaryKey(selected, items, key, checked);
        fieldSetter({ [fieldName]: newSelected });
    };

    return (
        <GenericFormCard title={title} required={false}>
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
}

export default SelectionGenericCard;
