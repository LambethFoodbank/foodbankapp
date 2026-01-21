import styled from "styled-components";
import { ParcelsTableRow } from "../../parcelsTable/types";
import Modal from "@/components/Modal/Modal";
import { ActionName } from "../Actions";
import React from "react";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import { Centerer } from "@/components/Modal/ModalFormStyles";

export interface ActionModalProps extends Omit<React.ComponentProps<typeof Modal>, "children"> {
    selectedParcels: ParcelsTableRow[];
    postSuccessCallback: () => void;
    actionName: ActionName;
}

interface GeneralActionModalProps extends React.ComponentProps<typeof Modal> {
    onClose: () => void;
    errorMessage: string | null;
    successMessage: string | null;
}

export const maxParcelsToShow = 5;

export const Heading = styled.div`
    font-size: 1.2rem;
    margin: 0.3rem;
`;

export const Paragraph = styled.p`
    font-size: 1rem;
    margin: 0.3rem;
`;

export const ModalInner = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
`;

export const WarningMessage = styled.div`
    display: flex;
    justify-content: center;
    color: ${(props) => props.theme.error};
`;

export const GeneralActionModal: React.FC<GeneralActionModalProps> = ({
    onClose,
    successMessage,
    errorMessage,
    children,
    ...rest
}) => {
    return (
        <Modal {...rest} onClose={onClose}>
            <ModalInner>
                {successMessage && (
                    <Centerer>
                        <Heading>{successMessage}</Heading>
                    </Centerer>
                )}
                {errorMessage && (
                    <Centerer>
                        <ErrorSecondaryText>{errorMessage}</ErrorSecondaryText>
                    </Centerer>
                )}
                {children}
            </ModalInner>
        </Modal>
    );
};

export default GeneralActionModal;
