import supabase from "@/supabaseClient";
import { Suspense, useEffect, useRef, useState } from "react";
import { generateReturnPathQueryParam } from "@/common/urlQueryParams";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import ExpandedParcelDetails from "../ExpandedEmergencyBagDetails";
import ExpandedEmergencyBagDetailsFallback from "../ExpandedEmergencyBagDetailsFallback";
import { getParcelsByIds } from "@/app/parcels/parcelsTable/fetchParcelTableData";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import Statuses from "../ActionBar/Statuses";
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
    selectedParcelId: string | null;
    closeParcelModal: () => void;
}

const EmergencyBagsModal: React.FC<ParcelsModalProps> = ({
    modalIsOpen,
    selectedParcelId,
    closeParcelModal,
}) => {
    const [statusAnchorElement, setStatusAnchorElement] = useState<HTMLElement | null>(null);
    const refreshParcelDetailsRef = useRef<(() => void) | null>(null);

    const [parcelClientId, setParcelClientId] = useState<string | null>(null);
    const [isClientActive, setIsClientActive] = useState<boolean | null>(null);
    const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
    const [returnPathQueryParamForLinks, setReturnPathQueryParamForLinks] = useState<string | null>(
        null
    );

    const theme = useTheme();

    useEffect(() => {
        setReturnPathQueryParamForLinks(generateReturnPathQueryParam(window.location));
    }, [modalIsOpen]);

    const fetchParcel = async (): Promise<ParcelsTableRow[]> => {
        return await getParcelsByIds(supabase, [selectedParcelId as string]);
    };

    const refreshDetails = (): void => {
        if (refreshParcelDetailsRef.current) {
            refreshParcelDetailsRef.current();
        }
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
                    closeParcelModal();
                }}
                headerId="expandedParcelDetailsModal"
                footer={
                    <Centerer>
                        <ConfirmButtons>
                            <LinkButton
                                link={`/parcels/edit/${selectedParcelId}?${returnPathQueryParamForLinks}`}
                            >
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
                                        link={`/clients?clientId=${parcelClientId}&${returnPathQueryParamForLinks}`}
                                        disabled={!isClientActive}
                                    >
                                        See Client Details
                                    </LinkButton>
                                    <LinkButton
                                        link={`/clients/edit/${parcelClientId}?${returnPathQueryParamForLinks}`}
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
                        <Suspense fallback={<ExpandedEmergencyBagDetailsFallback />}>
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

export default EmergencyBagsModal;
