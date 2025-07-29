"use client";

import React, { useState } from "react";
import GeneralActionModal, { ActionModalProps } from "./GeneralActionModal";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import MissingVoucherNumberReportCsvButton, {
    FetchMissingVoucherNumberReportError,
} from "../ActionButtons/VoucherNumberReportCsvButton";
import dayjs from "dayjs";
import DateRangeInputs, { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import { sendAuditLog } from "@/server/auditLog";
import styled from "styled-components";

interface MissingVoucherNumberReportInputProps {
    dateRange: DateRangeState;
    setRange: (range: DateRangeState) => void;
}

interface ContentProps {
    dateRange: DateRangeState;
    setRange: (range: DateRangeState) => void;
    isInputValid: boolean;
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (csvError: FetchMissingVoucherNumberReportError) => void;
}

const InputContainer = styled.div`
    margin: 0.5rem;
    display: flex;
    gap: 1rem;
`;

const MissingVoucherNumberReportInput: React.FC<MissingVoucherNumberReportInputProps> = (props) => {
    return (
        <InputContainer>
            <DateRangeInputs range={props.dateRange} setRange={props.setRange} />
        </InputContainer>
    );
};

const MissingVoucherNumberReportModalContent: React.FC<ContentProps> = ({
    dateRange,
    setRange,
    isInputValid,
    onFileCreationCompleted,
    onFileCreationFailed,
}) => {
    return (
        <form>
            <MissingVoucherNumberReportInput dateRange={dateRange} setRange={setRange} />
            <Centerer>
                <MissingVoucherNumberReportCsvButton
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

const MissingVoucherNumberReportModal: React.FC<ActionModalProps> = (props) => {
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
        setSuccessMessage("Missing Voucher Number Report Created");
        setActionCompleted(true);
        void sendAuditLog({
            action: "generate missing voucher number report",
            wasSuccess: true,
            content: {
                fromDate: dateRange.from.toString(),
                toDate: dateRange.to.toString(),
            },
        });
        props.postSuccessCallback();

        // Delay closing the modal to allow user to handle file explorer dialog
        setTimeout(() => {
            props.onClose();
        }, 3000); // 3-second delay
    };

    const onFileCreationFailed = (csvError: FetchMissingVoucherNumberReportError): void => {
        setErrorMessage("Failed to fetch missing voucher number report data");
        setActionCompleted(true);
        void sendAuditLog({
            action: "generate missing voucher number report",
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
                <MissingVoucherNumberReportModalContent
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

export default MissingVoucherNumberReportModal;
