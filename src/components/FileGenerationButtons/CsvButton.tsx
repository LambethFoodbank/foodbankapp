"use client";

import React from "react";
import { mkConfig, generateCsv, asBlob, ConfigOptions } from "export-to-csv";
import FileGenerationButton from "@/components/FileGenerationButtons/FileGenerationButton";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";

interface CsvButtonProps<Data, ErrorType extends string> {
    fetchDataAndFileName: () => Promise<FileGenerationDataFetchResponse<Data, ErrorType>>;
    csvConfig: ConfigOptions;
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (error: { type: ErrorType; logId: string }) => void;
    formatName?: boolean;
    disabled?: boolean;
    focusOnButton?: boolean;
    formSubmitButton?: boolean;
}

const CsvButton = <
    Data extends {
        [k: string]: number | string | boolean | null | undefined;
    }[],
    ErrorType extends string,
>({
    fetchDataAndFileName,
    csvConfig,
    onFileCreationCompleted: onFileCreationCompleted = () => undefined,
    onFileCreationFailed: onFileCreationFailed,
    formatName = true,
    disabled = false,
    focusOnButton = false,
    formSubmitButton = false,
}: CsvButtonProps<Data, ErrorType>): React.ReactElement => {
    const csvBlobGenerator = async (data: Data): Promise<Blob> => {
        const madeConfig = mkConfig(csvConfig);

        return asBlob(madeConfig)(generateCsv(madeConfig)(data));
    };

    return (
        <FileGenerationButton
            fetchDataAndFileName={fetchDataAndFileName}
            blobGenerator={csvBlobGenerator}
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

export default CsvButton;
