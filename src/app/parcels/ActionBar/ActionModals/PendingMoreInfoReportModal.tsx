"use client";

import React from "react";
import { ActionModalProps } from "./GeneralActionModal";
import ReportModal from "./ReportModal";
import PendingMoreInfoReportCsvButton from "../ActionButtons/PendingMoreInfoReportCsvButton";

const PendingMoreInfoReportModal: React.FC<ActionModalProps> = (props) => {
    return (
        <ReportModal
            actionModalProps={{ ...props }}
            csvButton={PendingMoreInfoReportCsvButton}
            reportName="Pending More Info Report"
            reportType="dateInterval"
        />
    );
};

export default PendingMoreInfoReportModal;
