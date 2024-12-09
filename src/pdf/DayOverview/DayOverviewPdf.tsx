"use client";

import React from "react";
import { Svg, Document, Page, Text, View, StyleSheet, Path } from "@react-pdf/renderer";
import { faFlag, faSquare, IconDefinition, faCopyright } from "@fortawesome/free-solid-svg-icons";
import {
    DayOverviewPdfData,
    ParcelForDayOverview,
} from "@/app/parcels/ActionBar/ActionButtons/DayOverviewPdfButton";
import FontAwesomeIconPdfComponent from "../FontAwesomeIconPdfComponent";
import { displayPostcodeForHomelessClient } from "@/common/format";

interface DayOverviewRowProps {
    parcel: ParcelForDayOverview;
}

interface DayOverviewContentProps {
    parcels: ParcelForDayOverview[];
}

interface DayOverviewPdfProps {
    data: DayOverviewPdfData;
}

interface CustomSVGProps {
    icon: IconDefinition;
    color: string;
    fill: boolean;
}

const styles = StyleSheet.create({
    page: {
        display: "flex",
        flexDirection: "column",
        padding: "0 30pt 15pt",
        fontSize: "11pt",
    },
    title: {
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        fontSize: "30px",
        textAlign: "center",
        margin: "0 22.5pt 22.5pt",
    },
    svg: {
        margin: "0 0.75pt",
        padding: "0 0.75pt",
    },
    cell: {
        borderStyle: "solid",
        borderRightWidth: 1,
        borderBottomWidth: 1,
        padding: "2.25pt",
    },
    margin: { height: "37.5pt" },
    row: { display: "flex", flexDirection: "row" },
    bold: { fontFamily: "Helvetica-Bold" },

    cellLogo: { flex: 1 },
    cellName: { flex: 4 },
    cellPostcode: {
        flex: 4,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
    },
    cellTime: { flex: 2 },
    cellCollection: { flex: 4 },
    cellInstructions: { flex: 10 },
});

const dateTimeToAMPM = (datetime: string): string => {
    return new Date(datetime).getHours() <= 11 ? "AM" : "PM";
};

const CustomSVG: React.FC<CustomSVGProps> = ({ icon, color, fill }) => {
    const svgPath = icon.icon[4];
    const formattedSvgPath = typeof svgPath === "string" ? svgPath : svgPath[0];

    return (
        <Svg width={11} height={11} viewBox="0 0 512 512" style={styles.svg}>
            <Path
                fill={fill ? color : undefined}
                stroke={color}
                strokeWidth={40}
                d={formattedSvgPath}
            />
        </Svg>
    );
};

const DayOverviewMargin: React.FC = () => {
    return <View style={styles.margin} fixed></View>;
};

const DayOverviewHeader: React.FC = () => {
    return (
        <View style={[styles.row, styles.bold, { borderTop: "1 solid black" }]} fixed>
            <Text style={[styles.cellLogo, styles.cell]}></Text>
            <Text style={[styles.cellName, styles.cell]}>Name</Text>
            <Text style={[styles.cellPostcode, styles.cell]}>Postcode</Text>
            <Text style={[styles.cellTime, styles.cell]}>Time</Text>
            <Text style={[styles.cellCollection, styles.cell]}>Collection</Text>
            <Text style={[styles.cellInstructions, styles.cell]}>Instructions</Text>
        </View>
    );
};

const DayOverviewRow: React.FC<DayOverviewRowProps> = ({ parcel }) => {
    return (
        <View style={styles.row} wrap={false}>
            <View style={[styles.cellLogo, styles.cell, styles.row]}>
                <CustomSVG icon={faSquare} color="black" fill={false} />
                {parcel.client?.flagged_for_attention && (
                    <CustomSVG icon={faFlag} color="orange" fill={true} />
                )}
            </View>
            <Text style={[styles.cellName, styles.cell]}>
                {parcel.client?.full_name ?? "Client Name unknown"}
            </Text>
            <View style={[styles.cell, styles.cellPostcode, styles.row]}>
                <Text>{parcel.client?.address_postcode ?? displayPostcodeForHomelessClient} </Text>
                {parcel.collection_centre?.name === "Delivery" &&
                    parcel.congestionChargeApplies && (
                        <FontAwesomeIconPdfComponent
                            faIcon={faCopyright}
                            color="red"
                            styleWidth="10px"
                            marginTop="1px"
                        />
                    )}
            </View>
            <Text style={[styles.cellTime, styles.cell]}>
                {parcel.collection_datetime
                    ? dateTimeToAMPM(parcel.collection_datetime)
                    : "collection time not specified"}
            </Text>
            <Text style={[styles.cellCollection, styles.cell]}>
                {parcel.collection_centre?.name ?? "Collection centre not specified"}
            </Text>
            <Text style={[styles.cellInstructions, styles.cell]}>
                {parcel.client?.delivery_instructions ?? "No instructions provided"}
            </Text>
        </View>
    );
};

const DayOverviewContent: React.FC<DayOverviewContentProps> = ({ parcels }) => {
    return (
        <View style={{ borderLeft: "1 solid black" }}>
            <DayOverviewHeader />
            {parcels.map((parcel) => (
                <DayOverviewRow key={parcel.primary_key} parcel={parcel} />
            ))}
        </View>
    );
};

const DayOverviewPdf: React.FC<DayOverviewPdfProps> = ({ data }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <DayOverviewMargin />
                <Text style={styles.title}>Day Overview</Text>
                <DayOverviewContent parcels={data.parcels} />
                <DayOverviewMargin />
            </Page>
        </Document>
    );
};

export default DayOverviewPdf;
