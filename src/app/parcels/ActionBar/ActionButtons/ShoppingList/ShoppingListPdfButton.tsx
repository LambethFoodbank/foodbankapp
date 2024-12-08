"use client";

import React from "react";
import getShoppingListData, {
    ShoppingListPdfErrorType,
} from "@/app/parcels/ActionBar/ActionButtons/ShoppingList/getShoppingListData";
import PdfButton from "@/components/FileGenerationButtons/PdfButton";
import ShoppingListPdf from "@/pdf/ShoppingList/ShoppingListPdf";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { ShoppingListPdfData } from "./shoppingListPdfDataProps";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";

interface Props {
    parcels: ParcelsTableRow[];
    onPdfCreationCompleted: () => void;
    onPdfCreationFailed: (error: { type: ShoppingListPdfErrorType; logId: string }) => void;
}

const ShoppingListPdfButton = ({
    parcels,
    onPdfCreationCompleted,
    onPdfCreationFailed,
}: Props): React.ReactElement => {
    const fetchDataAndFileName = async (): Promise<
        FileGenerationDataFetchResponse<ShoppingListPdfData[], ShoppingListPdfErrorType>
    > => {
        const parcelIds = parcels.map((parcel) => parcel.parcelId);
        const { data, error } = await getShoppingListData(parcelIds);
        if (error) {
            return { data: null, error: error };
        }
        return { data: { fileData: data, fileName: "ShoppingList.pdf" }, error: null };
    };
    return (
        <PdfButton
            fetchDataAndFileName={fetchDataAndFileName}
            pdfComponent={ShoppingListPdf}
            onFileCreationCompleted={onPdfCreationCompleted}
            onFileCreationFailed={onPdfCreationFailed}
            focusOnButton={true}
        />
    );
};

export default ShoppingListPdfButton;
