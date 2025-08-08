"use client";

import React, { useEffect, useState } from "react";
import GeneralActionModal, { ActionModalProps, maxParcelsToShow } from "./GeneralActionModal";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import dayjs from "dayjs";
import DateRangeInputs, { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import { sendAuditLog } from "@/server/auditLog";
import styled from "styled-components";
import { ButtonProps, FetchReportError } from "../ActionButtons/ReportCsvButton";
import { ParcelsTableRow } from "../../parcelsTable/types";
import SelectedParcelsOverview from "../SelectedParcelsOverview";

interface ReportInputProps {
    dateRange: DateRangeState;
    setRange: (range: DateRangeState) => void;
}

interface ReportModalProps {
    actionModalProps: ActionModalProps;
    csvButton: (props: ButtonProps) => React.ReactElement;
}
interface ContentProps {
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (csvError: FetchReportError) => void;
    csvButton: (props: ButtonProps) => React.ReactElement;
    dateRange?: DateRangeState;
    setRange?: (range: DateRangeState) => void;
    isInputValid?: boolean;
    selectedParcels?: ParcelsTableRow[];
    maxParcelsToShow?: number;
}

const InputContainer = styled.div`
    margin: 0.5rem;
    display: flex;
    gap: 1rem;
`;

export const ReportInput: React.FC<ReportInputProps> = (props) => {
    return (
        <InputContainer>
            <DateRangeInputs range={props.dateRange} setRange={props.setRange} />
        </InputContainer>
    );
};

export const ReportModalContent: React.FC<ContentProps> = ({
    selectedParcels,
    maxParcelsToShow,
    dateRange,
    setRange,
    isInputValid,
    onFileCreationCompleted,
    onFileCreationFailed,
    csvButton,
}) => {
    return (
        <>
            {selectedParcels && selectedParcels?.length == 0 && dateRange && setRange && (
                <form>
                    <ReportInput dateRange={dateRange} setRange={setRange} />
                    <Centerer>
                        {csvButton({
                            fromDate: dateRange.from,
                            toDate: dateRange.to,
                            onFileCreationCompleted: onFileCreationCompleted,
                            onFileCreationFailed: onFileCreationFailed,
                            disabled: !isInputValid,
                        })}
                    </Centerer>
                </form>
            )}
            {selectedParcels && selectedParcels?.length > 0 && maxParcelsToShow && (
                <>
                    <SelectedParcelsOverview
                        parcels={selectedParcels}
                        maxParcelsToShow={maxParcelsToShow}
                    />
                    {csvButton({
                        parcels: selectedParcels,
                        onFileCreationCompleted: onFileCreationCompleted,
                        onFileCreationFailed: onFileCreationFailed,
                    })}
                </>
            )}
        </>
    );
};

const ReportModal: React.FC<ReportModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRangeState>({ from: dayjs(), to: dayjs() });

    const isInputValid =
        props.actionModalProps.selectedParcels.length > 0
            ? undefined
            : dateRange.from <= dateRange.to;

    useEffect(() => {
        if (props.actionModalProps.selectedParcels.length > 0) {
            const allDeleted = props.actionModalProps.selectedParcels.every(
                (parcel) => !parcel.clientIsActive
            );
            if (allDeleted) {
                setErrorMessage("All selected parcels belong to deleted clients.");
                setActionCompleted(false);
            }
        }
    }, [props.actionModalProps.selectedParcels]);

    const onClose = (): void => {
        props.actionModalProps.onClose();
        setDateRange({ from: dayjs(), to: dayjs() });
        setErrorMessage(null);
    };

    const onFileCreationCompleted = async (): Promise<void> => {
        setSuccessMessage("Report Created");
        setActionCompleted(false);
        let content = {};
        if (
            props.actionModalProps.selectedParcels &&
            props.actionModalProps.selectedParcels.length > 0
        ) {
            content = {
                fromDate: dateRange.from.toString(),
                toDate: dateRange.to.toString(),
            };
        } else {
            content = {
                parcelIds: props.actionModalProps.selectedParcels.map((parcel) => parcel.parcelId),
            };
        }
        void sendAuditLog({
            action: "generate report",
            wasSuccess: true,
            content: content,
        });
        props.actionModalProps.postSuccessCallback();
    };

    const onFileCreationFailed = (csvError: FetchReportError): void => {
        setErrorMessage("Failed to fetch report data");
        setActionCompleted(false);
        void sendAuditLog({
            action: "generate report",
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
            {...props.actionModalProps}
            onClose={onClose}
            errorMessage={errorMessage}
            successMessage={successMessage}
        >
            {actionCompleted && (
                <ReportModalContent
                    dateRange={dateRange}
                    setRange={setDateRange}
                    selectedParcels={props.actionModalProps.selectedParcels}
                    maxParcelsToShow={maxParcelsToShow}
                    isInputValid={isInputValid}
                    onFileCreationCompleted={onFileCreationCompleted}
                    onFileCreationFailed={onFileCreationFailed}
                    csvButton={props.csvButton}
                />
            )}
        </GeneralActionModal>
    );
};

export default ReportModal;
