import styled from "styled-components";

export const Centerer = styled.div`
    display: flex;
    justify-content: center;
`;

export const SpaceBetween = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

export const FormDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
`;

export const OutsideDiv = styled.div`
    display: flex;
    flex-direction: column;
    max-height: 80vh;
`;

export const ContentDiv = styled.div`
    flex: 0 1 90%;
`;

export const ButtonsDiv = styled.div`
    flex: 0 0 10%;
`;

export const InputContainer = styled.div`
    max-width: 10rem;
`;

export const ButtonCenterer = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
`;
