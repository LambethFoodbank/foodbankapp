"use client";

import React, { useState } from "react";
import GeneralActionModal, { ActionModalProps } from "./GeneralActionModal";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import PendingMoreInfoReportCsvButton, {
    FetchPendingMoreInfoReportError,
} from "../ActionButtons/PendingMoreInfoReportCsvButton";
import dayjs from "dayjs";
import DateRangeInputs, { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import { sendAuditLog } from "@/server/auditLog";
import styled from "styled-components";

interface PendingMoreInfoReportInputProps {
    dateRange: DateRangeState;
    setRange: (range: DateRangeState) => void;
}

interface ContentProps {
    dateRange: DateRangeState;
    setRange: (range: DateRangeState) => void;
    isInputValid: boolean;
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (csvError: FetchPendingMoreInfoReportError) => void;
}

const InputContainer = styled.div`
    margin: 0.5rem;
    display: flex;
    gap: 1rem;
`;

const PendingMoreInfoReportInput: React.FC<PendingMoreInfoReportInputProps> = (props) => {
    return (
        <InputContainer>
            <DateRangeInputs range={props.dateRange} setRange={props.setRange} />
        </InputContainer>
    );
};

const PendingMoreInfoReportModalContent: React.FC<ContentProps> = ({
    dateRange,
    setRange,
    isInputValid,
    onFileCreationCompleted,
    onFileCreationFailed,
}) => {
    return (
        <form>
            <PendingMoreInfoReportInput dateRange={dateRange} setRange={setRange} />
            <Centerer>
                <PendingMoreInfoReportCsvButton
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

const PendingMoreInfoReportModal: React.FC<ActionModalProps> = (props) => {
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
        setSuccessMessage("PendingMoreInfo Report Created");
        setActionCompleted(true);
        void sendAuditLog({
            action: "generate pendingMoreInfo report",
            wasSuccess: true,
            content: {
                fromDate: dateRange.from.toString(),
                toDate: dateRange.to.toString(),
            },
        });
        props.postSuccessCallback();

        // Auto-close the modal after 3 seconds
        setTimeout(() => {
            props.onClose();
        }, 3000);
    };

    const onFileCreationFailed = (csvError: FetchPendingMoreInfoReportError): void => {
        setErrorMessage("Failed to fetch pendingMoreInfo report data");
        setActionCompleted(true);
        void sendAuditLog({
            action: "generate pendingMoreInfo report",
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
                <PendingMoreInfoReportModalContent
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

export default PendingMoreInfoReportModal;
