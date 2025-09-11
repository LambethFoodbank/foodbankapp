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

    const groupedItems = items.reduce((acc, item) => {
        if (!acc.has(item.name)) {
            acc.set(item.name, []);
        }
        acc.get(item.name)?.push(item);
        return acc;
    }, new Map<string, T[]>());

    const handleChangeByName = (name: string, checked: boolean): void => {
        const group = groupedItems.get(name) || [];
        const newSelected = group.reduce(
            (acc, item) => onChangeSelectionByPrimaryKey(acc, items, item.primaryKey, checked),
            selected
        );
        fieldSetter({ [fieldName]: newSelected });
    };

    const handleAdditionalInfoChange = (group: T[], value: string): void => {
        const newSelected = selected.map((item) =>
            group.some((g) => g.primaryKey === item.primaryKey && g.additionalInfoField)
                ? { ...item, notes: value }
                : item
        );
        fieldSetter({ [fieldName]: newSelected });
    };

    if (items.length === 0) {
        return <></>;
    }

    return (
        <GenericFormCard title={title} required={false}>
            <FormGroup>
                {Array.from(groupedItems.entries()).map(([name, group]) => {
                    const isChecked = group.every((item) => selectedKeys.includes(item.primaryKey));

                    const showAdditionalInfo = group.some(
                        (item) => item.additionalInfoField && selectedKeys.includes(item.primaryKey)
                    );

                    const firstSelectedItemWithNotes = group.find(
                        (item) => selectedKeys.includes(item.primaryKey) && item.notes !== undefined
                    );

                    return (
                        <React.Fragment key={name}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name={name}
                                        checked={isChecked}
                                        onChange={(event) => {
                                            const { name, checked } = event.target;
                                            handleChangeByName(name, checked);
                                        }}
                                    />
                                }
                                label={name}
                            />
                            {showAdditionalInfo && (
                                <FreeFormTextInput
                                    label="Additional Info"
                                    defaultValue={firstSelectedItemWithNotes?.notes ?? ""}
                                    onChange={(event) =>
                                        handleAdditionalInfoChange(group, event.target.value)
                                    }
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </FormGroup>
        </GenericFormCard>
    );
}

export default SelectionGenericCard;
