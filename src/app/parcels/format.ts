import { StatusType } from "./ActionBar/saveStatus";

export const formatEventName = (newStatus: StatusType, eventData: string | null): string =>
    `${newStatus} ${eventData ? ` (${eventData})` : ""}`;
