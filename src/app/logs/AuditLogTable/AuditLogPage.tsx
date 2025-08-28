"use client";

import React, { useState } from "react";
import FloatingToast from "@/components/FloatingToast";
import AuditLogTable from "./AuditLogTable";

const AuditLogPage: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    return (
        <>
            {(
                <>
                    {errorMessage && (
                        <FloatingToast
                            message={errorMessage}
                            severity="warning"
                            variant="filled"
                        ></FloatingToast>
                    )}
                    <AuditLogTable />
                </>
            )}
        </>
    );
};

export default AuditLogPage;
