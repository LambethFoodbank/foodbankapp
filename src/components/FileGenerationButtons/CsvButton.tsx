"use client";

import React from "react";
import { mkConfig, generateCsv, asBlob, ConfigOptions } from "export-to-csv";
import FileGenerationButton from "@/components/FileGenerationButtons/FileGenerationButton";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";
import { formatCamelCaseKey } from "@/common/format";

export const formatNumberAsStringForCsv = (value: string | null): string => {
    if (value === null) {
        return "";
    }
    return value.length && value[0] !== "'" ? "'" + value : value;
};

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
        // Override useKeysAsHeaders to make the keys user-friendly
        if (
            csvConfig.useKeysAsHeaders &&
            data.length > 0 &&
            data[0] !== null &&
            data[0] !== undefined
        ) {
            csvConfig.columnHeaders = Object.keys(data[0]).map((key: string) => {
                return { key: key, displayLabel: formatCamelCaseKey(key) };
            });
            csvConfig.useKeysAsHeaders = false;
        }
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
