"use client";

import React from "react";
import { TableHeaders } from "@/components/Tables/materialTable/tableTypes";
import CheckboxGroupPopup from "../DataInput/CheckboxGroupPopup";
import { ViewColumnOutlined } from "@mui/icons-material";
import styled from "styled-components";

interface ColumnTogglePopupProps<Data> {
    toggleableHeaders?: readonly (keyof Data | string)[];
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
    // "Referral Details" is needed to allow toggling functionality
    const referralDetails = [
        "Referral Details",
        "referralAgency",
        "referrerName",
        "referrerEmail",
        "referrerPhone",
    ];

    const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const checkboxKey = event.target.name;
        const isReferralDetails = checkboxKey === "Referral Details";
        const keysToUpdate = isReferralDetails
            ? (referralDetails as (keyof Data)[])
            : [checkboxKey as keyof Data];

        const newKeys = event.target.checked
            ? Array.from(new Set([...shownHeaderKeys, ...keysToUpdate]))
            : shownHeaderKeys.filter((key) => !keysToUpdate.includes(key as keyof Data));

        setShownHeaderKeys(newKeys as (keyof Data)[]);
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
