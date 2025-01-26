import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import Modal from "@/components/Modal/Modal";
import { Centerer, ContentDiv, OutsideDiv } from "@/components/Modal/ModalFormStyles";
import { Suspense } from "react";
import ExpandedParcelDetails from "../ExpandedParcelDetails";
import ExpandedParcelDetailsFallback from "../ExpandedParcelDetailsFallback";
import LinkButton from "@/components/Buttons/LinkButton";
import Icon from "@/components/Icons/Icon";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "styled-components";
import { SelectedClientDetails } from "./types";
import { useRouter } from "next/navigation";
import { ConfirmButtons } from "@/components/Buttons/GeneralButtonParts";

interface ParcelsModalProps {
    modalIsOpen: boolean;
    setModalIsOpen: (modalIsOpen: boolean) => void;
    selectedParcelId: string | null;
    selectedClientDetails: SelectedClientDetails | null;
    modalErrorMessage: string | null;
}

const ParcelsModal: React.FC<ParcelsModalProps> = ({
    modalIsOpen,
    setModalIsOpen,
    selectedParcelId,
    selectedClientDetails,
    modalErrorMessage,
}) => {
    const theme = useTheme();
    const router = useRouter();
    return (
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
                router.push("/parcels");
            }}
            headerId="expandedParcelDetailsModal"
            footer={
                <Centerer>
                    <ConfirmButtons>
                        <LinkButton link={`/parcels/edit/${selectedParcelId}`}>
                            Edit Parcel
                        </LinkButton>
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
                        <ExpandedParcelDetails parcelId={selectedParcelId} />
                    </Suspense>
                </ContentDiv>
                {modalErrorMessage && <ErrorSecondaryText>{modalErrorMessage}</ErrorSecondaryText>}
            </OutsideDiv>
        </Modal>
    );
};

export default ParcelsModal;
