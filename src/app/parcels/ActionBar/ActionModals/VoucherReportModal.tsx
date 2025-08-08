"use client";

import React from "react";
import { ActionModalProps } from "./GeneralActionModal";
import MissingVoucherNumberReportCsvButton from "../ActionButtons/VoucherNumberReportCsvButton";
import ReportModal from "./ReportModal";

const MissingVoucherNumberReportModal: React.FC<ActionModalProps> = (props) => {
    return (
        <ReportModal
            actionModalProps={{ ...props }}
            csvButton={MissingVoucherNumberReportCsvButton}
        />
    );
};

export default MissingVoucherNumberReportModal;
