"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import AuditLogModalRow, { TextValueContainer } from "../AuditLogModalRow";
import { AuditLogModalRowResponse } from "../types";

interface EventNameDetails {
    eventName: string;
}

type EventNameErrorType = "failedEventFetch";
interface EventNameError {
    type: EventNameErrorType;
    logId: string;
}

const getEventNameOrErrorMessage = async (
    eventId: string
): Promise<AuditLogModalRowResponse<EventNameDetails>> => {
    const { data: data, error } = await supabase
        .from("events")
        .select("primary_key, new_parcel_status")
        .eq("primary_key", eventId)
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: events", {
            error: error,
        });
        return {
            data: null,
            errorMessage: getErrorMessage({ type: "failedEventFetch", logId: logId }),
        };
    }

    return { data: { eventName: data.new_parcel_status }, errorMessage: null };
};

const getErrorMessage = (error: EventNameError): string => {
    let errorMessage = "";
    switch (error.type) {
        case "failedEventFetch":
            errorMessage = "Failed to fetch event data.";
            break;
    }
    return `${errorMessage} Log ID: ${error.logId}`;
};

const EventName: React.FC<EventNameDetails> = ({ eventName }) => (
    <TextValueContainer>{eventName}</TextValueContainer>
);

const EventAuditLogModalRow: React.FC<{ eventId: string }> = ({ eventId }) => (
    <AuditLogModalRow<EventNameDetails>
        getDataOrErrorMessage={() => getEventNameOrErrorMessage(eventId)}
        RowComponentWhenSuccessful={EventName}
        header="event"
    />
);

export default EventAuditLogModalRow;
