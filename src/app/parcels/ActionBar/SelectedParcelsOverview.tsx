import { ParcelsTableRow } from "../parcelsTable/types";
import styled from "styled-components";
import React from "react";
import { getParcelOverviewString } from "../../../common/format";

const Heading = styled.div`
    font-size: 1.2rem;
    margin: 0.3rem;
`;

const ListContainer = styled.div`
    max-height: 40vh;
    overflow-y: auto;
`;

const ListItem = styled.p<{ emphasised?: boolean }>`
    margin: 0.5rem 0 0.5rem 1rem;
    ${(props) =>
        props.emphasised &&
        `
            font-weight: 800;
        `}
`;

interface ShowParcelsProps {
    parcels: ParcelsTableRow[];
    maxParcelsToShow: number;
}

const SelectedParcelsOverview: React.FC<ShowParcelsProps> = (props) => {
    return (
        <>
            <Heading>
                {props.parcels.length.toString()}{" "}
                {props.parcels.length === 1 ? "Parcel" : "Parcels"} selected:
            </Heading>
            <ListContainer>
                {props.parcels.map((parcel) => (
                    <ListItem key={parcel.parcelId}>
                        {getParcelOverviewString(
                            parcel.addressPostcode.postcode,
                            parcel.fullName,
                            parcel.collectionDatetime,
                            parcel.clientIsActive
                        )}
                    </ListItem>
                ))}
            </ListContainer>
        </>
    );
};

export default SelectedParcelsOverview;
