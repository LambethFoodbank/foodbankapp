"use client";

import React from "react";
import { TableHeaders } from "@/components/Tables/Table";
import CheckboxGroupPopup from "../DataInput/CheckboxGroupPopup";

interface ColumnTogglePopupProps<Data> {
    toggleableHeaders?: readonly (keyof Data)[];
    shownHeaderKeys: readonly (keyof Data)[];
    setShownHeaderKeys: (headers: (keyof Data)[]) => void;
    headers: TableHeaders<Data>;
}

const ColumnTogglePopup = <Data,>({
    toggleableHeaders,
    shownHeaderKeys,
    setShownHeaderKeys,
    headers,
}: ColumnTogglePopupProps<Data>): React.ReactElement => {
    const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const checkboxKey = event.target.name as keyof Data;
        if (event.target.checked) {
            setShownHeaderKeys([...shownHeaderKeys, checkboxKey]);
        } else {
            setShownHeaderKeys(shownHeaderKeys.filter((shownKey) => shownKey !== checkboxKey));
        }
    };

    return (
        <CheckboxGroupPopup
            labelsAndKeys={(toggleableHeaders ?? []).map((key) => {
                const headerLabel =
                    headers.find(([headerKey]) => headerKey === key)?.[1] ?? key.toString();
                return [headerLabel, key as string];
            })}
            defaultCheckedKeys={shownHeaderKeys.map((key) => key as string)}
            groupLabel="Select Columns:"
            onChange={onChangeCheckbox}
        />
    );
};

export default ColumnTogglePopup;
