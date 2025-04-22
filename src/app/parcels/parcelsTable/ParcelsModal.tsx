import supabase from "@/supabaseClient";
import { getParcelsByIds } from "@/app/parcels/parcelsTable/fetchParcelTableData";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import Modal from "@/components/Modal/Modal";
import { Centerer, ContentDiv, OutsideDiv } from "@/components/Modal/ModalFormStyles";
import { Suspense, useRef, useState } from "react";
import ExpandedParcelDetails from "../ExpandedParcelDetails";
import ExpandedParcelDetailsFallback from "../ExpandedParcelDetailsFallback";
import LinkButton from "@/components/Buttons/LinkButton";
import Icon from "@/components/Icons/Icon";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "styled-components";
import { ParcelsTableRow, SelectedClientDetails } from "./types";
import { useRouter } from "next/navigation";
import { ConfirmButtons } from "@/components/Buttons/GeneralButtonParts";
import { Button } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import Statuses from "../ActionBar/Statuses";

interface ParcelsModalProps {
    modalIsOpen: boolean;
    setModalIsOpen: (modalIsOpen: boolean) => void;
    selectedParcelId: string | null;
    selectedClientDetails: SelectedClientDetails | null;
    modalErrorMessage: string | null;
    setModalErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const ParcelsModal: React.FC<ParcelsModalProps> = ({
    modalIsOpen,
    setModalIsOpen,
    selectedParcelId,
    selectedClientDetails,
    modalErrorMessage,
    setModalErrorMessage,
}) => {
    const [statusAnchorElement, setStatusAnchorElement] = useState<HTMLElement | null>(null);
    const refreshParcelDetailsRef = useRef<(() => void) | null>(null);

    const theme = useTheme();
    const router = useRouter();

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
                    setModalIsOpen(false);
                    router.push("/parcels"); // QQ this needs to set the shared URL params wrapped object, not overwrite
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
                            {selectedClientDetails && (
                                <>
                                    <LinkButton
                                        link={`/clients?clientId=${selectedClientDetails.clientId}`}
                                        disabled={!selectedClientDetails.isClientActive}
                                    >
                                        See Client Details
                                    </LinkButton>
                                    <LinkButton
                                        link={`/clients/edit/${selectedClientDetails.clientId}`}
                                        disabled={!selectedClientDetails.isClientActive}
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
