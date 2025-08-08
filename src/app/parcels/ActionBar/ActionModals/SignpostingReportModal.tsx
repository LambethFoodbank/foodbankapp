"use client";

import React from "react";
import { ActionModalProps } from "./GeneralActionModal";
import ReportModal from "./ReportModal";
import SignpostingReportCsvButton from "../ActionButtons/SignpostingReportCsvButton";

const SignPostingReportModal: React.FC<ActionModalProps> = (props) => {
    return <ReportModal actionModalProps={{ ...props }} csvButton={SignpostingReportCsvButton} />;
};

export default SignPostingReportModal;
