"use client";

import React from "react";
import { TableHeaders, ToggleableColumnGroup } from "@/components/Tables/materialTable/tableTypes";
import CheckboxGroupPopup from "../DataInput/CheckboxGroupPopup";
import { ViewColumnOutlined } from "@mui/icons-material";
import styled from "styled-components";
import { MRT_RowData } from "material-react-table";

interface ColumnTogglePopupProps<Data extends MRT_RowData> {
    toggleableHeaders: readonly (keyof Data | string)[];
    toggleableColumnGroups?: ToggleableColumnGroup[];
    headers: TableHeaders<Data>;
    columnVisibility: Record<string, boolean>;
    setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const ThemedContainer = styled.div`
    color: ${(props) => props.theme.main.foreground[2]};
    background-color: ${(props) => props.theme.main.background[2]};
`;

const ColumnTogglePopup = <Data extends MRT_RowData>({
    toggleableHeaders,
    toggleableColumnGroups,
    headers,
    columnVisibility,
    setColumnVisibility,
}: ColumnTogglePopupProps<Data>): React.ReactElement => {
    const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const checkboxKey = event.target.name;
        const columnGroup = toggleableColumnGroups?.find(
            (group) => group.commonKey === checkboxKey
        );

        const keysToUpdate = columnGroup
            ? (columnGroup.columnNames as (keyof Data)[])
            : [checkboxKey as keyof Data];

        setColumnVisibility((prev) => {
            const newVisibility = { ...prev };
            keysToUpdate.forEach((key) => {
                newVisibility[key as string] = event.target.checked;
            });
            return newVisibility;
        });
    };

    const allToggleableKeys = [
        ...(toggleableHeaders ?? []),
        ...(toggleableColumnGroups?.map((group) => group.commonKey) ?? []),
    ];

    return (
        <ThemedContainer>
            <CheckboxGroupPopup
                labelsAndKeys={(allToggleableKeys ?? []).map((key) => {
                    const columnGroup = toggleableColumnGroups?.find(
                        (group) => group.commonKey === key
                    );
                    if (columnGroup) {
                        return [columnGroup.commonLabel, columnGroup.commonKey];
                    }

                    const headerLabel =
                        headers.find(([headerKey]) => headerKey === key)?.[1] ?? key.toString();
                    return [headerLabel, key as string];
                })}
                checkedKeys={allToggleableKeys
                    .filter((key) => {
                        const columnGroup = toggleableColumnGroups?.find(
                            (group) => group.commonKey === key
                        );
                        if (columnGroup) {
                            return columnGroup.columnNames.every((col) => columnVisibility[col]);
                        }

                        return columnVisibility[key as string];
                    })
                    .map(String)}
                onChange={onChangeCheckbox}
                buttonIcon={<ViewColumnOutlined />}
                accessibleLabel="Select Columns"
                buttonTestId="select-columns-button"
            />
        </ThemedContainer>
    );
};

export default ColumnTogglePopup;
