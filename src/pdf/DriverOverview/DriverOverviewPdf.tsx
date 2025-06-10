"use client";

import React from "react";
import { Text, Document, Page, View, StyleSheet, Image } from "@react-pdf/renderer";
import { displayNameForNullDriverName, formatDateTime } from "@/common/format";
import {
    DriverOverviewRowData,
    DriverOverviewTablesData,
} from "@/app/parcels/ActionBar/ActionButtons/DriverOverview/getDriverOverviewData";

export interface DriverOverviewPdfData {
    driverName: string | null;
    dateTime: Date;
    tableData: DriverOverviewTablesData;
    message: string;
}

interface DriverOverviewCardProps {
    data: DriverOverviewPdfData;
}

const styles = StyleSheet.create({
    container: {
        padding: 25,
        paddingBottom: 40,
        alignItems: "center",
        fontFamily: "Helvetica",
    },
    fixedFooter: {
        position: "absolute",
        bottom: "20px",
        fontSize: "10px",
        textAlign: "center",
    },
    headerInfoAndLogo: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoRow: {
        flexDirection: "row",
        borderLeft: "3px solid black",
        borderTop: "3px solid black",
        borderBottom: "3px solid black",
    },
    infoColumn: {
        padding: 5,
        borderRight: "3px solid black",
    },
    endInfoContainer: {
        border: "1 solid black",
        margin: 10,
        padding: 10,
        width: "100%",
        alignItems: "center",
        lineHeight: 1.5,
    },
    h1text: {
        fontFamily: "Helvetica-Bold",
        fontSize: 20,
    },
    h2text: {
        fontSize: 14,
    },
    h3text: {
        fontSize: 10,
    },
    logoStyling: {
        maxHeight: 60,
        maxWidth: 102, // maintains aspect ratio of logo
        align: "left",
        marginRight: 15,
    },
    warningSection: {
        width: "100%",
        paddingBottom: 10,
    },
    tableContainer: {
        width: "100%",
    },
    tableSection: {
        width: "100%",
        marginBottom: "15px",
    },
    tableTitle: {
        marginBottom: "5px",
        fontSize: 12,
        alignSelf: "flex-start",
    },
    tableRow: {
        width: "100%",
        fontSize: 10,
        borderLeft: "1px solid black",
        borderBottom: "1px solid black",
        lineHeight: 1.5,
    },
    tableColumn: {
        padding: 5,
        borderRight: "1px solid black",
    },
    flexColumn: {
        flexDirection: "column",
        display: "flex",
    },
    flexRow: {
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-between",
    },
    tableHeader: {
        fontSize: 12,
        borderLeft: "1px solid black",
        borderBottom: "1px solid black",
        borderTop: "1px solid black",
        height: 30,
    },
    nameColumnWidth: {
        width: "15%",
    },
    addressColumnWidth: {
        width: "20%",
    },
    contactColumnWidth: {
        width: "15%",
    },
    packingDateColumnWidth: {
        width: "13%",
    },
    numberOfLabelsColumnWidth: {
        width: "8%",
    },
    instructionsColumnWidth: {
        width: "40%",
    },
});

