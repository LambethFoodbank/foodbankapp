"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import AuditLogModalRow, { TextValueContainer } from "../AuditLogModalRow";
import { AuditLogModalRowResponse } from "../types";

interface ListsIngredientNameDetails {
    ingredientName: string;
}

type ListsIngredientErrorType = "failedListsFetch";
interface ListsIngredientError {
    type: ListsIngredientErrorType;
    logId: string;
}

const getListIngredientNameOrErrorMessage = async (
    eventId: string
): Promise<AuditLogModalRowResponse<ListsIngredientNameDetails>> => {
    const { data: data, error } = await supabase
        .from("lists")
        .select("item_name")
        .eq("primary_key", eventId)
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: lists", {
            error: error,
        });
        return {
            data: null,
            errorMessage: getErrorMessage({ type: "failedListsFetch", logId: logId }),
        };
    }

    return { data: { ingredientName: data.item_name }, errorMessage: null };
};

const getErrorMessage = (error: ListsIngredientError): string => {
    let errorMessage = "";
    switch (error.type) {
        case "failedListsFetch":
            errorMessage = "Failed to fetch ingredient name.";
            break;
    }
    return `${errorMessage} Log ID: ${error.logId}`;
};

const ListsIngredientName: React.FC<ListsIngredientNameDetails> = ({ ingredientName }) => (
    <TextValueContainer>{ingredientName}</TextValueContainer>
);

const ListsAuditLogModalRow: React.FC<{ listsId: string }> = ({ listsId }) => (
    <AuditLogModalRow<ListsIngredientNameDetails>
        getDataOrErrorMessage={() => getListIngredientNameOrErrorMessage(listsId)}
        RowComponentWhenSuccessful={ListsIngredientName}
        header="Lists Ingredient"
    />
);

export default ListsAuditLogModalRow;
