import { Suspense, useEffect, useRef, useState } from "react";
import { generateReturnPathQueryParam } from "@/common/urlQueryParams";
import ExpandedEmergencyBagDetailsFallback from "../ExpandedEmergencyBagDetailsFallback";
import Modal from "@/components/Modal/Modal";
import { Centerer, ContentDiv, OutsideDiv } from "@/components/Modal/ModalFormStyles";
import LinkButton from "@/components/Buttons/LinkButton";
import Icon from "@/components/Icons/Icon";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "styled-components";
import { ConfirmButtons } from "@/components/Buttons/GeneralButtonParts";
import ExpandedEmergencyBagDetails from "../ExpandedEmergencyBagDetails";

interface EmergencyBagsModalProps {
    modalIsOpen: boolean;
    selectedEmergencyBagId: string | null;
    closeEmergencyBagModal: () => void;
}

const EmergencyBagsModal: React.FC<EmergencyBagsModalProps> = ({
    modalIsOpen,
    selectedEmergencyBagId,
    closeEmergencyBagModal,
}) => {
    const refreshEmergencyBagDetailsRef = useRef<(() => void) | null>(null);

    const [returnPathQueryParamForLinks, setReturnPathQueryParamForLinks] = useState<string | null>(
        null
    );

    const theme = useTheme();

    useEffect(() => {
        setReturnPathQueryParamForLinks(generateReturnPathQueryParam(window.location));
    }, [modalIsOpen]);

    return (
        <>
            <Modal
                header={
                    <>
                        <Icon icon={faBoxArchive} color={theme.primary.largeForeground[2]} />{" "}
                        Emergency Bag Details
                    </>
                }
                isOpen={modalIsOpen}
                onClose={() => {
                    closeEmergencyBagModal();
                }}
                headerId="expandedEmergencyBagDetailsModal"
                footer={
                    <Centerer>
                        <ConfirmButtons>
                            <LinkButton
                                link={`/parcels/edit/${selectedEmergencyBagId}?${returnPathQueryParamForLinks}`}
                            >
                                Edit Emergency Bag
                            </LinkButton>
                        </ConfirmButtons>
                    </Centerer>
                }
            >
                <OutsideDiv>
                    <ContentDiv>
                        <Suspense fallback={<ExpandedEmergencyBagDetailsFallback />}>
                            <ExpandedEmergencyBagDetails
                                emergencyBagId={selectedEmergencyBagId}
                                refreshCallback={(refresh) => {
                                    refreshEmergencyBagDetailsRef.current = refresh;
                                }}
                            />
                        </Suspense>
                    </ContentDiv>
                </OutsideDiv>
            </Modal>
        </>
    );
};

export default EmergencyBagsModal;
