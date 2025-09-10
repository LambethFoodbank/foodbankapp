import { EmergencyBagsTableRow } from "./types";
import { ActionsContainer } from "@/components/controlsStyling";

interface PreTableControlsProps {
    selectedEmergencyBagMessage: string | null;
    getCheckedEmergencyBagsData: () => Promise<EmergencyBagsTableRow[]>;
    postCheckedEmergencyBagActivity: () => void;
}

const PreEmergencyBagsTableControls: React.FC<PreTableControlsProps> = (props) => {
    return (
        <>
            {props.selectedEmergencyBagMessage && <span>{props.selectedEmergencyBagMessage}</span>}
            {/*<ActionsContainer>*/}
            {/*    <ActionAndStatusBar*/}
            {/*        fetchSelectedParcels={props.getCheckedEmergencyBagsData}*/}
            {/*        postCheckedParcelActivity={props.postCheckedEmergencyBagActivity}*/}
            {/*    />*/}
            {/*</ActionsContainer>*/}
        </>
    );
};

export default PreEmergencyBagsTableControls;
