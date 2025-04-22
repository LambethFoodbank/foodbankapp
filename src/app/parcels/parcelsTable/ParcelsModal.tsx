import supabase from "@/supabaseClient";
import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import ExpandedParcelDetails from "../ExpandedParcelDetails";
import ExpandedParcelDetailsFallback from "../ExpandedParcelDetailsFallback";
import { getParcelsByIds } from "@/app/parcels/parcelsTable/fetchParcelTableData";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import Statuses from "../ActionBar/Statuses";
import { mergeParamsIntoURL } from "@/common/urlQueryParams";
import { parcelIdParam } from "@/app/parcels/parcelsTable/constants";
import Modal from "@/components/Modal/Modal";
import { Centerer, ContentDiv, OutsideDiv } from "@/components/Modal/ModalFormStyles";
import LinkButton from "@/components/Buttons/LinkButton";
import Icon from "@/components/Icons/Icon";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "styled-components";
import { ConfirmButtons } from "@/components/Buttons/GeneralButtonParts";
import { Button } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";

interface ParcelsModalProps {
    modalIsOpen: boolean;
    setModalIsOpen: (modalIsOpen: boolean) => void;
    selectedParcelId: string | null;
    setSelectedParcelId: (selectedParcelId: string | null) => void;
}

const ParcelsModal: React.FC<ParcelsModalProps> = ({
    modalIsOpen,
    setModalIsOpen,
    selectedParcelId,
    setSelectedParcelId,
}) => {
    const searchParams = useSearchParams();

    const [statusAnchorElement, setStatusAnchorElement] = useState<HTMLElement | null>(null);
    const refreshParcelDetailsRef = useRef<(() => void) | null>(null);

    const [parcelClientId, setParcelClientId] = useState<string | null>(null);
    const [isClientActive, setIsClientActive] = useState<boolean | null>(null);
    const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);

    const theme = useTheme();

    const fetchParcel = async (): Promise<ParcelsTableRow[]> => {
        return await getParcelsByIds(supabase, [selectedParcelId as string]);
    };

    const refreshDetails = (): void => {
        if (refreshParcelDetailsRef.current) {
            refreshParcelDetailsRef.current();
        }
    };

    const closeParcelModalAndUpdateURL = (): void => {
        setModalIsOpen(false);
        setSelectedParcelId(null);

        const paramsRecord: Record<string, string | null> = {};
        paramsRecord[parcelIdParam] = null;
        mergeParamsIntoURL(searchParams, paramsRecord);
    };

    const postSetStatusCallback = (): void => {
        refreshDetails();
    };

    return (
        <>
            <Statuses
                fetchSelectedParcels={fetchParcel}
                postSuccessCallback={postSetStatusCallback}
                statusAnchorElement={statusAnchorElement}
                setStatusAnchorElement={setStatusAnchorElement}
                setModalError={setModalErrorMessage}
            />
            <Modal
                header={
                    <>
                        <Icon icon={faBoxArchive} color={theme.primary.largeForeground[2]} /> Parcel
                        Details
                    </>
                }
                isOpen={modalIsOpen}
                onClose={() => {
                    closeParcelModalAndUpdateURL();
                }}
                headerId="expandedParcelDetailsModal"
                footer={
                    <Centerer>
                        <ConfirmButtons>
                            <LinkButton link={`/parcels/edit/${selectedParcelId}`}>
                                Edit Parcel
                            </LinkButton>
                            <Button
                                variant="contained"
                                onClick={(event) => setStatusAnchorElement(event.currentTarget)}
                                type="button"
                                id="status-button"
                                endIcon={<ArrowDropDown />}
                            >
                                Set Status
                            </Button>
                            {parcelClientId && (
                                <>
                                    <LinkButton
                                        link={`/clients?clientId=${parcelClientId}`}
                                        disabled={!isClientActive}
                                    >
                                        See Client Details
                                    </LinkButton>
                                    <LinkButton
                                        link={`/clients/edit/${parcelClientId}`}
                                        disabled={!isClientActive}
                                    >
                                        Edit Client Details
                                    </LinkButton>
                                </>
                            )}
                        </ConfirmButtons>
                    </Centerer>
                }
            >
                <OutsideDiv>
                    <ContentDiv>
                        <Suspense fallback={<ExpandedParcelDetailsFallback />}>
                            <ExpandedParcelDetails
                                parcelId={selectedParcelId}
                                setParcelClientId={setParcelClientId}
                                setIsClientActive={setIsClientActive}
                                refreshCallback={(refresh) => {
                                    refreshParcelDetailsRef.current = refresh;
                                }}
                            />
                        </Suspense>
                    </ContentDiv>
                    {modalErrorMessage && (
                        <ErrorSecondaryText>{modalErrorMessage}</ErrorSecondaryText>
                    )}
                </OutsideDiv>
            </Modal>
        </>
    );
};

export default ParcelsModal;
