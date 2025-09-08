import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import { FormGroup } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import React from "react";
import { onChangeSelectionByPrimaryKey } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";

interface SelectableItem {
    primaryKey: string;
    name: string;
    additionalInfoField?: boolean;
    notes?: string;
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

    const handleAdditionalInfoChange = (key: string, value: string): void => {
        const newSelected = selected.map((item) =>
            item.primaryKey === key ? { ...item, notes: value } : item
        );
        fieldSetter({ [fieldName]: newSelected });
    };

    return (
        <GenericFormCard title={title} required={false}>
            <FormGroup>
                {items.map((item) => (
                    <>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name={item.primaryKey}
                                    checked={selectedKeys.includes(item.primaryKey)}
                                    onChange={(event) => {
                                        const { name: key, checked } =
                                            event.target as HTMLInputElement;
                                        handleChange(key, checked);
                                    }}
                                />
                            }
                            label={item.name}
                        />
                        {item.additionalInfoField && selectedKeys.includes(item.primaryKey) && (
                            <FreeFormTextInput
                                label="Additional Info"
                                defaultValue={
                                    selected.find(
                                        (selectedItem) =>
                                            selectedItem.primaryKey === item.primaryKey
                                    )?.notes ?? ""
                                }
                                onChange={(event) =>
                                    handleAdditionalInfoChange(item.primaryKey, event.target.value)
                                }
                            />
                        )}
                    </>
                ))}
            </FormGroup>
        </GenericFormCard>
    );
}

export default SelectionGenericCard;