const DriverOverviewCard: React.FC<DriverOverviewCardProps> = ({ data }) => {
    const createTableHeader = (): React.JSX.Element => {
        return (
            <View
                style={[
                    styles.tableHeader,
                    styles.flexRow,
                    {
                        textDecoration: "underline",
                        fontFamily: "Helvetica-Bold",
                    },
                ]}
            >
                <View style={[styles.tableColumn, styles.nameColumnWidth]}>
                    <Text>Name</Text>
                </View>
                <View style={[styles.tableColumn, styles.addressColumnWidth]}>
                    <Text>Address</Text>
                </View>
                <View style={[styles.tableColumn, styles.contactColumnWidth]}>
                    <Text>Contact</Text>
                </View>
                <View style={[styles.tableColumn, styles.packingDateColumnWidth]}>
                    <Text>Packing Date</Text>
                </View>
                <View style={[styles.tableColumn, styles.numberOfLabelsColumnWidth]}>
                    <Text>Parcels</Text>
                </View>
                <View style={[styles.tableColumn, styles.instructionsColumnWidth]}>
                    <Text>Instructions</Text>
                </View>
            </View>
        );
    };

    const createRow = (rowData: DriverOverviewRowData, index: number): React.JSX.Element => {
        return (
            // eslint-disable-next-line react/no-array-index-key
            <View key={index} style={[styles.tableRow, styles.flexRow]} wrap={false}>
                <View style={[styles.tableColumn, styles.nameColumnWidth]}>
                    <Text>{rowData.name}</Text>
                </View>
                <View style={[styles.tableColumn, styles.addressColumnWidth]}>
                    <Text>{rowData.address}</Text>
                </View>
                <View style={[styles.tableColumn, styles.contactColumnWidth]}>
                    <Text>{rowData.contact}</Text>
                </View>
                <View style={[styles.tableColumn, styles.packingDateColumnWidth]}>
                    <Text>{rowData.packingDate || "No recorded date"}</Text>
                </View>
                <View style={[styles.tableColumn, styles.numberOfLabelsColumnWidth]}>
                    <Text>{rowData.numberOfLabels || "Unknown"}</Text>
                </View>
                <View style={[styles.tableColumn, styles.instructionsColumnWidth]}>
                    <Text>{rowData.instructions}</Text>
                </View>
            </View>
        );
    };

    const createTable = (
        tableName: string | null,
        rows: DriverOverviewRowData[]
    ): React.JSX.Element => {
        return (
            <View style={styles.tableContainer}>
                <View fixed>
                    {/* react-pdf has a bug rendering SVGs that are on a page break, so the delivery/collection icon has been removed
                     * https://github.com/diegomura/react-pdf/issues/1853#issuecomment-2573870127 (although that issue is closed, the bug still occurs)
                     */}
                    {tableName && (
                        <View style={[styles.tableTitle, styles.flexRow]}>
                            <Text>{tableName} </Text>
                        </View>
                    )}
                    <View style={[styles.flexColumn, { width: "100%" }]}>
                        {createTableHeader()}
                    </View>
                </View>
                <View style={[styles.tableSection, styles.flexColumn]}>{rows.map(createRow)}</View>
            </View>
        );
    };

    const createSection = (sectionTables: React.JSX.Element[]): React.JSX.Element => {
        return <View style={styles.tableContainer}>{sectionTables}</View>;
    };

    const deliveriesSection = createSection([createTable("Deliveries", data.tableData.deliveries)]);

    const collectionsSection = createSection(
        data.tableData.collections.map((ccData) =>
            createTable(ccData.collectionCentreName, ccData.rowData)
        )
    );

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={[styles.container, styles.flexColumn]}>
                <View style={styles.headerInfoAndLogo}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoColumn}>
                            <Text style={styles.h1text}>Driver Overview</Text>
                        </View>
                        <View style={styles.infoColumn}>
                            <Text style={styles.h1text}>
                                {data.driverName ?? displayNameForNullDriverName}
                            </Text>
                        </View>
                        <View style={styles.infoColumn}>
                            <Text style={styles.h1text}>{formatDateTime(data.dateTime)}</Text>
                        </View>
                    </View>
                    {/* eslint-disable-next-line -- needed to remove the need for alt text on the logo */}
                    <Image src="/logo.png" style={styles.logoStyling}></Image>
                </View>
                {data.tableData.deliveries.length && deliveriesSection}
                {data.tableData.collections.length && collectionsSection}
                <View style={[styles.endInfoContainer, { alignSelf: "center" }]} wrap={false}>
                    <Text style={[styles.h3text, { textAlign: "center", marginBottom: "5px" }]}>
                        {data.message}
                    </Text>
                    <Text
                        style={[
                            styles.h3text,
                            { fontFamily: "Helvetica-Bold", textAlign: "center" },
                        ]}
                    >
                        THIS SHEET MUST BE DESTROYED OR RETURNED TO THE WAREHOUSE IMMEDIATELY ON
                        COMPLETION OF DELIVERIES
                    </Text>
                </View>
                <View style={styles.fixedFooter} fixed>
                    <Text
                        render={({ pageNumber, totalPages }) =>
                            `Page ${pageNumber} of ${totalPages}`
                        }
                    />
                </View>
            </Page>
        </Document>
    );
};

export default DriverOverviewCard;
