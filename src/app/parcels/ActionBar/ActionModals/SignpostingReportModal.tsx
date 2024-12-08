"use client";

import React, { useState } from "react";
import GeneralActionModal, { Heading, ActionModalProps } from "./GeneralActionModal";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import SignpostingReportCsvButton, {
    FetchSignpostingReportError,
} from "../ActionButtons/SignpostingReportCsvButton";

interface SignpostingReportInputProps {
    fakeProp: string;
    // onDateChange: (newDate: Dayjs | null) => void;
    // setDateValid: () => void;
    // setDateInvalid: () => void;
}

interface ContentProps {
    isInputValid: boolean;
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (csvError: FetchSignpostingReportError) => void;
    // selectedParcels: ParcelsTableRow[];
    // labelQuantity: number
    // onLabelQuantityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    // duplicateDownloadedPostcodes: (string | null)[];
}

const SignpostingReportInput: React.FC<SignpostingReportInputProps> = (props) => {
    return (
        <>
            <Heading>Signposting Report: {props.fakeProp}</Heading>
            {/* QQ: Needs date range */}
            {/* <DatePicker
                defaultValue={dayjs()}
                onChange={props.onDateChange}
                onError={(error) => {
                    if (error) {
                        props.setDateInvalid();
                    } else {
                        props.setDateValid();
                    }
                }}
                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                disablePast
            /> */}
        </>
    );
};

const SignpostingReportModalContent: React.FC<ContentProps> = ({
    isInputValid,
    onFileCreationCompleted,
    onFileCreationFailed,
}) => {
    return (
        <form>
            <SignpostingReportInput fakeProp="fake" />
            <Centerer>
                <SignpostingReportCsvButton
                    fromDate={new Date("2024-12-01")} //QQ
                    toDate={new Date("2024-12-03")} //QQ
                    onFileCreationCompleted={onFileCreationCompleted}
                    onFileCreationFailed={onFileCreationFailed}
                    disabled={isInputValid}
                />
            </Centerer>
        </form>
    );
};

const SignPostingReportModal: React.FC<ActionModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // const [date, setDate] = useState(dayjs());

    // const [isDateValid, setIsDateValid] = useState(true);

    const isInputValid = true; //    isDateValid; // date range

    // const onDateChange = (newDate: Dayjs | null): void => {
    //     if (newDate) {
    //         setDate(newDate);
    //     }
    // };

    const onClose = (): void => {
        props.onClose();
        // setDate(dayjs());
        // setErrorMessage(null);
    };

    const onFileCreationCompleted = async (): Promise<void> => {
        console.log("Csv Success");
        //     const { error } = await props.updateParcelStatuses(
        //         props.selectedParcels,
        //         "Out for Delivery",
        //         `with ${driverName ?? displayNameForNullDriverName}`,
        //         undefined,
        //         date
        //     );
        //     if (error) {
        //         setErrorMessage(getStatusErrorMessageWithLogId(error));
        //     }
        setSuccessMessage("Signposting Report Created");
        setActionCompleted(true);
        //     void sendAuditLog({
        //         action: "create driver overview pdf",
        //         wasSuccess: true,
        //         content: {
        //             parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId),
        //             date: date.toString(),
        //             driverName: driverName,
        //         },
        //     });
    };

    const onFileCreationFailed = (csvError: FetchSignpostingReportError): void => {
        console.log("CsvFailure");
        setErrorMessage(
            csvError.type === "failedToFetchSignpostingRows" ? "Couldn't fetch" : "Unknown"
        ); // QQ
        setActionCompleted(true);
        //     void sendAuditLog({
        //         action: "create driver overview pdf",
        //         wasSuccess: false,
        //         content: {
        //             parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId),
        //             date: date.toString(),
        //             driverName: driverName,
        //         },
        //         logId: pdfError.logId,
        //     });
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
                    isInputValid={isInputValid}
                    onFileCreationCompleted={onFileCreationCompleted}
                    onFileCreationFailed={onFileCreationFailed}
                />

                // <DriverOverviewModalContent
                //     onDateChange={onDateChange}
                //     onDriverNameChange={onDriverNameChange}
                //     setIsDateValid={setIsDateValid}
                //     selectedParcels={props.selectedParcels}
                //     maxParcelsToShow={maxParcelsToShow}
                //     date={date}
                //     driverName={driverName}
                //     onPdfCreationCompleted={onPdfCreationCompleted}
                //     onPdfCreationFailed={onPdfCreationFailed}
                //     isInputValid={isInputValid}
                // />
            )}
        </GeneralActionModal>
    );
};

export default SignPostingReportModal;
