"use client";

import React from "react";
import { ActionModalProps } from "./GeneralActionModal";
import PendingMoreInfoReportCsvButton from "../ActionButtons/PendingMoreInfoReportCsvButton";
import ReportModal from "./ReportModal";

const PendingMoreInfoReportModal: React.FC<ActionModalProps> = (props) => {
    return (
        <ReportModal actionModalProps={{ ...props }} csvButton={PendingMoreInfoReportCsvButton} reportName="Pending More Info Report"/>
    );
};

export default PendingMoreInfoReportModal;
