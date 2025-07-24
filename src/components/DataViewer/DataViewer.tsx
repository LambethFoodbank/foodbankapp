"use client";

import Button from "@mui/material/Button";
import React, { ChangeEvent } from "react";
import styled from "styled-components";
import { formatCamelCaseKey } from "@/common/format";
import FreeFormTextInput from "../DataInput/FreeFormTextInput";

type ValueType = string[] | string | number | boolean | null;

type ValueConfig = {
    value: ValueType;
    hide?: boolean;
    editFunctions?: EditFunctions;
};

export const convertDataToDataForDataViewer = (data: Data): DataForDataViewer => {
    const dataForDataViewer: DataForDataViewer = {};

    for (const [key, value] of Object.entries(data)) {
        dataForDataViewer[key] = { value: value };
    }

    return dataForDataViewer;
};
export interface Data {
    [key: string]: ValueType;
}
export interface DataForDataViewer {
    [key: string]: ValueConfig;
}

export const DataViewerContainer = styled.div`
    width: 800px;
    max-width: 100%;

    display: flex;
    flex-direction: column;
`;

export const DataViewerItem = styled.div`
    display: flex;
    flex-direction: row;
    padding-bottom: 0.5em;
`;

const Key = styled.div`
    flex: 0 0 30%;
    font-weight: 600;
    padding: 0.2em 0.5em;
`;

const Value = styled.div`
    padding: 0.2em 0.5em;
`;

const FreeFormTextInputForDataViewer = styled.div`
    background-color: ${(props) => props.theme.main.background[0]};
    width: 100%;
    margin-right: 0.2em;
`;

const ButtonsContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    column-gap: 0.2em;
`;

const valueIsEmpty = (value: ValueType): boolean => {
    return (Array.isArray(value) && value.length === 0) || value === "";
};

const formatDisplayValue = (value: ValueType): string => {
    if (valueIsEmpty(value) || value === null) {
        return "-";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    return value.toString();
};

export interface DataViewerProps {
    data: DataForDataViewer;
}

interface EditFunctions {
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onCancel: () => void;
    onSave: () => void;
}

interface EditableDataViewerRowProps {
    editFunctions: EditFunctions;
    value: ValueType;
}

const EditableDataViewerRow: React.FC<EditableDataViewerRowProps> = ({ editFunctions, value }) => (
    <>
        <FreeFormTextInputForDataViewer>
            <FreeFormTextInput
                defaultValue={value?.toString() ?? ""}
                fullWidth
                onChange={editFunctions.onChange}
                multiline
            />
        </FreeFormTextInputForDataViewer>
        <ButtonsContainer>
            <Button variant="outlined" onClick={editFunctions.onCancel}>
                Cancel
            </Button>
            <Button variant="contained" onClick={editFunctions.onSave}>
                Save
            </Button>
        </ButtonsContainer>
    </>
);

const DataViewer: React.FC<DataViewerProps> = ({ data }) => {
    return (
        <DataViewerContainer>
            {Object.entries(data).map(([key, value]) => {
                const isAHiddenReferralField = (key: string, value: ValueConfig): boolean => {
                    return (
                        (key.includes("referral") || key.includes("referrer")) && value.value === ""
                    );
                };

                if (!value.hide && !isAHiddenReferralField(key, value)) {
                    return (
                        <DataViewerItem key={key}>
                            <Key>{formatCamelCaseKey(key)}</Key>
                            {value.editFunctions ? (
                                <EditableDataViewerRow
                                    value={value.value}
                                    editFunctions={value.editFunctions}
                                />
                            ) : (
                                <Value>{formatDisplayValue(value.value)}</Value>
                            )}
                        </DataViewerItem>
                    );
                }
            })}
        </DataViewerContainer>
    );
};
export default DataViewer;
