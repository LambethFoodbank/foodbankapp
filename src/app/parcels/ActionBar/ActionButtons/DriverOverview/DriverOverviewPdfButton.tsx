"use client";

import React from "react";
import supabase from "@/supabaseClient";
import PdfButton from "@/components/FileGenerationButtons/PdfButton";
import DriverOverviewPdf, { DriverOverviewPdfData } from "@/pdf/DriverOverview/DriverOverviewPdf";
import getDriverPdfData, {
    DriverOverviewError,
    DriverOverviewErrorType,
} from "@/app/parcels/ActionBar/ActionButtons/DriverOverview/getDriverOverviewData";
import { logErrorReturnLogId } from "@/logger/logger";
import { Dayjs } from "dayjs";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";

interface Props {
    parcels: ParcelsTableRow[];
    driverName: string | null;
    date: Dayjs;
    onPdfCreationCompleted: () => void;
    onPdfCreationFailed: (error: DriverOverviewError) => void;
    disabled: boolean;
}

const DriverOverviewPdfButton = ({
    parcels,
    driverName,
    date,
    onPdfCreationCompleted,
    onPdfCreationFailed,
    disabled,
}: Props): React.ReactElement<any> => {
    const fetchDataAndFileName = async (): Promise<
        FileGenerationDataFetchResponse<DriverOverviewPdfData, DriverOverviewErrorType>
    > => {
        const parcelIds = parcels.map((parcel) => {
            return parcel.parcelId;
        });
        const { data: driverPdfData, error: driverPdfError } = await getDriverPdfData(parcelIds);
        if (driverPdfError) {
            return { data: null, error: driverPdfError };
        }

        const { data: driverMessageData, error: driverMessageError } = await supabase
            .from("website_data")
            .select("name, value")
            .eq("name", "driver_overview_message")
            .single();
        if (driverMessageError) {
            const logId = await logErrorReturnLogId("Error with fetch: Driver overview message", {
                error: driverMessageError,
            });
            return { data: null, error: { type: "driverMessageFetchFailed", logId: logId } };
        }

        return {
            data: {
                fileData: {
                    driverName: driverName,
                    dateTime: date.toDate(),
                    tableData: driverPdfData,
                    message: driverMessageData.value,
                },
                fileName: "DriverOverview.pdf",
            },
            error: null,
        };
    };
    return (
        <PdfButton
            fetchDataAndFileName={fetchDataAndFileName}
            pdfComponent={DriverOverviewPdf}
            onFileCreationCompleted={onPdfCreationCompleted}
            onFileCreationFailed={onPdfCreationFailed}
            disabled={disabled}
            formSubmitButton={true}
            formatName={false}
        />
    );
};

export default DriverOverviewPdfButton;
