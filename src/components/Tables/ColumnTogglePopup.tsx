"use client";

import React from "react";
import { TableHeaders } from "@/components/Tables/Table";
import CheckboxGroupPopup from "../DataInput/CheckboxGroupPopup";
import { ViewColumnOutlined } from "@mui/icons-material";
import styled from "styled-components";

interface ColumnTogglePopupProps<Data> {
    toggleableHeaders?: readonly (keyof Data)[];
    shownHeaderKeys: readonly (keyof Data)[];
    setShownHeaderKeys: (headers: (keyof Data)[]) => void;
    headers: TableHeaders<Data>;
}

const ThemedContainer = styled.div`
    color: ${(props) => props.theme.main.foreground[2]};
    background-color: ${(props) => props.theme.main.background[2]};
`;

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
        <ThemedContainer>
            <CheckboxGroupPopup
                labelsAndKeys={(toggleableHeaders ?? []).map((key) => {
                    const headerLabel =
                        headers.find(([headerKey]) => headerKey === key)?.[1] ?? key.toString();
                    return [headerLabel, key as string];
                })}
                checkedKeys={shownHeaderKeys.map((key) => key as string)}
                onChange={onChangeCheckbox}
                buttonIcon={<ViewColumnOutlined />}
                accessibleLabel="Select Columns"
                buttonTestId="select-columns-button"
            />
        </ThemedContainer>
    );
};

export default ColumnTogglePopup;
