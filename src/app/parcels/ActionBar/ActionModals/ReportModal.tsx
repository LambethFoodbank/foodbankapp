import React, { useEffect, useState } from "react";
import GeneralActionModal, { ActionModalProps, maxParcelsToShow } from "./GeneralActionModal";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import dayjs from "dayjs";
import "dayjs/plugin/isSameOrBefore";
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
    reportName: string;
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
                            onFileCreationCompleted,
                            onFileCreationFailed,
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
                        onFileCreationCompleted,
                        onFileCreationFailed,
                    })}
                </>
            )}
        </>
    );
};

const ReportModal: React.FC<ReportModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRangeState>({ from: dayjs(), to: dayjs() });

    const isInputValid =
        props.actionModalProps.selectedParcels.length > 0
            ? undefined
            : dateRange.from.isSameOrBefore(dateRange.to);
    // this is used for the reports that use a time interval to determine what information to be put in the report
    // and is unused for the reports that use a list of parcels as the information for the report

    useEffect(() => {
        if (props.actionModalProps.selectedParcels.length > 0) {
            const allDeleted = props.actionModalProps.selectedParcels.every(
                (parcel) => !parcel.clientIsActive
            );
            if (allDeleted) {
                setErrorMessage("All selected parcels belong to deleted clients.");
                setActionCompleted(true);
            }
        }
    }, [props.actionModalProps.selectedParcels]);

    const onClose = (): void => {
        props.actionModalProps.onClose();
        setDateRange({ from: dayjs(), to: dayjs() });
        setErrorMessage(null);
    };

    const onFileCreationCompleted = async (): Promise<void> => {
        setSuccessMessage(`${props.reportName} Created`);
        setActionCompleted(true);
        let content;
        if (
            props.actionModalProps.selectedParcels &&
            props.actionModalProps.selectedParcels.length > 0
        ) {
            content = {
                parcelIds: props.actionModalProps.selectedParcels.map((parcel) => parcel.parcelId),
            };
        } else {
            content = {
                fromDate: dateRange.from.toString(),
                toDate: dateRange.to.toString(),
            };
        }
        void sendAuditLog({
            action: `generate ${props.reportName.toLowerCase}`,
            wasSuccess: true,
            content: content,
        });
        props.actionModalProps.postSuccessCallback();

        setTimeout(() => {
            props.actionModalProps.onClose();
        }, 3000);
    };

    const onFileCreationFailed = (csvError: FetchReportError): void => {
        if (csvError.type === "noRowsForInterval") {
            setErrorMessage(`No parcels with specified status to create ${props.reportName}.`);
        } else {
            setErrorMessage(`Failed to fetch ${props.reportName} data`);
        }
        setActionCompleted(true);
        void sendAuditLog({
            action: `generate ${props.reportName.toLowerCase}`,
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
            {!actionCompleted && (
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
