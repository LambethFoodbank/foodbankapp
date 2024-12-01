"use client";

import { Button } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { saveAs } from "file-saver";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";

interface FileGenerationButtonProps<Data, ErrorType extends string> {
    children: React.ReactNode;
    fetchDataAndFileName: () => Promise<FileGenerationDataFetchResponse<Data, ErrorType>>;
    blobGenerator: (data: Data) => Promise<Blob>;
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (error: { type: ErrorType; logId: string }) => void;
    formatName?: boolean;
    disabled?: boolean;
    focusOnButton?: boolean;
    formSubmitButton?: boolean;
}

const makePaddedString = (inputNumber: number): string => {
    return inputNumber.toString().padStart(2, "0");
};

const filenameTimestampNow = (): string => {
    const now = new Date();

    const year = now.getFullYear().toString();
    const month = makePaddedString(now.getMonth() + 1);
    const day = makePaddedString(now.getDate());
    const hours = makePaddedString(now.getHours());
    const minutes = makePaddedString(now.getMinutes());
    const seconds = makePaddedString(now.getSeconds());

    return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
};

const formatFileName = (fileName: string): string => {
    const fileNamePartsRegEx = /^(.+)\.(.+)$/g;
    const matchArray = fileNamePartsRegEx.exec(fileName);
    if (matchArray != null) {
        const rootFileName = matchArray[1];
        const extension = matchArray[2];
        return `${rootFileName}_${filenameTimestampNow()}.${extension}`;
    } else {
        return `${fileName}_${filenameTimestampNow()}`;
    }
};

const FileGenerationButton = <Data, ErrorType extends string>({
    children,
    fetchDataAndFileName,
    blobGenerator,
    onFileCreationCompleted: onFileCreationCompleted = () => undefined,
    onFileCreationFailed: onFileCreationFailed,
    formatName = true,
    disabled = false,
    focusOnButton = false,
    formSubmitButton = false,
}: FileGenerationButtonProps<Data, ErrorType>): React.ReactElement => {
    const onClick = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();
        const { data, error } = await fetchDataAndFileName();
        if (error) {
            onFileCreationFailed(error);
            return;
        }

        const blob = await blobGenerator(data.fileData);

        saveAs(blob, formatName ? formatFileName(data.fileName) : data.fileName);
        onFileCreationCompleted();
    };

    const buttonToFocusRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        focusOnButton && buttonToFocusRef.current?.focus();
    }, [focusOnButton]);

    return (
        <Button
            variant="contained"
            onClick={(event) => onClick(event)}
            disabled={disabled}
            ref={buttonToFocusRef}
            type={formSubmitButton ? "submit" : undefined}
        >
            {children}
        </Button>
    );
};

export default FileGenerationButton;
