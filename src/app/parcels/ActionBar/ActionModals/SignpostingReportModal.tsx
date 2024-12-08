"use client";

import React, { useState } from "react";
import GeneralActionModal, { ActionModalProps } from "./GeneralActionModal";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import SignpostingReportCsvButton, {
    FetchSignpostingReportError,
} from "../ActionButtons/SignpostingReportCsvButton";
import dayjs from "dayjs";
import DateRangeInputs, { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import { sendAuditLog } from "@/server/auditLog";
import styled from "styled-components";

interface SignpostingReportInputProps {
    dateRange: DateRangeState;
    setRange: (range: DateRangeState) => void;
}

interface ContentProps {
    dateRange: DateRangeState;
    setRange: (range: DateRangeState) => void;
    isInputValid: boolean;
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (csvError: FetchSignpostingReportError) => void;
}

const InputContainer = styled.div`
    margin: 0.5rem;
    display: flex;
    gap: 1rem;
`;

const SignpostingReportInput: React.FC<SignpostingReportInputProps> = (props) => {
    return (
        <InputContainer>
            <DateRangeInputs range={props.dateRange} setRange={props.setRange} />
        </InputContainer>
    );
};

const SignpostingReportModalContent: React.FC<ContentProps> = ({
    dateRange,
    setRange,
    isInputValid,
    onFileCreationCompleted,
    onFileCreationFailed,
}) => {
    return (
        <form>
            <SignpostingReportInput dateRange={dateRange} setRange={setRange} />
            <Centerer>
                <SignpostingReportCsvButton
                    fromDate={dateRange.from}
                    toDate={dateRange.to}
                    onFileCreationCompleted={onFileCreationCompleted}
                    onFileCreationFailed={onFileCreationFailed}
                    disabled={!isInputValid}
                />
            </Centerer>
        </form>
    );
};

const SignPostingReportModal: React.FC<ActionModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [dateRange, setDateRange] = useState<DateRangeState>({ from: dayjs(), to: dayjs() });

    const isInputValid = dateRange.from <= dateRange.to;

    const onClose = (): void => {
        props.onClose();
        setDateRange({ from: dayjs(), to: dayjs() });
        setErrorMessage(null);
    };

    const onFileCreationCompleted = async (): Promise<void> => {
        setSuccessMessage("Signposting Report Created");
        setActionCompleted(true);
        void sendAuditLog({
            action: "generate signposting report",
            wasSuccess: true,
            content: {
                fromDate: dateRange.from.toString(),
                toDate: dateRange.to.toString(),
            },
        });
    };

    const onFileCreationFailed = (csvError: FetchSignpostingReportError): void => {
        setErrorMessage("Failed to fetch signposting report data");
        setActionCompleted(true);
        void sendAuditLog({
            action: "generate signposting report",
            wasSuccess: false,
            content: {
                fromDate: dateRange.from.toString(),
                toDate: dateRange.to.toString(),
            },
            logId: csvError.logId,
        });
    };

    return (
        <GeneralActionModal
            {...props}
            onClose={onClose}
            errorMessage={errorMessage}
            successMessage={successMessage}
        >
            {!actionCompleted && (
                <SignpostingReportModalContent
                    dateRange={dateRange}
                    setRange={setDateRange}
                    isInputValid={isInputValid}
                    onFileCreationCompleted={onFileCreationCompleted}
                    onFileCreationFailed={onFileCreationFailed}
                />
            )}
        </GeneralActionModal>
    );
};

export default SignPostingReportModal;
