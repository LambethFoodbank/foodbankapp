export class DatabaseError extends Error {
    constructor(errorCategory: DatabaseOperation, faultyArea = "", logId?: string) {
        super(
            `An error occurred completing the ${errorCategory} operation` +
                (faultyArea !== "" ? ` (${faultyArea})` : "") +
                ". Please try again." +
                logId
                ? ` Log ID: ${logId}`
                : ""
        );
        this.name = "DatabaseError";
    }
}

type DatabaseOperation = "fetch" | "insert" | "update" | "delete";

export class EdgeFunctionError extends Error {
    constructor(functionDescriptor = "", logId?: string) {
        super(
            "An error occurred executing an internal operation (" + functionDescriptor + ")" + logId
                ? ` Log ID: ${logId}`
                : ""
        );
        this.name = "EdgeFunctionError";
    }
}
