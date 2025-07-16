"use client";

import { pdf } from "@react-pdf/renderer";
import React from "react";
import FileGenerationButton from "@/components/FileGenerationButtons/FileGenerationButton";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";

interface PdfButtonProps<Data, ErrorType extends string> {
    fetchDataAndFileName: () => Promise<FileGenerationDataFetchResponse<Data, ErrorType>>;
    pdfComponent: React.FC<{ data: Data }>;
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (error: { type: ErrorType; logId: string }) => void;
    formatName?: boolean;
    disabled?: boolean;
    focusOnButton?: boolean;
    formSubmitButton?: boolean;
}

const PdfButton = <Data, ErrorType extends string>({
    fetchDataAndFileName,
    pdfComponent: PdfComponent,
    onFileCreationCompleted: onFileCreationCompleted = () => undefined,
    onFileCreationFailed: onFileCreationFailed,
    formatName = true,
    disabled = false,
    focusOnButton = false,
    formSubmitButton = false,
}: PdfButtonProps<Data, ErrorType>): React.ReactElement => {
    const pdfBlobGenerator = async (data: Data): Promise<Blob> => {
        return pdf(<PdfComponent data={data} />).toBlob();
    };

    return (
        <FileGenerationButton
            fetchDataAndFileName={fetchDataAndFileName}
            blobGenerator={pdfBlobGenerator}
            onFileCreationCompleted={onFileCreationCompleted}
            onFileCreationFailed={onFileCreationFailed}
            formatName={formatName}
            disabled={disabled}
            focusOnButton={focusOnButton}
            formSubmitButton={formSubmitButton}
        >
            Download PDF
        </FileGenerationButton>
    );
};

export default PdfButton;
